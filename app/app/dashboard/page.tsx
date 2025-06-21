// app/app/dashboard/page.tsx
"use client";

import { useAuth } from '../../contexts/AuthContext'; // Adjust path if necessary
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-xl text-center p-8">DEBUG: State is LOADING dashboard, please wait...</p>;
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">DEBUG: State is ACCESS DENIED</h1>
        <p className="text-gray-700 mb-4">You are not currently logged in or your session has expired.</p>
        <Link href="/login" className="text-blue-600 hover:underline">Please go to Login page</Link>
      </div>
    );
  }

  // User is present, let's debug user.name
  const userName = user.name; // Guaranteed to be a string by schema (NOT NULL)
  const userNameType = typeof userName;

  if (userName === "") {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-orange-600 mb-4">DEBUG: State is USER_NAME_EMPTY_STRING</h1>
        <p className="text-gray-700">User name is present but is an empty string.</p>
        <p className="text-gray-700 mb-4">Debug info: user.name is type '{userNameType}', value: '[{userName}]'</p>
        <p className="mt-4">
          <Link href="/instructor/courses" className="text-blue-600 hover:underline">View My Courses</Link>
        </p>
      </div>
    );
  }

  if (userName.trim() === "") {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-yellow-500 mb-4">DEBUG: State is USER_NAME_WHITESPACE</h1>
        <p className="text-gray-700">User name is present but consists only of whitespace.</p>
        <p className="text-gray-700 mb-4">Debug info: user.name is type '{userNameType}', value: '[{userName}]'</p>
        <p className="mt-4">
          <Link href="/instructor/courses" className="text-blue-600 hover:underline">View My Courses</Link>
        </p>
      </div>
    );
  }

  // Happy path: user and user.name are present and non-empty/non-whitespace
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">DEBUG: State is USER_NAME_PRESENT (Dashboard)</h1>
      <p className="text-lg text-gray-700 mb-6">Welcome to your dashboard, {userName}!</p>
      <p className="text-gray-700 mb-4">Debug info: user.name is type '{userNameType}', value: '[{userName}]'</p>
      <p>
        <Link href="/instructor/courses" className="text-blue-600 hover:underline text-lg">View My Courses</Link>
      </p>
      {/* Add more dashboard content here later */}
    </div>
  );
}
