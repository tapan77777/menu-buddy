export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto pb-24 min-h-screen bg-white animate-pulse">

      {/* Banner skeleton */}
      <div className="h-48 sm:h-56 bg-gray-200 w-full" />

      {/* Restaurant info card skeleton */}
      <div className="px-4 -mt-16 mb-6">
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-6 bg-gray-200 rounded-full w-2/3" />
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-16 bg-gray-100 rounded-full" />
                <div className="h-7 w-20 bg-gray-100 rounded-full" />
                <div className="h-7 w-24 bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Search skeleton */}
        <div className="h-14 bg-gray-100 rounded-2xl w-full" />

        {/* Category pills skeleton */}
        <div className="flex gap-2">
          {[80, 60, 80, 70, 72, 80].map((w, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-full flex-shrink-0" style={{ width: w }} />
          ))}
        </div>

        {/* Menu item skeletons */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-2xl border border-gray-100 bg-white">
            <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-gray-200 rounded-full w-3/4" />
              <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-gray-200 rounded-full w-16" />
                <div className="h-8 w-16 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
