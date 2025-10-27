'use client';

/**
 * Login Page
 * 
 * Redirects to homepage with login modal open.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { openModal } = useAuthModal();

  useEffect(() => {
    // Open login modal and redirect to home
    openModal('login');
    router.replace('/');
  }, [openModal, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
