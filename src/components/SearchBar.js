'use client';
import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch, onLocationChange }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search - automatically search as user types (with delay)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (onSearch) {
        onSearch({
          query: searchQuery.trim()
        });
      }
    }, 500); // 500ms delay after user stops typing

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        query: searchQuery.trim()
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
      <div className="px-4 py-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 gap-3 border border-gray-200 focus-within:border-orange-300 focus-within:bg-white transition-all">
            <span className="text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for restaurants or location..."
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 text-lg transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button
              onClick={handleSearch}
              className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Search 
            </button>
          </div>
          
          {/* Search suggestions/hints */}
          {searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-30">
              <div className="p-3 text-xs text-gray-500">
                <p>Searching in restaurant names or addresses...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}