// app/app/student/catalog/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
  price: number;
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch("/api/student/catalog");
        const data = await res.json();
        setCourses(data.courses);
      } catch (err) {
        console.error("Failed to load catalog", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Course Catalog</h1>
      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses available.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-4 bg-white rounded shadow flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">{course.title}</h2>
                <p className="text-gray-600">${course.price.toFixed(2)}</p>
              </div>
              <Link
                href={`/student/purchase?courseId=${course.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Purchase
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
