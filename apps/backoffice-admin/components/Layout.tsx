import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from './ui/Button';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Organisations', href: '/orgs' },
  { name: 'Tarifs', href: '/pricing' },
  { name: 'État des services', href: '/health' },
];

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_jwt');
    setIsLoggedIn(!!token);
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_jwt');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RT</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  RT <span className="text-primary-600">Technologie</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-3">
              <a
                href={process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://www.rt-technologie.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                Support
              </a>
              {isLoggedIn ? (
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RT</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">RT Technologie</span>
              </div>
              <p className="text-gray-600 text-sm max-w-md">
                Plateforme SaaS de gestion logistique et transport multimodal.
                Optimisez vos flux avec notre solution tout-en-un : vigilance, planification,
                e-CMR et intelligence artificielle.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Produit
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/pricing" className="text-gray-600 hover:text-primary-600 text-sm">
                    Tarification
                  </Link>
                </li>
                <li>
                  <Link href="/health" className="text-gray-600 hover:text-primary-600 text-sm">
                    État des services
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
                    Documentation API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href={process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://www.rt-technologie.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600 text-sm"
                  >
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@rt-technologie.com"
                    className="text-gray-600 hover:text-primary-600 text-sm"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm text-center">
              &copy; {new Date().getFullYear()} RT Technologie. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
