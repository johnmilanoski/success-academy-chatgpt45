"use client";

import Link from "next/link";

export default function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">This Month</p>
          <p className="text-2xl font-semibold">$2,500.00</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Total Earnings</p>
          <p className="text-2xl font-semibold">$12,200.00</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Next Payout</p>
          <p className="text-2xl font-semibold">$1,250.00</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
        <div className="flex gap-4">
          <Link href="/create-course">
            <button className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
              Create New Course
            </button>
          </Link>
          <button className="px-4 py-2 bg-white border rounded shadow hover:bg-gray-100">
            My Courses
          </button>
          <button className="px-4 py-2 bg-white border rounded shadow hover:bg-gray-100">
            Affiliate Dashboard
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <ul className="divide-y divide-gray-200">
          <li className="py-2 flex justify-between">
            <span>John Doe enrolled in &quot;Digital Marketing Mastery&quot;</span>
            <span className="text-sm text-gray-500">2 hrs ago</span>
          </li>
          <li className="py-2 flex justify-between">
            <span>Jane Smith enrolled in &quot;Photography Essentials&quot;</span>
            <span className="text-sm text-gray-500">5 hrs ago</span>
          </li>
          <li className="py-2 flex justify-between">
            <span>Mike Johnson completed &quot;Intro to Python&quot;</span>
            <span className="text-sm text-gray-500">8 hrs ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
