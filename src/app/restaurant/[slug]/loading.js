"use client";

export default function Loading() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex flex-col justify-center items-center overflow-hidden relative">

      {/* ANIMATED GRADIENT BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 via-orange-100/50 to-amber-100/50 animate-gradient"></div>

      {/* AMBIENT BACKGROUND ELEMENTS */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-rose-200/40 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-transparent rounded-full blur-3xl animate-pulse-slower"></div>
      
      {/* ORBITING PARTICLES */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute w-40 h-40 animate-orbit">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-400 rounded-full shadow-lg"></div>
        </div>
        <div className="absolute w-48 h-48 animate-orbit-reverse">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-lg"></div>
        </div>
        <div className="absolute w-56 h-56 animate-orbit-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full shadow-lg"></div>
        </div>
      </div>
      
      {/* MAIN LOADING CONTAINER */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* ANIMATED ICON - Fork & Knife */}
        <div className="relative w-32 h-32 mb-8">
          {/* Rotating Outer Ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-rose-400 border-r-rose-300 rounded-full animate-spin-smooth"></div>
          
          {/* Counter-rotating Middle Ring */}
          <div className="absolute inset-3 border-4 border-transparent border-b-amber-400 border-l-amber-300 rounded-full animate-spin-reverse-smooth"></div>
          
          {/* Pulsing Inner Ring */}
          <div className="absolute inset-6 border-2 border-orange-300/50 rounded-full animate-pulse-ring"></div>
          
          {/* Fork - Animated */}
          <div className="absolute left-1/2 top-1/2 -translate-x-10 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full animate-utensil-left shadow-lg">
            <div className="absolute -top-2 left-0 w-1.5 h-2 bg-rose-500 rounded-full"></div>
            <div className="absolute -top-2 -left-2 w-1.5 h-2 bg-rose-500 rounded-full"></div>
            <div className="absolute -top-2 left-2 w-1.5 h-2 bg-rose-500 rounded-full"></div>
          </div>
          
          {/* Knife - Animated */}
          <div className="absolute left-1/2 top-1/2 translate-x-8 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full animate-utensil-right shadow-lg">
            <div className="absolute -top-3 -left-1.5 w-4 h-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-tl-full rounded-tr-sm clip-knife"></div>
          </div>
          
          {/* Center Pulsing Dot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-rose-400 via-orange-400 to-amber-400 rounded-full animate-pulse-center shadow-lg"></div>
          
          {/* Sparkle Effects */}
          <div className="absolute left-1/4 top-1/4 w-1 h-1 bg-white rounded-full animate-sparkle-1"></div>
          <div className="absolute right-1/4 top-1/3 w-1 h-1 bg-white rounded-full animate-sparkle-2"></div>
          <div className="absolute left-1/3 bottom-1/4 w-1 h-1 bg-white rounded-full animate-sparkle-3"></div>
        </div>

        {/* TEXT - Animated */}
        <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-2 animate-fade-scale">
          MenuBuddy
        </h2>
        <p className="text-gray-600 text-sm font-medium tracking-wide animate-fade-in-delay">
          Preparing your dining experience...
        </p>

        {/* ANIMATED PROGRESS DOTS */}
        <div className="flex gap-2.5 mt-8">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full animate-bounce-dot shadow-lg" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full animate-bounce-dot shadow-lg" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full animate-bounce-dot shadow-lg" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-72 h-1.5 bg-gray-200/50 rounded-full mt-6 overflow-hidden shadow-inner backdrop-blur-sm">
          <div className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 animate-progress-bar shadow-lg"></div>
        </div>
      </div>

      {/* FLOATING PARTICLES - Enhanced */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-rose-400/60 rounded-full animate-float-particle-1 blur-sm"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-amber-400/60 rounded-full animate-float-particle-2 blur-sm"></div>
      <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-orange-400/60 rounded-full animate-float-particle-3 blur-sm"></div>
      <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-rose-300/60 rounded-full animate-float-particle-4 blur-sm"></div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes spin-smooth {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse-smooth {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes utensil-left {
          0%, 100% { 
            transform: translateX(-40px) translateY(-50%) rotate(-20deg); 
            opacity: 1;
          }
          50% { 
            transform: translateX(-34px) translateY(-50%) rotate(-12deg); 
            opacity: 0.9;
          }
        }
        
        @keyframes utensil-right {
          0%, 100% { 
            transform: translateX(32px) translateY(-50%) rotate(20deg); 
            opacity: 1;
          }
          50% { 
            transform: translateX(38px) translateY(-50%) rotate(12deg); 
            opacity: 0.9;
          }
        }
        
        @keyframes pulse-center {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.3); 
            opacity: 0.8; 
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.12); }
        }
        
        @keyframes fade-scale {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes fade-in-delay {
          0% { opacity: 0; transform: translateY(10px); }
          30% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-dot {
          0%, 60%, 100% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-12px) scale(1.1); }
        }
        
        @keyframes progress-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes float-particle-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          33% { transform: translate(30px, -40px) scale(1.2); opacity: 0.7; }
          66% { transform: translate(-20px, -20px) scale(0.9); opacity: 0.5; }
        }
        
        @keyframes float-particle-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          33% { transform: translate(-35px, 30px) scale(1.1); opacity: 0.6; }
          66% { transform: translate(15px, -15px) scale(0.95); opacity: 0.4; }
        }
        
        @keyframes float-particle-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
          33% { transform: translate(25px, -35px) scale(1.15); opacity: 0.65; }
          66% { transform: translate(-30px, 10px) scale(0.85); opacity: 0.45; }
        }
        
        @keyframes float-particle-4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(-20px, -30px) scale(1.2); opacity: 0.6; }
        }
        
        @keyframes sparkle-1 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes sparkle-2 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes sparkle-3 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }

        .animate-spin-smooth {
          animation: spin-smooth 3s linear infinite;
        }
        
        .animate-spin-reverse-smooth {
          animation: spin-reverse-smooth 4s linear infinite;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        
        .animate-utensil-left {
          animation: utensil-left 2.5s ease-in-out infinite;
        }
        
        .animate-utensil-right {
          animation: utensil-right 2.5s ease-in-out infinite;
        }
        
        .animate-pulse-center {
          animation: pulse-center 1.5s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        
        .animate-fade-scale {
          animation: fade-scale 1s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 1.4s ease-out forwards;
        }
        
        .animate-bounce-dot {
          animation: bounce-dot 1.6s ease-in-out infinite;
        }
        
        .animate-progress-bar {
          animation: progress-bar 2s ease-in-out infinite;
        }
        
        .animate-orbit {
          animation: orbit 8s linear infinite;
        }
        
        .animate-orbit-reverse {
          animation: orbit-reverse 10s linear infinite;
        }
        
        .animate-orbit-slow {
          animation: orbit 12s linear infinite;
        }
        
        .animate-float-particle-1 {
          animation: float-particle-1 8s ease-in-out infinite;
        }
        
        .animate-float-particle-2 {
          animation: float-particle-2 9s ease-in-out infinite;
        }
        
        .animate-float-particle-3 {
          animation: float-particle-3 10s ease-in-out infinite;
        }
        
        .animate-float-particle-4 {
          animation: float-particle-4 7s ease-in-out infinite;
        }
        
        .animate-sparkle-1 {
          animation: sparkle-1 2s ease-in-out infinite;
        }
        
        .animate-sparkle-2 {
          animation: sparkle-2 2.5s ease-in-out infinite 0.3s;
        }
        
        .animate-sparkle-3 {
          animation: sparkle-3 2.2s ease-in-out infinite 0.6s;
        }
      `}</style>
    </div>
  );
}