'use client';

import { usePathname, useRouter } from 'next/navigation';
import { getCurrentCarrier, removeToken } from '@/lib/auth';
import { Home, Clock, CheckCircle, Calendar, FileText, User, LogOut, PackageOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const carrier = getCurrentCarrier();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/missions/pending', icon: Clock, label: 'En attente' },
    { href: '/missions/accepted', icon: CheckCircle, label: 'Acceptées' },
    { href: '/palettes', icon: PackageOpen, label: 'Palettes' },
    { href: '/planning', icon: Calendar, label: 'Planning' },
    { href: '/documents', icon: FileText, label: 'Documents' },
    { href: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                RT
              </div>
              <span className="text-xl font-bold text-gray-900">Transporter</span>
            </div>
            <div className="flex items-center space-x-4">
              {carrier && (
                <div className="text-sm text-gray-600">
                  {carrier.name || carrier.carrierId}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[60px] ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 lg:flex lg:space-x-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
