"use client";

import HomeIconButton from "@/components/HomeIconButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);




  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      localStorage.setItem("token", data.token);
      router.push("/admin/dashboard");
    } else {
      setError(data.error || "Login failed");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-red-100 px-4 relative overflow-hidden">
      {/* Background branding */}
      <HomeIconButton/>
      <h1 className="absolute text-[6rem] md:text-[10rem] font-bold text-rose-200 opacity-10 select-none z-0 top-12 left-1/2 -translate-x-1/2">
        MenuBuddy
      </h1>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl z-10">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          🔐 Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5 text-black">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              className="w-full px-4 py-2 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-sm text-gray-500 hover:text-red-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <p className="text-red-600 text-sm text-center -mt-2">{error}</p>
          )}
        </form>

        <div className="mt-5 text-center">
          {/* <Link
            href="/forgot-password"
            className="text-red-600 hover:underline text-sm"
          >
            Forgot Password?
          </Link> */}
          <Link
            href="/register"
            className="text-red-600 hover:underline text-sm"
          >
            Register
          </Link>
          
        </div>
      </div>
    </main>
  );
}
