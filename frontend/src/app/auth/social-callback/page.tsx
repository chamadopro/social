'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';

export default function SocialCallbackPage() {
  const router = useRouter();
  const search = useSearchParams();
  const setLoading = useAuthStore((s) => s.setLoading);
  const updateUser = useAuthStore((s) => s.updateUser);

  useEffect(() => {
    const token = search.get('token');
    const provider = search.get('provider');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    api.setToken(token);

    (async () => {
      try {
        const me = await api.get<any>('/auth/me');
        if (me?.success && me?.data?.user) {
          // Atualizar store com usuário retornado
          const user = me.data.user;
          useAuthStore.setState({ user, token, isAuthenticated: true, isLoading: false });
        }
      } catch (_e) {
        // ignore
      } finally {
        setLoading(false);
        router.push('/');
      }
    })();
  }, [router, search, setLoading, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Conectando sua conta {`(${typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('provider') || 'social') : 'social'})`}…</p>
    </div>
  );
}


