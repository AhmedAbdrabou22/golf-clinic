import Link from "next/link";
import {
  Users,
  LayoutDashboard,
  Stethoscope,
  Wallet,
  Boxes,
  Contact,
  Pill,
  Syringe,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

const NAV_ITEMS = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/patients", label: "المرضى", icon: Users },
  { href: "/doctors", label: "الأطباء", icon: Stethoscope },
  { href: "/departments-services", label: "الأقسام والخدمات", icon: Boxes },
  { href: "/reports/doctors", label: "تقرير الاطباء ", icon: Boxes },
  { href: "/follow-ups", label: "متابعات اليوم", icon: Boxes },
  { href: "/staff", label: "رواتب العمال", icon: Contact },
  { href: "/medications", label: "الأدوية", icon: Pill },
  { href: "/meso-products", label: "منتجات الميزو", icon: Syringe },
  { href: "/cashbox", label: "الكاش", icon: Wallet },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" dir="rtl">
      <aside className="w-64 border-l bg-card p-4 shrink-0">
        <h1 className="text-lg font-bold mb-6 px-2">نظام إدارة العيادة</h1>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t pt-3">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}