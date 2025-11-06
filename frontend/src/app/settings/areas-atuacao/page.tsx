'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CategorySelector, ALL_CATEGORIES } from '@/components/CategorySelector';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';

export default function AreasAtuacaoPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelected(user?.areas_atuacao || []);
  }, [isAuthenticated, user, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const resp = await api.put(`/users/${user.id}`, { areas_atuacao: selected });
      if (resp?.data?.data?.user) {
        updateUser(resp.data.data.user);
      }
      router.push('/settings');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar áreas de atuação');
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Áreas de Atuação</h1>
        <p className="text-gray-600 mt-1">Selecione as categorias de serviços que você oferece.</p>
      </div>

      <Card className="p-6 space-y-6">
        <CategorySelector multiple value={selected} onChange={(v) => setSelected(v as string[])} />

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/settings')}>Cancelar</Button>
        </div>
      </Card>
    </div>
  );

  return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}


