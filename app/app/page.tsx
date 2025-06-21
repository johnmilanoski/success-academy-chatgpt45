// app/app/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from '../contexts/AuthContext'; // Path to AuthContext

export default function InstructorDashboard() {
  const { user, isLoading } = useAuth();

  let userNameDisplay;
  if (isLoading) {
    userNameDisplay = <p className="text-lg text-gray-700">Loading user information...</p>;
  } else if (!user) {
    userNameDisplay = <p className="text-lg text-red-600">Could not load user information. Are you logged in?</p>;
  } else if (user.name && user.name.trim() !== "") {
    userNameDisplay = <p className="text-xl font-semibold text-gray-800">Welcome, {user.name}!</p>;
  } else {
    // User is present, but name is empty or whitespace
    // Schema says name is NOT NULL, so it should be a string.
    userNameDisplay = <p className="text-lg text-orange-500">Welcome! (User name &apos;{user.name}&apos; is blank or not available)</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="mb-6 flex flex-col"> {/* Changed to flex-col for better stacking of title and user name */}
        <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1> {/* Adjusted text color for visibility */}
        <div className="mt-2">{userNameDisplay}</div> {/* Added margin-top for spacing */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">This Month</p> {/* Adjusted text color */}
          <p className="text-2xl font-semibold text-gray-900">$2,500.00</p> {/* Adjusted text color */}
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Total Earnings</p> {/* Adjusted text color */}
          <p className="text-2xl font-semibold text-gray-900">$12,200.00</p> {/* Adjusted text color */}
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Next Payout</p> {/* Adjusted text color */}
          <p className="text-2xl font-semibold text-gray-900">$1,250.00</p> {/* Adjusted text color */}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Quick Links</h2> {/* Adjusted text color & size */}
        <div className="flex flex-wrap gap-4"> {/* Added flex-wrap */}
          <Link href="/create-course">
            <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"> {/* Adjusted colors */}
              Create New Course
            </button>
          </Link>
          {/* Assuming My Courses and Affiliate Dashboard might be links or future features */}
          <Link href="/instructor/courses">
            <button className="px-4 py-2 bg-gray-200 text-gray-800 border rounded shadow hover:bg-gray-300"> {/* Adjusted colors */}
              My Courses
            </button>
          </Link>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 border rounded shadow hover:bg-gray-300"> {/* Adjusted colors */}
            Affiliate Dashboard (Coming Soon)
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2> {/* Adjusted text color & size */}
        <ul className="divide-y divide-gray-300"> {/* Adjusted divider color */}
          <li className="py-3 flex justify-between items-center"> {/* Adjusted padding & alignment */}
            <span className="text-gray-700">John Doe enrolled in &quot;Digital Marketing Mastery&quot;</span>
            <span className="text-sm text-gray-500">2 hrs ago</span>
          </li>
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700">Jane Smith enrolled in &quot;Photography Essentials&quot;</span>
            <span className="text-sm text-gray-500">5 hrs ago</span>
          </li>
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700">Mike Johnson completed &quot;Intro to Python&quot;</span>
            <span className="text-sm text-gray-500">8 hrs ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
