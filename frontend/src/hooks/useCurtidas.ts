import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { getApiUrl } from '@/utils/socket';

type AlertCallback = (message: string) => void;
let globalAlertCallback: AlertCallback | null = null;

export function setGlobalAlertCallback(callback: AlertCallback) {
  globalAlertCallback = callback;
}

type CurtidasState = {
  total: number;
  usuarioCurtiu: boolean;
  loading: boolean;
};

export function useCurtidas(postId: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const [state, setState] = useState<CurtidasState>({ total: 0, usuarioCurtiu: false, loading: true });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/posts/${postId}/curtidas`, { headers });
        const data = await res.json();
        if (!mounted) return;
        setState({ total: data.data?.totalCurtidas || 0, usuarioCurtiu: data.data?.usuarioCurtiu || false, loading: false });
      } catch (_e) {
        if (!mounted) return;
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
    if (postId) load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, token]);

  const toggle = useCallback(async () => {
    if (!isAuthenticated) {
      if (globalAlertCallback) {
        globalAlertCallback('Faça login para curtir este post.');
      } else {
        window.alert('Faça login para curtir este post.');
      }
      return;
    }
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/posts/${postId}/curtir`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      const afterRes = await fetch(`${apiUrl}/posts/${postId}/curtidas`, { headers });
      const after = await afterRes.json();
      setState({ total: after.data?.totalCurtidas || 0, usuarioCurtiu: after.data?.usuarioCurtiu || false, loading: false });
      return data;
    } catch (e) {
      // noop
    }
  }, [isAuthenticated, postId, token]);

  return { ...state, toggle };
}


