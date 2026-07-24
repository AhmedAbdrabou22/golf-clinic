-- ============================================================
-- Clinic Management System — Supabase Schema (Phase 1: Core)
-- ============================================================
create extension if not exists "uuid-ossp";

-- USERS (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'doctor')),
  doctor_id uuid, -- linked below via alter (nullable, set for role='doctor')
  created_at timestamptz not null default now()
);

-- DEPARTMENTS
create table public.departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- SERVICES
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  department_id uuid not null references public.departments(id) on delete restrict,
  selling_price numeric(10,2) not null check (selling_price >= 0),
  doctor_base_price numeric(10,2) not null check (doctor_base_price >= 0),
  created_at timestamptz not null default now()
);
create index idx_services_department on public.services(department_id);

-- DOCTORS
create table public.doctors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  department_id uuid not null references public.departments(id) on delete restrict,
  phone text,
  commission_percentage numeric(5,2) not null check (commission_percentage between 0 and 100),
  employment_type text not null check (employment_type in ('fixed_salary', 'hourly')),
  created_at timestamptz not null default now()
);
create index idx_doctors_department on public.doctors(department_id);

alter table public.users
  add constraint fk_users_doctor foreign key (doctor_id) references public.doctors(id) on delete set null;

-- DOCTOR SALARY (fixed or hourly config, versioned by date so history isn't lost)
create table public.doctor_salary (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  monthly_salary numeric(10,2), -- used when employment_type = fixed_salary
  hourly_rate numeric(10,2),    -- used when employment_type = hourly
  working_hours numeric(6,2),   -- used when employment_type = hourly
  effective_from date not null default current_date,
  created_at timestamptz not null default now()
);
create index idx_doctor_salary_doctor on public.doctor_salary(doctor_id);

-- PATIENTS
create table public.patients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  age int,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_patients_phone on public.patients(phone);
create index idx_patients_name on public.patients(name);

-- PATIENT FORMS
create sequence public.form_number_seq start 1;

create table public.patient_forms (
  id uuid primary key default uuid_generate_v4(),
  form_number text not null unique default ('F-' || lpad(nextval('public.form_number_seq')::text, 6, '0')),
  patient_id uuid not null references public.patients(id) on delete restrict,
  doctor_id uuid not null references public.doctors(id) on delete restrict,
  department_id uuid not null references public.departments(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  diagnosis text,
  notes text,
  sessions_count int not null default 1 check (sessions_count > 0),
  completed_sessions int not null default 0 check (completed_sessions >= 0),
  customer_price numeric(10,2) not null,
  doctor_base_price numeric(10,2) not null,
  doctor_commission numeric(10,2) not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  check (completed_sessions <= sessions_count)
);
create index idx_forms_patient on public.patient_forms(patient_id);
create index idx_forms_doctor on public.patient_forms(doctor_id);
create index idx_forms_status on public.patient_forms(payment_status);
create index idx_forms_created on public.patient_forms(created_at);

-- SESSIONS
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references public.patient_forms(id) on delete cascade,
  session_date date not null default current_date,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);
create index idx_sessions_form on public.sessions(form_id);

-- CASH TRANSACTIONS (single source of truth — balance is always derived)
create table public.cash_transactions (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('income', 'expense')),
  amount numeric(10,2) not null check (amount > 0),
  description text,
  related_form_id uuid references public.patient_forms(id) on delete set null,
  related_expense_id uuid, -- FK added after expenses table exists
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index idx_cash_tx_date on public.cash_transactions(transaction_date);
create index idx_cash_tx_type on public.cash_transactions(type);

-- EXPENSES
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('rent', 'salaries', 'utilities', 'equipment', 'supplies', 'other')),
  amount numeric(10,2) not null check (amount > 0),
  expense_date date not null default current_date,
  description text,
  created_at timestamptz not null default now()
);

alter table public.cash_transactions
  add constraint fk_cash_tx_expense foreign key (related_expense_id) references public.expenses(id) on delete set null;

-- DOCTOR COMMISSIONS (materialized per paid form — one row per form, auto-created on payment)
create table public.doctor_commissions (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  form_id uuid not null unique references public.patient_forms(id) on delete cascade,
  commission_amount numeric(10,2) not null,
  created_at timestamptz not null default now()
);
create index idx_commissions_doctor on public.doctor_commissions(doctor_id);

-- ============================================================
-- Business rule enforced in DB: commission = doctor_base_price * percentage
-- Trigger: on form insert/update, auto-calc doctor_commission
-- ============================================================
create or replace function public.calc_doctor_commission()
returns trigger as $$
declare
  pct numeric(5,2);
begin
  select commission_percentage into pct from public.doctors where id = new.doctor_id;
  new.doctor_commission := round(new.doctor_base_price * (pct / 100), 2);
  return new;
end;
$$ language plpgsql;

create trigger trg_calc_commission
before insert or update of doctor_base_price, doctor_id on public.patient_forms
for each row execute function public.calc_doctor_commission();

-- Trigger: on marking a form as paid, create cash income + commission record
create or replace function public.handle_form_paid()
returns trigger as $$
begin
  if new.payment_status = 'paid' and old.payment_status is distinct from 'paid' then
    insert into public.cash_transactions (type, amount, description, related_form_id, transaction_date)
    values ('income', new.customer_price, 'Payment for form ' || new.form_number, new.id, current_date);

    insert into public.doctor_commissions (doctor_id, form_id, commission_amount)
    values (new.doctor_id, new.id, new.doctor_commission)
    on conflict (form_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_form_paid
after update of payment_status on public.patient_forms
for each row execute function public.handle_form_paid();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.departments enable row level security;
alter table public.services enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_salary enable row level security;
alter table public.patients enable row level security;
alter table public.patient_forms enable row level security;
alter table public.sessions enable row level security;
alter table public.cash_transactions enable row level security;
alter table public.expenses enable row level security;
alter table public.doctor_commissions enable row level security;
alter table public.users enable row level security;

-- Admin: full access on everything
create policy admin_all_departments on public.departments for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_services on public.services for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_doctors on public.doctors for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_doctor_salary on public.doctor_salary for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_patients on public.patients for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_forms on public.patient_forms for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_sessions on public.sessions for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_cash on public.cash_transactions for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_expenses on public.expenses for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy admin_all_commissions on public.doctor_commissions for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy users_self on public.users for select using (id = auth.uid());

-- Doctor: read-only access to own forms/sessions/commissions (ready for Phase 2)
create policy doctor_read_own_forms on public.patient_forms for select
  using (doctor_id in (select doctor_id from public.users where id = auth.uid()));
create policy doctor_read_own_commissions on public.doctor_commissions for select
  using (doctor_id in (select doctor_id from public.users where id = auth.uid()));
