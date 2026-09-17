"use client";

import { useIngelogd } from "@/lib/admin-auth";
import { BeheerLoginForm } from "@/components/beheer/BeheerLoginForm";
import { BeheerNav } from "@/components/beheer/BeheerNav";

export default function BeheerLayout({ children }: { children: React.ReactNode }) {
  const ingelogd = useIngelogd();

  if (!ingelogd) {
    return <BeheerLoginForm />;
  }

  return (
    <div className="flex flex-1">
      <BeheerNav />
      <main className="flex-1 overflow-y-auto bg-gray-50 px-8 py-10">{children}</main>
    </div>
  );
}
