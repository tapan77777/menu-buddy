'use client';

import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomeIconButton() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push('/explore')}
      className="fixed top-4 right-4 bg-white text-black p-2 rounded-full shadow-md hover:bg-gray-100 z-50"
      title="Go to MenuBuddy Home"
    >
      <Home size={15} />
    </div>
  );
}
