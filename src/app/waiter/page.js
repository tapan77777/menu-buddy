'use client';
import QrOrderScanner from '@/components/QrOrderScanner';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WaiterPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 1000);

    // Get waiter name from localStorage or set default
    const storedName = localStorage.getItem('waiterName') || 'Waiter';
    setWaiterName(storedName);

    // Check online status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleScanSuccess = () => {
    setScanCount(prev => prev + 1);
    // Add haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo & Status */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MB</span>
                </div>
                <span className="font-bold text-slate-900 text-lg">MenuBuddy</span>
              </Link>
              
              {/* Online Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-slate-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Right side - Waiter info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{waiterName}</p>
                <p className="text-xs text-slate-500">{currentTime}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h-5l5-5 5 5h-5v12z" />
                  </svg>
                </button>
                
                <Link 
                  href="/login"
                  className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Orders taken</p>
                <p className="text-2xl font-bold text-slate-900">{scanCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">QR Code Scanner</h2>
                <p className="text-green-100 text-sm">Scan customer order QR codes</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm0 10h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zM17 4h2a1 1 0 011 1v3a1 1 0 01-1 1h-2a1 1 0 01-1-1V5a1 1 0 011-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Instructions */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">How to scan:</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Position the QR code within the camera frame</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* QR Scanner Component */}
            <div className="relative rounded-xl overflow-hidden border-2 border-slate-200">
              <QrOrderScanner onScanSuccess={handleScanSuccess} 
              />
            </div>


          </div>
        </div>


      </main>
    </div>
  );
}