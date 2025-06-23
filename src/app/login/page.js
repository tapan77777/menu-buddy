"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;

    const email = form.email.value;
    const password = form.password.value;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      // ✅ Store token
      localStorage.setItem("token", data.token);

      // ✅ Redirect to dashboard
      router.push("/admin/dashboard");
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔐 Admin Login</h1>

      <form onSubmit={handleLogin} className="bg-white p-4 rounded shadow">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="input mb-3"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="input mb-4"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Login
        </button>

        {error && <p className="mt-4 text-red-600">{error}</p>}
      </form>
    </main>
  );
}
