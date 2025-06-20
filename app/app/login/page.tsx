// app/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '../../contexts/AuthContext'; // Adjusted path

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth(); // Get refreshUser from context

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Added state for password visibility
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
    } else {
      // On success, refresh user state and redirect
      await refreshUser();
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Log In</h1>

        {error && (
          <p className="mb-4 text-red-600 text-center">{error}</p>
        )}

        <label className="block mb-2 text-gray-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border rounded text-gray-900"
          />
        </label>

        <label className="block mb-4 text-gray-700">
          Password
          <input
            type={showPassword ? 'text' : 'password'} // Dynamic type
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-2 border rounded text-gray-900"
          />
          <div className="mt-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="mr-1"
            />
            <span className="text-sm text-gray-600">Show password</span>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-700">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
}
