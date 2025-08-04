'use client';

import StyledQR from '@/components/StyledQR';
import { useCallback, useRef, useState } from 'react';

export default function QRGeneratorPage() {
  const [restaurantName, setRestaurantName] = useState('');
  const [menuLink, setMenuLink] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [logoImage, setLogoImage] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const qrRef = useRef(null);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name is required';
    } else if (restaurantName.trim().length < 2) {
      newErrors.restaurantName = 'Restaurant name must be at least 2 characters';
    }

    if (!menuLink.trim()) {
      newErrors.menuLink = 'Menu URL is required';
    } else {
      try {
        const url = new URL(menuLink);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.menuLink = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.menuLink = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [restaurantName, menuLink]);

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setErrors({ general: 'Failed to generate QR code. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, logo: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, logo: 'Image size should be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoImage(reader.result);
      setLogoPreview(reader.result);
      setErrors({ ...errors, logo: undefined });
    };
    reader.onerror = () => {
      setErrors({ ...errors, logo: 'Failed to read image file' });
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    try {
      // Use the exposed download method from StyledQR component
      const success = qrRef.current?.download?.(
        `${restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_code.png`
      );
      
      if (!success) {
        throw new Error('QR code download method not available');
      }
    } catch (error) {
      console.error('Download failed:', error);
      setErrors({ ...errors, download: 'Failed to download QR code' });
    }
  };

  const handleReset = () => {
    setRestaurantName('');
    setMenuLink('');
    setSelectedTheme('classic');
    setLogoImage(null);
    setLogoPreview(null);
    setShowQR(false);
    setErrors({});
  };

  const removeLogo = () => {
    setLogoImage(null);
    setLogoPreview(null);
    setErrors({ ...errors, logo: undefined });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800">
            Restaurant QR Code Generator
          </h1>

          {errors.general && (
            <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                className={`w-full text-black px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                  errors.restaurantName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="e.g. LHA Kitchen"
                maxLength={50}
              />
              {errors.restaurantName && (
                <p className="mt-1 text-sm text-red-600">{errors.restaurantName}</p>
              )}
            </div>

            {/* Menu URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Menu URL *
              </label>
              <input
                type="url"
                className={`w-full text-black px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                  errors.menuLink ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                value={menuLink}
                onChange={(e) => setMenuLink(e.target.value)}
                placeholder="https://lha-kitchen.menubuddy.co.in"
              />
              {errors.menuLink && (
                <p className="mt-1 text-sm text-red-600">{errors.menuLink}</p>
              )}
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Theme
              </label>
              <select
                className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
              >
                <option value="classic">Classic - Black & White</option>
                <option value="funky">Funky - Pink & Purple</option>
                <option value="elegant">Elegant - Navy & Gray</option>
                <option value="branded">Branded - Blue Tones</option>
              </select>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Logo (Optional)
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm"
                />
                {logoPreview && (
                  <div className="flex items-center space-x-3">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg border"
                    />
                    <button
                      onClick={removeLogo}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}
                {errors.logo && (
                  <p className="text-sm text-red-600">{errors.logo}</p>
                )}
                <p className="text-xs sm:text-sm text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full sm:flex-1 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-colors font-semibold text-sm sm:text-base"
              >
                Reset
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gray-50 rounded-xl">
              <div className="text-center">
                <StyledQR
                  ref={qrRef}
                  url={menuLink}
                  restaurantName={restaurantName}
                  theme={selectedTheme}
                  logoImage={logoImage}
                  size={280} // Smaller size for mobile
                />

                <div className="mt-4 sm:mt-6 space-y-3">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-colors font-semibold text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download QR Code
                  </button>
                  {errors.download && (
                    <p className="text-sm text-red-600">{errors.download}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}