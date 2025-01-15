// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For client-side navigation

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page on page load
    router.push('/login');
  }, [router]);

  return null; // You can return null because it's just a redirect
}
