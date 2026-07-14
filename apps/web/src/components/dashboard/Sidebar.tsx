'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, LayoutDashboard, Building2, Search, BarChart3,
  Lightbulb, Download, Settings, Shield, LogOut, X, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/businesses', icon: Building2, label: 'Businesses' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { href: '/export', icon: Download, label: 'Export' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const adminItems = [
  { href: '/admin', icon: Shield, label: 'Admin Panel' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'nav-item group',
        isActive && 'nav-item-active',
      )}
    >
      <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
      <span>{label}</span>
      {isActive && (
        <ChevronRight className="w-4 h-4 ml-auto text-primary opacity-70" />
      )}
    </Link>
  );
}

export function DashboardSidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-800/50">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold gradient-text">BizOptics</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</p>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {user?.role === 'ADMIN' && (
          <div>
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Administration</p>
            {adminItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-800/50">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-slate-900/80 backdrop-blur border-r border-slate-800/50">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800/50 flex flex-col"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
