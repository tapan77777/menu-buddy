"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target;
    const formData = new FormData();

    formData.append("name", form.name.value);
    formData.append("email", form.email.value);
    formData.append("password", form.password.value);
    formData.append("confirmPassword", form.confirmPassword.value);
    formData.append("address", form.address.value);
    formData.append("accessCode", form.accessCode.value);
    formData.append("logo", form.logo.files[0]);

    const res = await fetch("/api/register", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Registration successful!");
      router.push("/login");
    } else {
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <main className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center text-black">🍴 Register Your Restaurant</h1>

      {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-4">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <input name="name" type="text" placeholder="Restaurant Name" required className="input" />
        <input name="email" type="email" placeholder="Email" required className="input" />
        <input name="password" type="password" placeholder="Password" required className="input" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" required className="input" />
        <textarea name="address" placeholder="Restaurant Address" required className="input" />
        <input name="logo" type="file" accept="image/*" required className="input" />
        <input name="accessCode" type="text" placeholder="Access Code" required className="input" />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already registered?{" "}
        <a href="/login" className="text-green-600 hover:underline">
          Login here
        </a>
      </p>
    </main>
  );
}
