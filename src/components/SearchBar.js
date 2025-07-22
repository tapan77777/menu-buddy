'use client'
import { useState } from 'react';

export default function SearchBar({ onSearch, onLocationChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Current Location');
  const [isLocationEditing, setIsLocationEditing] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        query: searchQuery.trim(),
        location: location
      });
    }
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In real app, you'd reverse geocode these coordinates
          setLocation('Detected Location');
          if (onLocationChange) {
            onLocationChange({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }
        },
        () => {
          alert('Unable to detect location');
        }
      );
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
        {/* Location Bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-orange-500 text-lg">📍</span>
            <div className="flex-1">
              {isLocationEditing ? (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onBlur={() => setIsLocationEditing(false)}
                  onKeyPress={(e) => e.key === 'Enter' && setIsLocationEditing(false)}
                  className="w-full outline-none text-sm font-medium text-gray-800 border-b border-orange-200 pb-1"
                  autoFocus
                />
              ) : (
                <div 
                  onClick={() => setIsLocationEditing(true)}
                  className="cursor-pointer"
                >
                  <div className="text-sm font-medium text-gray-800 truncate">{location}</div>
                  <div className="text-xs text-gray-500">Tap to change location</div>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={handleLocationDetect}
            className="text-orange-500 text-xs font-semibold px-2 py-1 border border-orange-200 rounded-md hover:bg-orange-50 transition-colors"
          >
            Detect
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 gap-3 border border-gray-200 focus-within:border-orange-300 focus-within:bg-white transition-all">
            <span className="text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for restaurants, cuisines, or dishes..."
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 text-lg"
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
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {[
            '🍕 Pizza', 
            '🍔 Burgers', 
            '🍜 Chinese', 
            '🥘 North Indian', 
            '☕ Cafe', 
            '🍰 Desserts',
            '🥗 Healthy',
            '🌮 Fast Food'
          ].map((filter, i) => (
            <button
              key={i}
              onClick={() => setSearchQuery(filter.split(' ')[1])}
              className="flex-shrink-0 text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Demo component showing how to use it
function Demo() {
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = (searchData) => {
    console.log('Search:', searchData);
    setSearchResults(searchData);
  };

  const handleLocationChange = (locationData) => {
    console.log('Location:', locationData);
  };

  const samplePromo = {
    title: "Panchayat Food",
    description: "Order from 500+ restaurants with exclusive deals",
    buttonText: "Explore"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Component */}
      <SearchBar 
        onSearch={handleSearch}
        onLocationChange={handleLocationChange}
      />
      
      {/* Your existing banner component would go here */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold mb-2">Your Promotional Banner</h2>
          <p className="text-sm text-orange-100">Banner content goes here...</p>
        </div>

        {/* Search Results Display */}
        {searchResults && (
          <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <h3 className="font-semibold mb-2">Search Results:</h3>
            <p className="text-sm text-gray-600">
              Query: "{searchResults.query}" in {searchResults.location}
            </p>
          </div>
        )}

        {/* Demo restaurant listings */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 flex gap-3">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                🍽️
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Restaurant Name {i + 1}</h4>
                <p className="text-xs text-gray-500 mb-1">North Indian, Chinese, Continental</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-green-600">⭐</span>
                    4.{2 + i}
                  </span>
                  <span>•</span>
                  <span>{20 + i * 5}-{25 + i * 5} mins</span>
                  <span>•</span>
                  <span>₹{200 + i * 50} for two</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}