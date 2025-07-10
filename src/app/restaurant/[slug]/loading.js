// /app/restaurant/[slug]/loading.js
export default function Loading() {
    
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500 text-lg animate-pulse">Loading Menu...</p>
    </div>
  );
}
