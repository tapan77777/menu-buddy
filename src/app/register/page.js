"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    logoUrl: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    setLoading(false);

    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/admin/dashboard");
    } else {
      alert(data.error || "Registration failed");
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">🍽️ Register Your Restaurant</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" onChange={handleChange} required placeholder="Restaurant Name" className="input" />
        <input name="email" type="email" onChange={handleChange} required placeholder="Email" className="input" />
        <input name="password" type="password" onChange={handleChange} required placeholder="Password" className="input" />
        <input name="address" onChange={handleChange} required placeholder="Address" className="input" />
        <input name="logoUrl" onChange={handleChange} placeholder="Logo URL" className="input" />

        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </main>
  );
}
