

// src/app/explore/page.js
export const revalidate = 60;

import ClientHomePage from '@/components/ClientHomepage';

export async function generateMetadata() {
  return {
    title: "MenuBuddy - Explore QR Menus Near You",
    description: "Discover top-rated restaurants and view digital menus instantly with MenuBuddy.",
    icons: {
      icon: [
        {
          url: '/favicon-alt.ico',
          type: 'image/x-icon',
          sizes: 'any',
        },
      ],
    },
    keywords: ["digital menu", "QR menu", "restaurant menus", "menubuddy", "order online"],
    openGraph: {
      title: "MenuBuddy - Smart QR Menus",
      images: [
        {
          url: "https://menubuddy.co.in/images/menubuddy-logo.png",
          width: 1200,
          height: 630,
          alt: "MenuBuddy Preview"
        }
      ],
      description: "Explore digital menus with QR, promotions, and more.",
      url: "https://menubuddy.co.in/explore",
      siteName: "MenuBuddy",
      type: "website"
    },
    alternates: {
      canonical: "https://menubuddy.co.in/explore"
    }
  };
}

export default async function ExplorePage() {
  let restaurants = [];
  let error = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant-list`, {
      next: { revalidate: 60 }
    });
    const data = await res.json();

    if (data.success) {
      restaurants = data.restaurants;
    } else {
      error = 'Failed to load restaurants';
    }
  } catch (err) {
    error = 'Failed to load restaurants';
    console.error('Error fetching restaurants:', err);
  }

  return (
    <ClientHomePage 
      initialRestaurants={restaurants} 
      initialError={error}
    />
  );
}
