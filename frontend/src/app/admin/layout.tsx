'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/services/api';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  AlertCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (token) {
      api.setToken(token);
    }
  }, [token]);

  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      setIsMounted(true);
      return;
    }

    const { isAuthenticated: authStatus, user: currentUser } = useAuthStore.getState();
    
    if (authStatus && currentUser && currentUser.tipo === 'ADMIN') {
      setIsMounted(true);
      setIsCheckingAuth(false);
      return;
    }

    const isMobile = typeof window !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent);
    const delay = isMobile ? 100 : 30;
    
    const timer = setTimeout(() => {
      const { isAuthenticated: authStatus, user: currentUser } = useAuthStore.getState();
      
      if (!authStatus) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        setIsMounted(true);
        setIsCheckingAuth(false);
        return;
      }

      if (currentUser && currentUser.tipo !== 'ADMIN') {
        router.push('/');
        return;
      }
      
      setIsMounted(true);
      setIsCheckingAuth(false);
    }, delay);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (isCheckingAuth || !isMounted) return;
    if (!isAuthenticated || !user || user.tipo !== 'ADMIN') return;
    if (typeof window === 'undefined') return;
    if (!token) return;

    let socket: any = null;
    let isMountedRef = true;
    const userId = user.id;

    import('socket.io-client').then(({ io }) => {
      if (!isMountedRef) return;
      
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                       (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001');
      
      socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        if (!isMountedRef) return;
        socket.emit('join_admin', userId);
      });

      socket.on('admin_notification', (data: any) => {
        if (!isMountedRef) return;
        addToast({
          type: data.type || 'info',
          title: data.title || 'Notificação',
          description: data.message || ''
        });
        setNotificacoes(prev => [data, ...prev].slice(0, 10));
      });

      socket.on('disconnect', () => {
        if (!isMountedRef) return;
      });

      socket.on('error', (error: any) => {
        if (error && error.message && !error.message.includes('HMR')) {
          console.error('Admin WebSocket error:', error);
        }
      });
    }).catch(() => {
      console.warn('Socket.IO não disponível, notificações em tempo real desabilitadas');
    });

    return () => {
      isMountedRef = false;
      if (socket) {
        socket.off('connect');
        socket.off('admin_notification');
        socket.off('disconnect');
        socket.off('error');
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isCheckingAuth, token, isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated && user?.tipo === 'ADMIN' && isMounted && !isCheckingAuth) {
  } else if (!isMounted || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  } else if (!isAuthenticated || user?.tipo !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Usuários', href: '/admin/usuarios' },
    { icon: FileText, label: 'Posts', href: '/admin/posts' },
    { icon: DollarSign, label: 'Financeiro', href: '/admin/financeiro' },
    { icon: AlertCircle, label: 'Disputas', href: '/admin/disputas' },
    { icon: BarChart3, label: 'Relatórios', href: '/admin/relatorios' },
    { icon: Shield, label: 'Auditoria', href: '/admin/auditoria' },
    { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Logo size="sm" showText={false} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <SidebarContent menuItems={menuItems} user={user} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
          <SidebarContent menuItems={menuItems} user={user} onLogout={handleLogout} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          {/* Header Desktop */}
          <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-600">Gerencie o sistema ChamadoPro</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ 
  menuItems, 
  user, 
  onLogout 
}: { 
  menuItems: Array<{ icon: any; label: string; href: string }>;
  user: any;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Logo size="md" showText={true} />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExactMatch = pathname === item.href;
          const isSubRoute = item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/');
          const isActive = isExactMatch || isSubRoute;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            ADMIN
          </span>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </>
  );
}

