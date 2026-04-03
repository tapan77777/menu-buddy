'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT_COLORS = [
  { name: 'Red',    hex: '#E53E3E' },
  { name: 'Orange', hex: '#DD6B20' },
  { name: 'Yellow', hex: '#D69E2E' },
  { name: 'Green',  hex: '#38A169' },
  { name: 'Blue',   hex: '#3B82F6' },
  { name: 'Purple', hex: '#805AD5' },
  { name: 'Black',  hex: '#1A202C' },
];

const STYLES = [
  { id: 'classic', label: 'Classic', desc: 'White · Color band' },
  { id: 'bold',    label: 'Bold',    desc: 'Dark · Inset QR' },
  { id: 'minimal', label: 'Minimal', desc: 'Off-white · Clean' },
];

// ─── Card Preview Component ───────────────────────────────────────────────────

function CardPreview({ restaurantName, tagline, qrImage, cardStyle, accentColor, wifiName, wifiPassword, marketingText }) {
  const name  = restaurantName || 'Your Restaurant';
  const tag   = tagline        || 'Cuisine & Tagline';
  const color = accentColor.hex;

  // Darken accent for gradient end
  const darken = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, ((n >> 16) & 0xff) - 40);
    const g = Math.max(0, ((n >> 8)  & 0xff) - 40);
    const b = Math.max(0, (n         & 0xff) - 40);
    return `rgb(${r},${g},${b})`;
  };

  const qrPlaceholder = (
    <div style={{ width: 160, height: 160, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="#bbb" strokeWidth="2.5" fill="none"/>
        <rect x="10" y="10" width="16" height="16" rx="1.5" fill="#bbb"/>
        <rect x="46" y="2" width="32" height="32" rx="3" stroke="#bbb" strokeWidth="2.5" fill="none"/>
        <rect x="54" y="10" width="16" height="16" rx="1.5" fill="#bbb"/>
        <rect x="2" y="46" width="32" height="32" rx="3" stroke="#bbb" strokeWidth="2.5" fill="none"/>
        <rect x="10" y="54" width="16" height="16" rx="1.5" fill="#bbb"/>
        <rect x="46" y="46" width="8" height="8" rx="1" fill="#bbb"/>
        <rect x="58" y="46" width="8" height="8" rx="1" fill="#bbb"/>
        <rect x="70" y="46" width="8" height="8" rx="1" fill="#bbb"/>
        <rect x="46" y="58" width="8" height="8" rx="1" fill="#bbb"/>
        <rect x="62" y="62" width="16" height="16" rx="1" fill="#bbb"/>
      </svg>
    </div>
  );

  const qrBlock = qrImage
    ? <img src={qrImage} alt="QR Code" style={{ width: 160, height: 160, objectFit: 'contain', display: 'block' }} />
    : qrPlaceholder;

  if (cardStyle === 'classic') {
    return (
      <div style={{
        width: 340, background: '#fff', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden',
        fontFamily: '"Poppins", "Segoe UI", sans-serif',
      }}>
        {/* Top gradient band */}
        <div style={{
          background: `linear-gradient(135deg, ${color} 0%, ${darken(color)} 100%)`,
          padding: '22px 24px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 500, letterSpacing: '0.5px' }}>
            {tag}
          </div>
        </div>

        {/* QR section */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            padding: 12, border: `3px solid ${color}`, borderRadius: 14,
            background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}>
            {qrBlock}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#333', letterSpacing: '0.5px' }}>
              📱 SCAN TO VIEW OUR MENU
            </div>
          </div>
        </div>

        {/* WiFi section */}
        {(wifiName || wifiPassword) && (
          <div style={{ margin: '0 20px 12px', padding: '10px 14px', background: '#f8f9fa', borderRadius: 10, borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 4, letterSpacing: '0.5px' }}>📶 FREE WIFI</div>
            {wifiName     && <div style={{ fontSize: 12, color: '#444' }}><b>Network:</b> {wifiName}</div>}
            {wifiPassword && <div style={{ fontSize: 12, color: '#444' }}><b>Password:</b> {wifiPassword}</div>}
          </div>
        )}

        {/* Marketing strip */}
        {marketingText && (
          <div style={{ margin: '0 20px 12px', padding: '8px 14px', background: color + '15', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: color, fontWeight: 600 }}>{marketingText}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #f0f0f0', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <img src="/menubuddy-logo.png.jpg" alt="MenuBuddy" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }} />
          <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>Powered by <b style={{ color: '#555' }}>MenuBuddy</b></span>
        </div>
      </div>
    );
  }

  if (cardStyle === 'bold') {
    return (
      <div style={{
        width: 340, background: '#111827', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden',
        fontFamily: '"Poppins", "Segoe UI", sans-serif',
      }}>
        {/* Accent top bar */}
        <div style={{ background: color, height: 6 }} />

        {/* Header */}
        <div style={{ padding: '22px 24px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: 1.2 }}>
            {name}
          </div>
          <div style={{ fontSize: 11, color: color, marginTop: 5, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {tag}
          </div>
        </div>

        {/* QR inset */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 14, boxShadow: `0 0 0 4px ${color}40` }}>
            {qrBlock}
          </div>
        </div>

        {/* Scan text */}
        <div style={{ textAlign: 'center', paddingBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
            ▲ Scan for Menu ▲
          </div>
        </div>

        {/* WiFi */}
        {(wifiName || wifiPassword) && (
          <div style={{ margin: '0 20px 14px', padding: '10px 14px', background: '#1F2937', borderRadius: 10, borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: color, marginBottom: 4, letterSpacing: '0.5px' }}>📶 FREE WIFI</div>
            {wifiName     && <div style={{ fontSize: 12, color: '#D1D5DB' }}><b style={{ color: '#fff' }}>Network:</b> {wifiName}</div>}
            {wifiPassword && <div style={{ fontSize: 12, color: '#D1D5DB' }}><b style={{ color: '#fff' }}>Password:</b> {wifiPassword}</div>}
          </div>
        )}

        {/* Marketing */}
        {marketingText && (
          <div style={{ margin: '0 20px 14px', padding: '8px 14px', background: color, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 700, letterSpacing: '0.5px' }}>{marketingText}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #1F2937', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <img src="/menubuddy-logo.png.jpg" alt="MenuBuddy" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }} />
          <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Powered by <b style={{ color: '#9CA3AF' }}>MenuBuddy</b></span>
        </div>
      </div>
    );
  }

  // Minimal
  return (
    <div style={{
      width: 340, background: '#FAFAF8', borderRadius: 20,
      boxShadow: '0 20px 60px rgba(0,0,0,0.12)', overflow: 'hidden',
      fontFamily: '"Poppins", "Segoe UI", sans-serif',
      border: '1px solid #E8E8E4',
    }}>
      {/* Header */}
      <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          {name}
        </div>
        <div style={{ width: 36, height: 3, background: color, borderRadius: 2, margin: '10px auto 8px' }} />
        <div style={{ fontSize: 12, color: '#777', fontWeight: 500, letterSpacing: '0.5px' }}>
          {tag}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#E8E8E4', margin: '0 28px' }} />

      {/* QR */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ padding: 8, border: '1.5px solid #E0E0DC', borderRadius: 12, background: '#fff' }}>
          {qrBlock}
        </div>
        <div style={{ fontSize: 11, color: '#999', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Scan to view menu
        </div>
      </div>

      {/* Divider */}
      {(wifiName || wifiPassword || marketingText) && (
        <div style={{ height: 1, background: '#E8E8E4', margin: '0 28px' }} />
      )}

      {/* WiFi */}
      {(wifiName || wifiPassword) && (
        <div style={{ padding: '14px 28px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>Free WiFi</div>
          {wifiName     && <div style={{ fontSize: 12, color: '#555' }}>Network: <b>{wifiName}</b></div>}
          {wifiPassword && <div style={{ fontSize: 12, color: '#555' }}>Password: <b>{wifiPassword}</b></div>}
        </div>
      )}

      {/* Marketing */}
      {marketingText && (
        <div style={{ margin: '12px 28px 0', padding: '8px 12px', borderLeft: `3px solid ${color}`, background: '#f5f5f0' }}>
          <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>{marketingText}</div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 18, borderTop: '1px solid #E8E8E4', padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <img src="/menubuddy-logo.png.jpg" alt="MenuBuddy" style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 3 }} />
        <span style={{ fontSize: 10, color: '#aaa', fontWeight: 500, letterSpacing: '0.3px' }}>Powered by <b style={{ color: '#888' }}>MenuBuddy</b></span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QRMenuCardDesigner() {
  const [restaurantName, setRestaurantName] = useState('');
  const [tagline,        setTagline]        = useState('');
  const [qrImage,        setQrImage]        = useState(null);
  const [cardStyle,      setCardStyle]      = useState('classic');
  const [accentColor,    setAccentColor]    = useState(ACCENT_COLORS[4]);
  const [wifiName,       setWifiName]       = useState('');
  const [wifiPassword,   setWifiPassword]   = useState('');
  const [marketingText,  setMarketingText]  = useState('');
  const [isDownloading,  setIsDownloading]  = useState(false);
  const [qrFileName,     setQrFileName]     = useState('');
  const cardRef = useRef(null);

  // Load Poppins font
  useEffect(() => {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setQrFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setQrImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      const link    = document.createElement('a');
      link.download = `${(restaurantName || 'menu-card').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_card.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-400';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide';

  return (
    <div style={{ fontFamily: '"Poppins", "Segoe UI", sans-serif' }} className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: '#3B82F620' }}>
            🎨
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              QR Menu Card Designer
            </h1>
            <p className="text-xs text-gray-400">Design &amp; download a printable QR card for your tables</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Left Panel: Form ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Card Details</h2>

          {/* Restaurant Name */}
          <div>
            <label className={labelCls}>Restaurant Name</label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. The Spice Garden"
              maxLength={50}
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
            />
          </div>

          {/* Tagline / Cuisine */}
          <div>
            <label className={labelCls}>Tagline / Cuisine</label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Authentic Indian Cuisine"
              maxLength={60}
              value={tagline}
              onChange={e => setTagline(e.target.value)}
            />
          </div>

          {/* QR Code Upload */}
          <div>
            <label className={labelCls}>QR Code Image</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50">
              <div className="flex flex-col items-center gap-1 text-center px-4">
                {qrFileName ? (
                  <>
                    <span className="text-2xl">✅</span>
                    <span className="text-xs font-medium text-green-600 truncate max-w-full">{qrFileName}</span>
                    <span className="text-xs text-gray-400">Click to replace</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">📤</span>
                    <span className="text-xs font-semibold text-gray-600">Upload your QR PNG / JPG</span>
                    <span className="text-xs text-gray-400">Click to browse</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
            </label>
          </div>

          {/* Card Style */}
          <div>
            <label className={labelCls}>Card Style</label>
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setCardStyle(s.id)}
                  className={`py-3 px-2 rounded-xl border-2 text-center transition-all ${
                    cardStyle === s.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`text-xs font-bold ${cardStyle === s.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {s.label}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className={labelCls}>Accent Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.hex}
                  title={c.name}
                  onClick={() => setAccentColor(c)}
                  className="relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    background: c.hex,
                    borderColor: accentColor.hex === c.hex ? '#1a1a1a' : 'transparent',
                    boxShadow: accentColor.hex === c.hex ? `0 0 0 3px white, 0 0 0 5px ${c.hex}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* WiFi */}
          <div>
            <label className={labelCls}>WiFi Details <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                className={inputCls}
                placeholder="Network name"
                value={wifiName}
                onChange={e => setWifiName(e.target.value)}
              />
              <input
                type="text"
                className={inputCls}
                placeholder="Password"
                value={wifiPassword}
                onChange={e => setWifiPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Marketing Text */}
          <div>
            <label className={labelCls}>Marketing Text <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. 🎉 Happy Hour 5–7pm | Ask about our specials!"
              maxLength={80}
              value={marketingText}
              onChange={e => setMarketingText(e.target.value)}
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: isDownloading ? '#9CA3AF' : accentColor.hex }}
          >
            {isDownloading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating PNG…
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Download as PNG
              </>
            )}
          </button>
        </div>

        {/* ── Right Panel: Live Preview ── */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 self-start">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Live Preview</span>
          </div>

          {/* Card wrapper — captured by html2canvas */}
          <div
            ref={cardRef}
            style={{
              display: 'inline-block',
              padding: 20,
              background: 'transparent',
            }}
          >
            <CardPreview
              restaurantName={restaurantName}
              tagline={tagline}
              qrImage={qrImage}
              cardStyle={cardStyle}
              accentColor={accentColor}
              wifiName={wifiName}
              wifiPassword={wifiPassword}
              marketingText={marketingText}
            />
          </div>

          {/* Helper note */}
          <p className="text-xs text-gray-400 text-center max-w-xs">
            Fill in the details on the left and your card updates instantly. Hit <b>Download as PNG</b> to save a print-ready file (3× resolution).
          </p>
        </div>

      </div>
    </div>
  );
}
