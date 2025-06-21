// app/app/dashboard/page.tsx
"use client";

import { useAuth } from '../../contexts/AuthContext'; // Adjust path if necessary
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-xl text-center p-8">Loading dashboard, please wait...</p>;
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-4">You are not currently logged in or your session has expired.</p>
        <Link href="/login" className="text-blue-600 hover:underline">Please go to Login page</Link>
      </div>
    );
  }

  // User is present, check for user.name
  if (!user.name) {
    // This case implies the user object is present but malformed (missing name)
    // or the User interface in AuthContext is not being adhered to by the data source.
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-orange-600 mb-4">Dashboard Information Incomplete</h1>
        <p className="text-gray-700">Welcome to your dashboard! However, some user details (like your name) could not be displayed.</p>
        <p className="text-gray-700 mb-4">You can still access your courses.</p>
        <p className="mt-4">
          <Link href="/instructor/courses" className="text-blue-600 hover:underline">View My Courses</Link>
        </p>
        {/* Optionally, include a way to report this issue or retry fetching user data */}
      </div>
    );
  }

  // Happy path: user and user.name are present
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-lg text-gray-700 mb-6">Welcome to your dashboard, {user.name}!</p>
      <p>
        <Link href="/instructor/courses" className="text-blue-600 hover:underline text-lg">View My Courses</Link>
      </p>
      {/* Add more dashboard content here later */}
    </div>
  );
}
