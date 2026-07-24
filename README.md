# نظام إدارة العيادة

## 1) تثبيت المشروع

```bash
npm install
```

## 2) إنشاء مشروع Supabase

1. روح على https://supabase.com وسجّل حساب (مجاني).
2. اعمل **New Project** واختار باسورد لقاعدة البيانات (احفظه).
3. من الشمال: **SQL Editor** → **New query**.
4. افتح ملف `supabase-schema.sql` (اللي جوه المشروع)، انسخ كل المحتوى، الصقه في الـ SQL Editor، ودوس **Run**.
   - ده هيبني كل الجداول + الحسابات التلقائية (العمولات والكاش) + صلاحيات الوصول.

## 3) ربط المشروع بـ Supabase

1. من Supabase: **Project Settings** → **API**.
2. هتلاقي:
   - **Project URL**
   - **anon public key**
3. في المشروع، اعمل نسخة من `.env.local.example` باسم `.env.local`:

```bash
cp .env.local.example .env.local
```

4. افتح `.env.local` واملأ القيمتين:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

## 4) إضافة أول مستخدم Admin

1. من Supabase: **Authentication** → **Users** → **Add user** (حط إيميل وباسورد).
2. من **SQL Editor** نفّذ (غيّر الإيميل حسب اللي سجلته):

```sql
insert into public.users (id, full_name, role)
select id, 'Admin', 'admin' from auth.users where email = 'YOUR_EMAIL_HERE';
```

## 5) بيانات تجريبية (اختياري لتجربة موديول المرضى فورًا)

```sql
insert into public.departments (name) values ('التغذية العلاجية'), ('الجلدية');

insert into public.services (name, department_id, selling_price, doctor_base_price)
select 'كشف', id, 150, 100 from public.departments where name = 'التغذية العلاجية';

insert into public.doctors (name, department_id, phone, commission_percentage, employment_type)
select 'د. أحمد علي', id, '01000000000', 40, 'fixed_salary' from public.departments where name = 'التغذية العلاجية';
```

## 6) تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على: http://localhost:3000 — هيوجهك لموديول **المرضى** مباشرة.

## حالة المشروع

**جاهز الآن:**
- تسجيل دخول/خروج (Supabase Auth) + حماية كل الصفحات
- لوحة تحكم برقم إيراد اليوم/الشهر، عدد المرضى/الفورمات/الأطباء/الخدمات، المصروفات، صافي الربح، المدفوعات المعلّقة، عمولات الأطباء
- المرضى والفورمات بالكامل (إضافة/تعديل/حذف، فورم زيارة، تسجيل الدفع، متابعة الجلسات)
- الأقسام والخدمات (CRUD كامل، مرتبطين ببعض)
- الأطباء (CRUD كامل، مرتب ثابت أو بالساعة)
- الكاش (رصيد محسوب تلقائيًا من الحركات، إضافة مصروفات، عرض كل الحركات)

كله متصل بقاعدة البيانات فعليًا عن طريق Supabase — مفيش بيانات وهمية.

**قريبًا:** التقارير التفصيلية، البحث الشامل، صلاحيات الدكتور المحدودة، الرسوم البيانية.
