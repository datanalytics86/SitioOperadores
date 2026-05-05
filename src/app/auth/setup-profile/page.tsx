'use client';

import SetupProfileForm from '@/components/SetupProfileForm';
import Navbar from '@/components/Navbar';

export default function SetupProfile() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <SetupProfileForm />
        </div>
      </main>
    </>
  );
}
