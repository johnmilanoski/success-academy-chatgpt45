"use client";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function PurchasePage() {
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get("courseId"));

  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/student/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: Number(studentId),
          courseId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Purchase failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Purchase Complete</h1>
        <p>Thank you for your purchase.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-4">Purchase Course</h1>
        {error && <p className="mb-4 text-red-600">{error}</p>}
        <input type="hidden" value={courseId} />
        <label className="block mb-4 text-gray-700">
          Student ID
          <input
            type="number"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full mt-1 p-2 border rounded text-gray-900"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Purchase"}
        </button>
      </form>
    </div>
  );
}
