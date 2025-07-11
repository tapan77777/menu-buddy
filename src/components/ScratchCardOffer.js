'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';

const offers = ['₹20 OFF', '₹30 OFF', '₹50 OFF','Better Luck Next Time'];

export default function ScratchCardOffer() {
  const canvasRef = useRef(null);
  const [showScratch, setShowScratch] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [offer, setOffer] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

//   const scratchAudioRef = useRef(null);
const revealAudioRef = useRef(null);


  const startNewScratch = () => {
    const random = offers[Math.floor(Math.random() * offers.length)];
    setOffer(random);
    setRevealed(false);
    setShowCelebrate(false);
    setShowScratch(true);
  };

  useEffect(() => {
    // Set window size for Confetti
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  useEffect(() => {
    if (revealed || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 300;
    canvas.height = 150;

    ctx.fillStyle = '#888';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const handleMouseMove = (e) => {
  e.preventDefault();

  const isTouch = e.type === 'touchmove';
  const clientX = isTouch ? e.touches[0].clientX : e.clientX;
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  // Play scratch sound
//   if (scratchAudioRef.current && scratchAudioRef.current.paused) {
//     scratchAudioRef.current.currentTime = 0;
//     scratchAudioRef.current.play().catch(() => {});
//   }
};


    const checkRevealed = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] < 128) transparentPixels++;
      }
      const percent = (transparentPixels / (canvas.width * canvas.height)) * 100;
      if (percent > 40) {
        setRevealed(true);
        setShowConfetti(true);
        setShowCelebrate(true);
        setTimeout(() => setShowConfetti(false), 4000);
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
      if (revealAudioRef.current) {
  revealAudioRef.current.currentTime = 0;
  revealAudioRef.current.play().catch(() => {});
}

    };

   canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('touchmove', handleMouseMove); // 👈 for mobile
canvas.addEventListener('mouseup', checkRevealed);
canvas.addEventListener('touchend', checkRevealed); // 👈 for mobile


    return () => {
      canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('touchmove', handleMouseMove); // 👈 for mobile
canvas.addEventListener('mouseup', checkRevealed);
canvas.addEventListener('touchend', checkRevealed); // 👈 for mobile

    };
  }, [revealed, offer, showScratch]);
  

  return (
    <>
           {/* 🎁 Floating Gift Icon */}
      {!showScratch && (
        <div
          onClick={startNewScratch}
          className="fixed bottom-24 right-4 bg-yellow-400 text-white p-4 rounded-full shadow-lg cursor-pointer animate-bounce z-50"
        >
          🎁
        </div>
      )}

      {/* Scratch Card Popup */}
      {showScratch && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-3xl shadow-2xl relative w-[320px] h-[240px] flex flex-col justify-center items-center"
          >
            <button
              onClick={() => setShowScratch(false)}
              className="absolute top-3 right-4 text-white hover:text-gray-200 text-2xl"
            >
              ✖
            </button>

            <div className="text-white text-xl font-bold mb-3 text-center tracking-wide">
              🎁 SCRATCH HERE
            </div>

            <div className="relative w-full h-[120px] bg-white bg-opacity-10 text-2xl font-bold flex justify-center items-center rounded-xl shadow-inner overflow-hidden border border-white/30">
              {revealed && <span className="z-10 text-black drop-shadow-lg">{offer}</span>}
              {!revealed && (
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full cursor-pointer rounded-xl"
                />
              )}
              {revealed && (
                <div className="absolute inset-0 rounded-xl animate-pulse bg-white/10 backdrop-blur " />
              )}
            </div>

            {revealed && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-center text-white font-semibold text-sm"
              >
                🎉 Use code{' '}
                <span className="bg-white/20 px-3 py-1 rounded text-yellow-200 tracking-wide">
                  GET{offer.replace(/\D/g, '')}
                </span>{' '}
                at checkout!
              </motion.div>
            )}
          </motion.div>

          {/* Sprinkle Confetti */}
          {showConfetti && typeof window !== 'undefined' && (
            <Confetti
              numberOfPieces={150}
              gravity={0.3}
              initialVelocityY={15}
              recycle={false}
              run={true}
              tweenDuration={1000}
              width={windowSize.width}
              height={windowSize.height}
              origin={{ x: 0.5, y: 0 }}
            />
          )}
        </div>
      )}

      {/* <audio ref={scratchAudioRef} src="/scratch.mp3" preload="auto" /> */}
      <audio ref={revealAudioRef} src="/celebrate.mp3" preload="auto" />


    </>

  );
}







