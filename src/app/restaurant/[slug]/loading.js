// /app/restaurant/[slug]/loading.js
"use client";

import logo from "@/public/menubuddy-logo.png"; // <-- put logo into /public and rename
import Image from "next/image";

export default function Loading() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#ffdee2] via-[#ffd7d1] to-[#ffc7fc] flex flex-col justify-center items-center overflow-hidden relative">

      {/* FLOATING GLOW CIRCLES */}
      <div className="absolute top-[-80px] left-[-80px] w-60 h-60 bg-white/10 rounded-full blur-3xl animate-bounce-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-bounce-slower"></div>

      {/* ROTATING ARC BEHIND LOGO */}
      <div className="absolute w-56 h-56 border-4 border-transparent border-t-red-500 border-r-yellow-400 rounded-full animate-spin-slow opacity-70"></div>

      {/* MAIN LOGO */}
      <div className="relative z-20 animate-float">
        <Image
          src={logo}
          alt="MenuBuddy Logo"
          width={200}
          height={200}
          className="drop-shadow-xl rounded-xl"
          priority
        />
      </div>

      {/* TITLE */}
      <h1 className="mt-6 text-2xl font-bold text-white drop-shadow-lg animate-fadeIn">
        Loading Menu…
      </h1>

      {/* GRADIENT PROGRESS BAR */}
      <div className="w-64 h-2 bg-white/30 rounded-full mt-6 overflow-hidden shadow-inner">
        <div className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-yellow-400 animate-progress"></div>
      </div>

      {/* SHINING OVERLAY */}
      <div className="absolute w-full h-full top-0 left-0 pointer-events-none animate-shine"></div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 1.2s ease-in-out forwards;
        }
        .animate-progress {
          animation: progress 1.8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce 5s infinite alternate ease-in-out;
        }
        .animate-bounce-slower {
          animation: bounce 7s infinite alternate-reverse ease-in-out;
        }
        .animate-shine {
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255,255,255,0.15) 50%,
            transparent 100%
          );
          animation: shineMove 2.4s infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(0); }
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes progress {
          0% { width: 0%; }
          50% { width: 90%; }
          100% { width: 0%; }
        }

        @keyframes bounce {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-20px) scale(1.08); }
        }

        @keyframes shineMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
