import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatUserType } from '@/utils/format';
import { Bell, Menu, Plus } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Logo } from '@/components/Logo';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="md" showText={true} href="/" />
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Create Post Button */}
                <Button size="sm" className="hidden sm:flex">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Post
                </Button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                    <p className="text-xs text-gray-500">{formatUserType(user?.tipo || '')}</p>
                  </div>
                  <Avatar
                    src={user?.foto_perfil}
                    name={user?.nome}
                    size="md"
                  />
                </div>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hidden sm:flex"
                >
                  Sair
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="ghost" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-screen w-64 bg-white z-40 shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Fechar">✕</button>
            </div>

            <nav className="flex-1 space-y-2">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50">Início</Link>
              <Link href="/search" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50">Explorar</Link>
              {isAuthenticated ? (
                <>
                  <button onClick={() => { setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">Criar Post</button>
                  <Link href="/notificacoes" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50">Notificações</Link>
                  <Link href={`/profile/${user?.id}`} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50">Meu Perfil</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">Sair</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50">Entrar</Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50">Cadastrar</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

