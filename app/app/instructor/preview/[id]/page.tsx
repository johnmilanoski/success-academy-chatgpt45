"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Lesson {
  id: number;
  title: string;
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  visibility: string;
  published: boolean;
  modules: Module[];
}

export default function PreviewPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const res = await fetch(`/api/courses/${id}`);
      const data = await res.json();
      setCourse(data.course);
    };
    fetchCourse();
  }, [id]);

  const handlePublish = async () => {
    const res = await fetch(`/api/courses/${id}/publish`, {
      method: "POST",
    });
    if (res.ok) {
      alert("Course published!");
      // Optional: redirect to dashboard
      // window.location.href = "/instructor/courses";
    } else {
      alert("Failed to publish.");
    }
  };

  if (!course) return <p className="p-6">Loading course...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <p className="mb-4">{course.description}</p>
      <p><strong>Category:</strong> {course.category}</p>
      <p><strong>Price:</strong> ${course.price}</p>
      <p><strong>Visibility:</strong> {course.visibility}</p>
      <p className="mt-6 font-semibold">Modules & Lessons:</p>
      <ul className="list-disc list-inside">
        {course.modules.map((mod) => (
          <li key={mod.id}>
            {mod.title}
            <ul className="list-disc list-inside ml-4">
              {mod.lessons.map((lesson) => (
                <li key={lesson.id}>{lesson.title}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {!course.published && (
        <button
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handlePublish}
        >
          Publish Course
        </button>
      )}
    </div>
  );
}
