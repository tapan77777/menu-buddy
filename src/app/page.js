export const revalidate = 60;

import DiscoveryHomePage from "@/components/DiscoveryHomePage";

export async function generateMetadata() {
  return {
    title: "MenuBuddy — Discover Food Near You",
    description: "Search dishes, explore nearby restaurants, and find trending food on MenuBuddy.",
    icons: {
      icon: [{ url: "/favicon-alt.ico", type: "image/x-icon", sizes: "any" }],
    },
    keywords: ["digital menu", "QR menu", "nearby restaurants", "food discovery", "menubuddy"],
    openGraph: {
      title: "MenuBuddy — Discover Food Near You",
      description: "Search dishes, explore nearby restaurants, and find trending food.",
      url: "https://menubuddy.co.in",
      siteName: "MenuBuddy",
      type: "website",
      images: [
        {
          url: "https://menubuddy.co.in/images/menubuddy-logo.png",
          width: 1200,
          height: 630,
          alt: "MenuBuddy",
        },
      ],
    },
    alternates: { canonical: "https://menubuddy.co.in" },
  };
}

export default async function HomePage() {
  // Pre-fetch restaurant list on the server so NearbyRestaurants has an
  // instant fallback without a second client-side round-trip.
  let fallbackRestaurants = [];

  try {
    const res  = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant-list`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data.success) fallbackRestaurants = data.restaurants;
  } catch {
    // Non-fatal — NearbyRestaurants handles an empty fallback gracefully
  }

  return <DiscoveryHomePage fallbackRestaurants={fallbackRestaurants} />;
}
