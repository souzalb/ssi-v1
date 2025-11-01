'use client'; // <-- Isso é o mais importante

import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Este componente "cliente" simplesmente renderiza o
  // SessionProvider oficial e os filhos
  return <SessionProvider>{children}</SessionProvider>;
}
