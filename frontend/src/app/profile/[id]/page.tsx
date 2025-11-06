'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';

export default function ProfileByIdPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, temClienteAssociado } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const idParam = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);

  if (!idParam) {
    return null;
  }

  // Se o id da URL for do usuário logado, mostra o perfil local
  const isOwnProfile = user?.id === idParam;
  const isHybrid = user?.tipo === 'PRESTADOR' && (temClienteAssociado || (user as any)?.temClienteAssociado);

  const content = (
    <div className="space-y-6">
      {isOwnProfile ? (
        <>
          <div className="flex items-start gap-4">
            <Avatar src={user?.foto_perfil || undefined} name={user?.nome} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.nome}</h1>
              <p className="text-gray-600">
                {isHybrid ? 'Prestador/Cliente' : user?.tipo === 'PRESTADOR' ? 'Prestador' : 'Cliente'}
              </p>
              {Array.isArray((user as any)?.areas_atuacao) && (user as any).areas_atuacao.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(user as any).areas_atuacao.map((cat: string) => (
                    <span key={cat} className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => router.push('/settings')}>Editar Perfil</Button>
              {(user?.tipo === 'PRESTADOR' || isHybrid) && (
                <Button variant="outline" onClick={() => router.push('/settings/areas-atuacao')}>
                  Áreas de atuação
                </Button>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Perfil não disponível</h2>
          <p className="text-gray-600">Você tentou acessar um perfil que não está disponível nesta visualização.</p>
        </Card>
      )}
    </div>
  );

  return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}


