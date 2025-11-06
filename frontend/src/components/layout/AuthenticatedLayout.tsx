import React, { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Logo } from '@/components/Logo';
import { 
  Home, 
  Search, 
  PlusCircle, 
  MessageCircle, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  FileText,
  Briefcase,
  CheckCircle,
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { VerificationBanner } from '../VerificationBanner';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/Badge';
import NotificationCenter from '@/components/NotificationCenter';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  toolbar?: React.ReactNode;
}

interface MenuItem {
  icon?: React.ComponentType<any>;
  label?: string;
  path?: string;
  id: string;
  badge?: number;
  separator?: boolean;
  action?: () => void;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children, currentPath = '/', toolbar }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, temClienteAssociado } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  
  // Sempre usar grid em desktop, feed em mobile (para economizar espaço no menu)
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 'grid' : 'feed';
    }
    return 'grid';
  });
  
  // Atualizar viewMode quando redimensionar (sempre grid em desktop)
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setViewMode('grid');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menu condicional baseado no tipo de usuário
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { icon: Home, label: 'Página Inicial', path: '/', id: 'home' },
      { icon: Search, label: 'Pesquisar/Explorar', path: '/search', id: 'search' },
      { icon: PlusCircle, label: 'Criar Post', path: '/posts/create', id: 'create' },
    ];

    // Adicionar link específico baseado no tipo de usuário
    if (user?.tipo === 'CLIENTE') {
      baseItems.push(
        { icon: FileText, label: 'Meus Posts', path: '/meus-posts', id: 'meus-posts' }
      );
    } else if (user?.tipo === 'PRESTADOR') {
      baseItems.push(
        { icon: Briefcase, label: 'Meus Serviços', path: '/meus-servicos', id: 'meus-servicos' }
      );
    }

    baseItems.push(
      { icon: MessageCircle, label: 'Mensagens', path: '/mensagens', id: 'messages' },
      { icon: Bell, label: 'Notificações', path: '/notificacoes', id: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: CheckCircle, label: 'Serviços Concluídos', path: '/servicos-concluidos', id: 'servicos-concluidos' },
      { icon: Wallet, label: 'Financeiro', path: '/financeiro', id: 'financeiro' },
      { separator: true, id: 'separator-1' },
      { icon: User, label: 'Meu Perfil', path: `/profile/${user?.id}`, id: 'profile' },
      { icon: Settings, label: 'Configurações', path: '/settings', id: 'settings' },
      { icon: LogOut, label: 'Sair', path: '/logout', id: 'logout', action: logout },
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  const isHybridProfile = user?.tipo === 'PRESTADOR' && (temClienteAssociado || (user as any)?.temClienteAssociado);

  const handleMenuClick = (item: any, closeMenu = false) => {
    if (closeMenu) {
      setIsMobileMenuOpen(false);
    }
    if (item.action) {
      item.action();
      router.push('/');
    } else if (item.path) {
      router.push(item.path);
    }
  };

  // Componente reutilizável para renderizar item do menu
  const renderMenuItem = (item: MenuItem, isMobile = false) => {
    if (item.separator) {
      return (
        <div key="separator" className="my-3 border-t border-gray-200" />
      );
    }

    const Icon = item.icon;
    const isActive = pathname === item.path || 
      (pathname?.startsWith(item.path!) && item.path !== '/');
    const IconComponent = Icon as React.ComponentType<any>;

    const baseClassName = `w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left ${
      isActive 
        ? 'bg-blue-50 text-blue-700 font-medium' 
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    }`;

    return (
      <button
        key={item.id}
        onClick={() => handleMenuClick(item, isMobile)}
        className={baseClassName}
      >
        <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex-col z-10">
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div onClick={() => router.push('/')} className="cursor-pointer">
            <Logo size="md" showText={true} />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => renderMenuItem(item, false))}
          </div>
        </nav>

        {/* User Info */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.nome?.substring(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.nome}</p>
              <p className="text-xs text-gray-500">
                {isHybridProfile ? 'Prestador/Cliente' : (user?.tipo === 'PRESTADOR' ? 'Prestador' : 'Cliente')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-60 w-full">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4">
            {/* Mobile Menu Button + Desktop Feed/Grid + Toolbar */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              {/* Botão Hamburger (Mobile) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Botões Feed/Grid removidos - sempre Grid em desktop */}

              {/* Toolbar inline (filtros, ações contextuais da página) */}
              {toolbar && (
                <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                  {toolbar}
                </div>
              )}
            </div>

            {/* (Removido) Barra de busca duplicada no header para evitar redundância com /search */}

            {/* Notifications & User */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Notificações */}
              <button
                onClick={() => setIsNotificationCenterOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Verification Banner */}
        {user && !user.verificado && <VerificationBanner />}

        {/* Notification Center */}
        <NotificationCenter 
          isOpen={isNotificationCenterOpen} 
          onClose={() => setIsNotificationCenterOpen(false)} 
        />

        {/* Content */}
        <LayoutViewModeContext.Provider value={{ viewMode, setViewMode }}>
          <main className="p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </LayoutViewModeContext.Provider>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed left-0 top-0 h-screen w-72 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            {/* Header do Drawer */}
            <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
              <div 
                onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }}
                className="cursor-pointer"
              >
                <Logo size="md" showText={true} />
              </div>
              <div className="flex items-center space-x-2">
                {/* Notificações no Mobile */}
                <button
                  onClick={() => { setIsNotificationCenterOpen(true); setIsMobileMenuOpen(false); }}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Notificações"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-3 space-y-1">
                {menuItems.map((item) => renderMenuItem(item, true))}
              </div>
            </nav>

            {/* User Info */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{user?.nome?.substring(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.nome}</p>
                  <p className="text-xs text-gray-500">
                    {isHybridProfile ? 'Prestador/Cliente' : (user?.tipo === 'PRESTADOR' ? 'Prestador' : 'Cliente')}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

// Contexto para disponibilizar o viewMode às páginas
interface LayoutViewModeValue {
  viewMode: 'feed' | 'grid';
  setViewMode: (m: 'feed' | 'grid') => void;
}

const LayoutViewModeContext = createContext<LayoutViewModeValue | null>(null);

export function useLayoutViewMode(): LayoutViewModeValue {
  const ctx = useContext(LayoutViewModeContext);
  if (!ctx) {
    return { viewMode: 'grid', setViewMode: () => {} };
  }
  return ctx;
}

