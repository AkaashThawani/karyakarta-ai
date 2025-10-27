'use client';

import { useAuthModal } from '@/hooks/use-auth-modal';
import { AuthModal } from './auth-modal';

export function AuthModalWrapper() {
  const { isOpen, mode, closeModal } = useAuthModal();
  return <AuthModal isOpen={isOpen} onClose={closeModal} defaultMode={mode} />;
}
