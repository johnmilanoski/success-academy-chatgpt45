// app/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((c) =>
      c.startsWith("instructor_id=")
    );
    if (cookie) {
      router.replace("/instructor/courses");
    } else {
      router.replace("/signup");
    }
  }, [router]);

  return <p>Checking authentication…</p>;
}
