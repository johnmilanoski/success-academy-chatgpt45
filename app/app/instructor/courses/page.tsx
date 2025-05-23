"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
  category: string;
  price: number;
  visibility: string;
  published: boolean;
}

export default function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/instructor/courses");
      const data = await res.json();
      setCourses(data.courses);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Link
          href="/create-course"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create New Course
        </Link>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>You haven’t created any courses yet.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-4 bg-white rounded shadow hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-gray-600">
                    {course.category} • ${course.price.toFixed(2)} •{" "}
                    {course.visibility}
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium ${
                      course.published ? "text-green-600" : "text-yellow-500"
                    }`}
                  >
                    {course.published ? "Published" : "Draft"}
                  </p>
                </div>
                <Link
                  href={`/instructor/preview/${course.id}`}
                  className="text-blue-600 text-sm underline hover:text-blue-800"
                >
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
