'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

const themeStyles = {
  classic: {
    colorDark: '#000000',
    colorLight: '#ffffff',
    name: 'Professional Classic'
  },
  funky: {
    colorDark: '#E91E63',
    colorLight: '#ffffff',
    name: 'Vibrant Funky'
  },
  elegant: {
    colorDark: '#1A237E',
    colorLight: '#ffffff',
    name: 'Sophisticated Elegant'
  },
  branded: {
    colorDark: '#1976D2',
    colorLight: '#ffffff',
    name: 'Corporate Branded'
  }
};

const StyledQR = forwardRef(({ 
  url, 
  restaurantName, 
  theme = 'classic', 
  brandStyle = 'integrated',
  logoImage,
  size = 280,
  errorCorrectionLevel = 'M',
  margin = 10
}, ref) => {
  const qrRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrScript, setQrScript] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.QRCode) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.async = true;
      script.onload = () => setQrScript(true);
      document.head.appendChild(script);
    } else if (window.QRCode) {
      setQrScript(true);
    }
  }, []);

  const generateQR = useCallback(() => {
    if (!qrRef.current || !url || !qrScript || typeof window === 'undefined' || !window.QRCode) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      qrRef.current.innerHTML = '';

      const currentTheme = themeStyles[theme] || themeStyles.classic;
      const qrSize = Math.min(size, 300);

      const qrcode = new window.QRCode(qrRef.current, {
        text: url,
        width: qrSize,
        height: qrSize,
        colorDark: currentTheme.colorDark,
        colorLight: currentTheme.colorLight,
        correctLevel: window.QRCode.CorrectLevel.H
      });

      setTimeout(() => {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
          canvasRef.current = canvas;
          
          if (logoImage) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              const logoSize = canvas.width * 0.2;
              const x = (canvas.width - logoSize) / 2;
              const y = (canvas.height - logoSize) / 2;
              
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
              ctx.drawImage(img, x, y, logoSize, logoSize);
              setIsLoading(false);
            };
            
            img.onerror = () => {
              setIsLoading(false);
            };
            
            img.src = logoImage;
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }, 100);

    } catch (err) {
      console.error('QR generation failed:', err);
      setError('Failed to generate QR code');
      setIsLoading(false);
    }
  }, [url, theme, logoImage, size, qrScript]);

  useImperativeHandle(ref, () => ({
    download: (filename) => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      try {
        const pngUrl = canvas.toDataURL('image/png', 1.0);
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = filename || 'qr-code.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        return true;
      } catch (error) {
        console.error('Download failed:', error);
        return false;
      }
    },
    getCanvas: () => canvasRef.current,
    regenerate: () => generateQR()
  }));

  useEffect(() => {
    if (qrScript) {
      generateQR();
    }
  }, [generateQR, qrScript]);

  const getThemeDisplayName = (themeName) => {
    return themeStyles[themeName]?.name || themeName;
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 font-medium">Error generating QR code</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={generateQR}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!qrScript) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="text-gray-600 text-sm mt-2">Loading QR generator...</p>
      </div>
    );
  }

  return (
    <div className="text-center max-w-full">
      <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          {restaurantName}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 px-2">
          Scan to view our digital menu • {getThemeDisplayName(theme)}
        </p>
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
        </div>
      </div>

      <div className="relative inline-block max-w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl z-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-600 text-sm font-medium">Creating branded QR...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={qrRef} 
          className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100 transition-all duration-300 max-w-full overflow-hidden hover:shadow-2xl inline-block"
          style={{ 
            opacity: isLoading ? 0.5 : 1,
            background: brandStyle === 'integrated' 
              ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              : '#ffffff'
          }}
        />
        
        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
          Branded
        </div>
      </div>

      <div className="mt-4 sm:mt-6 text-xs text-gray-500 max-w-full px-2">
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 text-left">
          <p className="text-center mb-3 text-sm font-medium text-gray-700">
            📱 Point your camera to scan
          </p>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="break-all text-xs font-mono text-gray-600">
              {url}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .text-gray-600,
          .text-gray-500 {
            color: #000 !important;
          }
          .bg-gray-50 {
            background-color: #f9f9f9 !important;
          }
          .shadow-xl,
          .shadow-lg {
            box-shadow: none !important;
          }
        }
        
        canvas {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
});

StyledQR.displayName = 'StyledQR';
export default StyledQR;