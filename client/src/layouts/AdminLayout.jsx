import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutGrid,
  ShoppingBag,
  ClipboardList,
  List,
  FolderOpen,
  Settings,
  ChartBar,
  Star,
  LogOut,
  Menu,
  X,
  UtensilsCrossed,
  ReceiptText,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import NotificationBell from '../components/admin/NotificationBell.jsx';

const links = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Kitchen', to: '/admin/kitchen', icon: ClipboardList },
  { label: 'Menu', to: '/admin/menu', icon: List },
  { label: 'Categories', to: '/admin/categories', icon: FolderOpen },
  { label: 'Manual Order', to: '/admin/manual-orders', icon: UtensilsCrossed },
  { label: 'Tables', to: '/admin/tables', icon: Settings },
  { label: 'Billing', to: '/admin/billing', icon: ReceiptText },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const currentPage =
    links.find((item) => location.pathname === item.to)?.label ||
    'Restaurant operations';

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D96A3A] text-white shadow-lg shadow-[#D96A3A]/20">
            <UtensilsCrossed className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="font-serif text-xl font-semibold leading-none text-white">
              CloudCraves
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
              Kitchen Admin
            </p>
          </div>

          {mobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
          Restaurant
        </p>

        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => mobile && setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#D96A3A] text-white shadow-lg shadow-[#D96A3A]/15'
                      : 'text-white/60 hover:bg-white/[0.07] hover:text-white'
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />

                <span className="flex-1">{item.label}</span>

                <ChevronRight
                  className="h-4 w-4 opacity-0 transition group-hover:opacity-50"
                />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin profile */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D96A3A] text-sm font-semibold text-white">
            {admin?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {admin?.user?.name || 'Administrator'}
            </p>

            <p className="truncate text-xs text-white/40">
              {admin?.user?.email || 'Admin account'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition hover:border-[#D96A3A]/40 hover:bg-[#D96A3A]/10 hover:text-white"
        >
          <span>Sign out</span>
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241B2F]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] bg-[#241B2F] md:block">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#241B2F]/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[285px] bg-[#241B2F] shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent mobile />
      </aside>

      {/* Main area */}
      <div className="min-h-screen md:pl-[270px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-[#E8DED2] bg-[#FAF7F2]/95 backdrop-blur">
          <div className="flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8DED2] bg-white text-[#241B2F] md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A0959C] sm:block">
                  CloudCraves Kitchen
                </p>

                <h2 className="truncate font-serif text-xl font-semibold text-[#241B2F] sm:mt-0.5">
                  {currentPage}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden rounded-full border border-[#E8DED2] bg-white px-3 py-2 text-xs font-medium text-[#766D78] lg:block">
                Admin workspace
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8DED2] bg-white">
                <NotificationBell />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;