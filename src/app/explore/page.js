// src/app/page.js
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-500 via-pink-500 to-orange-400 text-white relative overflow-hidden">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center text-center py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/favicon-alt.ico" // use your uploaded logo path
            alt="MenuBuddy Logo"
            width={150}
            height={150}
            className="mb-6 rounded-2xl shadow-xl"
          />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Your Restaurant’s <span className="text-yellow-300">Smartest Digital Partner</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl max-w-2xl text-white/90 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          QR menus, instant ordering, and real-time analytics — everything your restaurant needs to go digital, beautifully.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Link
            href="/explore"
            className="bg-white text-red-600 font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:bg-yellow-300 hover:text-black transition duration-300"
          >
            🚀 Check MenuBuddy
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white text-gray-800 w-full py-20 px-6 rounded-t-3xl shadow-inner mt-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          {[
            {
              icon: "📱",
              title: "Digital QR Menus",
              desc: "Let customers scan and browse instantly — no more paper menus.",
            },
            {
              icon: "⚡",
              title: "Instant Orders",
              desc: "Enable fast, direct ordering right from customer phones.",
            },
            {
              icon: "📊",
              title: "Smart Analytics",
              desc: "Get insights on menu views, top items, and trends automatically.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="bg-gray-50 rounded-2xl shadow-md p-8 hover:shadow-xl transition"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section className="text-center py-24 px-6 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white">
        <motion.h2
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Our Vision
        </motion.h2>
        <motion.p
          className="max-w-2xl mx-auto text-lg text-white/90"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          To revolutionize restaurant management through digital menus, real-time insights,
          and seamless ordering — making dining smarter and smoother for everyone.
        </motion.p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm w-full">
        © {new Date().getFullYear()} <span className="text-white font-semibold">MenuBuddy</span> — Smart QR Menus for Modern Restaurants
      </footer>
    </main>
  );
}
