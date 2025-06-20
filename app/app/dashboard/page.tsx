// app/app/dashboard/page.tsx
"use client";

import { useAuth } from '../../contexts/AuthContext'; // Adjust path if necessary
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (!user) {
    // This should ideally not happen if middleware is working correctly,
    // but as a fallback or if middleware allows non-authed users for some reason.
    return (
      <div>
        <p className="text-gray-700">You are not logged in.</p>
        <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-700">Welcome to your dashboard, {user.name}!</p>
      <p className="mt-4">
        <Link href="/instructor/courses" className="text-blue-600 hover:underline">View My Courses</Link>
      </p>
      {/* Add more dashboard content here later */}
    </div>
  );
}
