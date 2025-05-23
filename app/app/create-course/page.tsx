"use client";

import { useState } from "react";

export default function CreateCourse() {
  const [step, setStep] = useState(1);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseVisibility, setCourseVisibility] = useState("Public");

  const [modules, setModules] = useState([
    { title: "", lessons: [{ title: "", file: null as File | null }] },
  ]);

  const addModule = () =>
    setModules([
      ...modules,
      { title: "", lessons: [{ title: "", file: null }] },
    ]);

  const addLesson = (mi: number) => {
    const newModules = [...modules];
    newModules[mi].lessons.push({ title: "", file: null });
    setModules(newModules);
  };

  const handleModuleTitleChange = (mi: number, value: string) => {
    const newModules = [...modules];
    newModules[mi].title = value;
    setModules(newModules);
  };

  const handleLessonChange = (
    mi: number,
    li: number,
    value: string
  ) => {
    const newModules = [...modules];
    newModules[mi].lessons[li].title = value;
    setModules(newModules);
  };

  const handleFileChange = (mi: number, li: number, file: File) => {
    const newModules = [...modules];
    newModules[mi].lessons[li].file = file;
    setModules(newModules);
  };

  const handlePreview = async () => {
    const formData = new FormData();
    formData.append("title", courseTitle);
    formData.append("description", courseDescription);
    formData.append("category", courseCategory);
    formData.append("price", coursePrice);
    formData.append("visibility", courseVisibility);
    formData.append(
      "modules",
      JSON.stringify(
        modules.map((m) => ({
          title: m.title,
          lessons: m.lessons.map((l) => ({ title: l.title })),
        }))
      )
    );

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.courseId) {
        window.location.href = `/instructor/preview/${data.courseId}`;
      } else {
        alert("Failed to create course draft.");
      }
    } catch (err) {
      console.error("❌ Preview error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Create a New Course</h1>

        <ul className="flex gap-4 text-sm mb-8">
          {["Course Details", "Curriculum", "Pricing", "Review"].map(
            (label, idx) => (
              <li
                key={label}
                className={
                  step === idx + 1
                    ? "text-blue-500 font-semibold"
                    : "text-gray-400"
                }
              >
                {idx + 1}. {label}
              </li>
            )
          )}
        </ul>

        {step === 1 && (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <input
                type="text"
                placeholder="Course Title"
                className="w-full px-4 py-2 border rounded mb-4"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-2 border rounded mb-4 h-28"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
              />
              <select
                className="w-full px-4 py-2 border rounded"
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                <option>Marketing</option>
                <option>Programming</option>
                <option>Health</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-blue-500 text-white rounded shadow"
              >
                Next: Curriculum →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              {modules.map((mod, mi) => (
                <div key={mi} className="border p-4 rounded mb-4">
                  <input
                    type="text"
                    placeholder={`Module ${mi + 1} Title`}
                    className="w-full mb-2 px-3 py-2 border rounded"
                    value={mod.title}
                    onChange={(e) =>
                      handleModuleTitleChange(mi, e.target.value)
                    }
                  />
                  {mod.lessons.map((les, li) => (
                    <div key={li} className="mb-2">
                      <input
                        type="text"
                        placeholder={`Lesson ${li + 1} Title`}
                        className="w-full mb-1 px-3 py-2 border rounded"
                        value={les.title}
                        onChange={(e) =>
                          handleLessonChange(mi, li, e.target.value)
                        }
                      />
                      <input
                        type="file"
                        className="w-full text-sm"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileChange(mi, li, e.target.files[0])
                        }
                      />
                      {les.file && (
                        <p className="text-xs text-gray-600 mt-1">
                          Attached: {les.file.name}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addLesson(mi)}
                    className="text-blue-500 text-sm mt-2 hover:underline"
                  >
                    + Add Lesson
                  </button>
                </div>
              ))}
              <button
                onClick={addModule}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                + Add Module
              </button>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-300 rounded"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-blue-500 text-white rounded shadow"
              >
                Next: Pricing →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <input
                type="number"
                placeholder="Price ($)"
                className="w-full px-4 py-2 border rounded mb-4"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
              />
              <select
                className="w-full px-4 py-2 border rounded"
                value={courseVisibility}
                onChange={(e) => setCourseVisibility(e.target.value)}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-gray-300 rounded"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-blue-500 text-white rounded shadow"
              >
                Next: Review →
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <p>
                <strong>Title:</strong> {courseTitle}
              </p>
              <p>
                <strong>Description:</strong> {courseDescription}
              </p>
              <p>
                <strong>Category:</strong> {courseCategory}
              </p>
              <p>
                <strong>Price:</strong> ${coursePrice}
              </p>
              <p>
                <strong>Visibility:</strong> {courseVisibility}
              </p>
              <p className="mt-4 font-semibold">Modules & Lessons:</p>
              <ul className="list-disc list-inside">
                {modules.map((m, mi) => (
                  <li key={mi}>
                    {m.title}
                    <ul className="list-disc list-inside ml-4">
                      {m.lessons.map((l, li) => (
                        <li key={li}>
                          {l.title}{" "}
                          {l.file && (
                            <span className="text-xs text-gray-500">
                              (Attached: {l.file.name})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-gray-300 rounded"
              >
                ← Back
              </button>
              <button
                onClick={handlePreview}
                className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
              >
                Preview Course
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
