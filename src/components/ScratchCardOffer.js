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
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
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
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', checkRevealed);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', checkRevealed);
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
            className="bg-white p-6 rounded-xl shadow-xl relative"
          >
            <button
              onClick={() => setShowScratch(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-black text-xl"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-3 text-center">🎁 Scratch to Reveal Your Offer</h3>

            <div className="relative w-[300px] h-[150px] bg-yellow-100 text-black text-2xl font-bold flex justify-center items-center rounded-lg shadow-lg overflow-hidden">
              {revealed && <span className="z-10">{offer}</span>}
              {!revealed && (
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full cursor-pointer rounded-lg"
                />
              )}
              {revealed && (
                <div className="absolute inset-0 rounded-lg animate-pulse bg-white/10 backdrop-blur" />
              )}
            </div>

            {revealed && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-center text-green-700 font-semibold text-sm"
              >
                🎉 Use code{' '}
                <span className="bg-green-100 px-2 py-1 rounded text-green-800">
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

      {/* 🎊 Celebration Emoji */}
      {/* <AnimatePresence>
        {showCelebrate && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl text-lg font-semibold z-50"
          >
            🥳 Woohoo! You unlocked <span className="text-green-600">{offer}</span>
          </motion.div>
        )}
      </AnimatePresence> */}

    </>
  );
}
