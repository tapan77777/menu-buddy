"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * Premium Banner Hero - Style A
 * - Animated gradient banner
 * - Big circular logo
 * - Edit name & Change photo with animated buttons + glow
 * - Shows uploading / processing UI and polls back-end until DB is updated
 *
 * Props:
 *  - restaurant : { _id, name, address, logoUrl }
 *
 * Notes:
 *  - Requires env: NEXT_PUBLIC_CLOUDINARY_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 *  - Uses /api/restaurant/update to persist updates (POST)
 *  - Uses /api/menu (or whichever route returns { restaurant }) to poll for changes
 */

export default function RestaurantProfileHero({ restaurant }) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(restaurant?.name || "");
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false); // server-side processing/polling
  const [pollingTimer, setPollingTimer] = useState(null);

  useEffect(() => {
    setName(restaurant?.name || "");
  }, [restaurant?.name]);

  // Save name (with UI lock)
  const saveName = async () => {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/restaurant/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: restaurant._id, name }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Name updated");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Update error");
    } finally {
      setSaving(false);
    }
  };

  // Poll function: check /api/menu for updated restaurant.logoUrl (or use an admin API)
  const pollForLogoUpdate = async (expectedUrl, timeout = 20000, interval = 1000) => {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const id = setInterval(async () => {
        try {
          // call the admin menu endpoint that returns restaurant
          const res = await fetch("/api/menu", { credentials: "same-origin" });
          if (!res.ok) {
            // keep polling while server may be slow; don't throw immediately
            // but if 401 or severe error, we bail out eventually via timeout
          } else {
            const json = await res.json();
            if (json?.restaurant?.logoUrl === expectedUrl) {
              clearInterval(id);
              resolve(true);
            }
          }
        } catch (err) {
          // ignore errors while polling
        }
        if (Date.now() - start > timeout) {
          clearInterval(id);
          reject(new Error("Timeout waiting for server update"));
        }
      }, interval);
      setPollingTimer(id);
    });
  };

  // Image upload handler (unsigned preset flow)
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProcessing(true);
    try {
      // Build upload form
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
      if (!cloudName) throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_NAME env");

      const uploadResp = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploaded = await uploadResp.json();
      if (!uploaded?.secure_url) {
        console.error("Upload response", uploaded);
        throw new Error("Upload failed");
      }

      // Persist to DB
      const saveResp = await fetch("/api/restaurant/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: restaurant._id, logoUrl: uploaded.secure_url }),
      });

      const saved = await saveResp.json();
      if (!saved?.success) {
        throw new Error(saved?.message || "Failed to save URL");
      }

      // Now poll until the menu API returns the new logoUrl
      try {
        toast.loading("Processing — finishing update...", { id: "processing" });
        await pollForLogoUpdate(uploaded.secure_url, 25000, 1200);
        toast.dismiss("processing");
        toast.success("Photo updated");
        router.refresh();
      } catch (pollErr) {
        // Poll timed out — we still refreshed once to try
        toast.dismiss("processing");
        toast.success("Photo uploaded. It may take a moment to reflect on all pages.");
        router.refresh();
      }

    } catch (err) {
      console.error("Change photo error:", err);
      toast.error("Upload or save failed");
    } finally {
      setUploading(false);
      setProcessing(false);
      if (pollingTimer) {
        clearInterval(pollingTimer);
        setPollingTimer(null);
      }
    }
  };

  // Cancel any leftover poll when component unmounts
  useEffect(() => {
    return () => {
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, [pollingTimer]);

  // Small helper for animated glowing button classes
  const glowBtn = "relative inline-flex items-center px-4 py-2 rounded-md text-white font-medium shadow-lg transform transition-all duration-200";
  const glowBg = "before:absolute before:inset-0 before:rounded-md before:blur-md before:opacity-30";

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl" aria-hidden="false">
        {/* gradient background */}
        <div className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 p-6 rounded-2xl shadow-inner">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* left: logo + info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl transform transition-transform duration-300 hover:scale-105">
                    <img
                      src={restaurant?.logoUrl || "/default-restaurant.png"}
                      alt={restaurant?.name || "logo"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* animated glow ring when processing */}
                  {processing && (
                    <div className="absolute -inset-1 rounded-full animate-pulse-slow ring-4 ring-white/30 pointer-events-none"></div>
                  )}
                </div>

                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-extrabold leading-tight drop-shadow-sm">
                    {restaurant?.name}
                  </h1>
                  <p className="text-sm md:text-base opacity-90 mt-1">{restaurant?.address}</p>
                  <p className="text-xs opacity-80 mt-1">Manage restaurant profile and branding</p>
                </div>
              </div>

              {/* right: action buttons */}
              <div className="flex items-center gap-3">
                {/* Change Photo */}
                <label
                  className={`${glowBtn} ${glowBg} bg-violet-600 hover:bg-violet-700 before:bg-violet-400/60`}
                  style={{ boxShadow: "0 8px 30px rgba(99, 102, 241, 0.25)" }}
                >
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading || processing} />
                  <span className="flex items-center gap-2">
                    {uploading ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" fill="none"></circle></svg>
                    ) : null}
                    <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                  </span>
                </label>

                {/* Edit name */}
                {!editing ? (
                  <button
                    className={`${glowBtn} ${glowBg} bg-black text-indigo-700 hover:translate-y-[-2px] before:bg-white/30`}
                    onClick={() => setEditing(true)}
                    disabled={uploading || processing}
                    style={{ padding: "10px 16px" }}
                  >
                    Edit Name
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-white/10 p-2 rounded-md">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-md px-3 py-2 text-black"
                      placeholder="Restaurant name"
                    />
                    <button
                      onClick={saveName}
                      disabled={saving}
                      className="px-3 py-2 bg-emerald-500 text-white rounded-md"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditing(false); setName(restaurant?.name || ""); }} className="px-3 py-2 bg-black/80 rounded-md">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* soft bottom card that holds stats (floating) */}
      
      </div>

      {/* Inline keyframes + helper classes */}
      <style jsx>{`
        @keyframes pulse-slow {
          0% { box-shadow: 0 0 0px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 20px rgba(255,255,255,0.14); transform: scale(1.02); }
          100% { box-shadow: 0 0 0px rgba(255,255,255,0.1); transform: scale(1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 1.8s infinite;
        }
      `}</style>
    </div>
  );
}
