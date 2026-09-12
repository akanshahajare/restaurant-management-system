import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Phone,
  Menu,
  X,
  Utensils,
  ChevronRight,
  User,
  LogOut,
  ClipboardList,
  CircleUserRound,
} from 'lucide-react';

import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { restaurantConfig } from '../config/restaurant.js';

const CustomerLayout = () => {
  const { cartItems, tableNumber } = useCart();
  const { user, logoutCustomer } = useAuth();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef(null);

  const cartCount = cartItems?.length || 0;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const closeAccountMenu = () => {
    setAccountMenuOpen(false);
  };

  const handleLogout = () => {
    closeAccountMenu();
    closeMobileMenu();
    logoutCustomer();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayName =
    user?.user?.name ||
    user?.name ||
    'Account';

  const displayEmail =
    user?.user?.email ||
    user?.email ||
    '';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#29242A]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#3F3348] bg-[#241B2F] text-[#FAF7F2] shadow-[0_8px_30px_rgba(36,27,47,0.12)]">

        <div className="container-kitchen">

          <div className="flex h-[78px] items-center justify-between gap-4">

            {/* -------------------------------------------------
                LOGO
            -------------------------------------------------- */}

            <Link
              to="/"
              onClick={closeMobileMenu}
              className="group flex shrink-0 items-center gap-3"
            >

              <div
                className="
                  relative
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-full
                  border
                  border-[#D96A3A]
                  bg-[#D96A3A]
                  text-white
                  shadow-[0_6px_18px_rgba(217,106,58,0.25)]
                  transition
                  duration-200
                  group-hover:scale-105
                "
              >
                <Utensils className="h-[19px] w-[19px]" />
              </div>

              <div className="leading-none">

                <span
                  className="
                    block
                    font-serif
                    text-[20px]
                    leading-none
                    tracking-tight
                    text-[#FAF7F2]
                    sm:text-[23px]
                  "
                >
                  CloudCraves
                </span>

                <span
                  className="
                    mt-1
                    block
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.28em]
                    text-[#D96A3A]
                  "
                >
                  Kitchen
                </span>

              </div>

            </Link>


            {/* -------------------------------------------------
                DESKTOP NAVIGATION
            -------------------------------------------------- */}

            <nav className="hidden items-center gap-8 md:flex">

              <NavLink
                to="/"
                className={({ isActive }) =>
                  `
                    relative
                    py-2
                    text-[13px]
                    font-medium
                    tracking-wide
                    transition
                    duration-200
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-white/65 hover:text-white'
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    Home

                    {isActive && (
                      <span
                        className="
                          absolute
                          -bottom-[2px]
                          left-1/2
                          h-[2px]
                          w-5
                          -translate-x-1/2
                          rounded-full
                          bg-[#D96A3A]
                        "
                      />
                    )}
                  </>
                )}
              </NavLink>


              <NavLink
                to="/menu"
                className={({ isActive }) =>
                  `
                    relative
                    py-2
                    text-[13px]
                    font-medium
                    tracking-wide
                    transition
                    duration-200
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-white/65 hover:text-white'
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    Menu

                    {isActive && (
                      <span
                        className="
                          absolute
                          -bottom-[2px]
                          left-1/2
                          h-[2px]
                          w-5
                          -translate-x-1/2
                          rounded-full
                          bg-[#D96A3A]
                        "
                      />
                    )}
                  </>
                )}
              </NavLink>


              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `
                    relative
                    py-2
                    text-[13px]
                    font-medium
                    tracking-wide
                    transition
                    duration-200
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-white/65 hover:text-white'
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    Contact

                    {isActive && (
                      <span
                        className="
                          absolute
                          -bottom-[2px]
                          left-1/2
                          h-[2px]
                          w-5
                          -translate-x-1/2
                          rounded-full
                          bg-[#D96A3A]
                        "
                      />
                    )}
                  </>
                )}
              </NavLink>

            </nav>


            {/* -------------------------------------------------
                RIGHT SIDE ACTIONS
            -------------------------------------------------- */}

            <div className="flex items-center gap-2 sm:gap-3">

              {/* TABLE */}

              <div
                className="
                  hidden
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-4
                  py-2
                  text-[12px]
                  font-medium
                  sm:flex
                "
              >

                <span className="h-1.5 w-1.5 rounded-full bg-[#D96A3A]" />

                <span className="text-white/60">
                  Table
                </span>

                <span className="font-semibold text-white">
                  {tableNumber || '—'}
                </span>

              </div>


              {/* CONTACT */}

              <Link
                to="/contact"
                aria-label="Contact"
                className="
                  hidden
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.06]
                  text-white/75
                  transition
                  duration-200
                  hover:border-white/20
                  hover:bg-white/10
                  hover:text-white
                  sm:flex
                "
              >
                <Phone className="h-[17px] w-[17px]" />
              </Link>


              {/* CART */}

              <Link
                to="/checkout"
                aria-label={`Cart with ${cartCount} items`}
                className="
                  relative
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-3.5
                  text-[12px]
                  font-semibold
                  text-white
                  transition
                  duration-200
                  hover:border-[#D96A3A]/50
                  hover:bg-[#D96A3A]/10
                "
              >

                <ShoppingCart className="h-[17px] w-[17px]" />

                <span className="hidden sm:block">
                  Cart
                </span>

                {cartCount > 0 && (
                  <span
                    className="
                      grid
                      min-h-5
                      min-w-5
                      place-items-center
                      rounded-full
                      bg-[#D96A3A]
                      px-1
                      text-[10px]
                      font-bold
                      text-white
                    "
                  >
                    {cartCount}
                  </span>
                )}

              </Link>


              {/* CUSTOMER ACCOUNT / LOGIN */}

              <div
                ref={accountMenuRef}
                className="relative hidden md:block"
              >

                {user?.token ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setAccountMenuOpen((current) => !current)
                      }
                      aria-label="Open account menu"
                      aria-expanded={accountMenuOpen}
                      className="
                        flex
                        h-10
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-white/10
                        bg-white/[0.06]
                        px-3
                        text-white
                        transition
                        duration-200
                        hover:border-[#D96A3A]/50
                        hover:bg-white/10
                      "
                    >
                      <span
                        className="
                          grid
                          h-7
                          w-7
                          place-items-center
                          rounded-full
                          bg-[#D96A3A]
                          text-white
                        "
                      >
                        <User className="h-4 w-4" />
                      </span>

                      <span className="max-w-[100px] truncate text-[12px] font-semibold">
                        {displayName}
                      </span>
                    </button>


                    {accountMenuOpen && (
                      <div
                        className="
                          absolute
                          right-0
                          top-12
                          w-64
                          overflow-hidden
                          rounded-2xl
                          border
                          border-[#E7DDD3]
                          bg-white
                          text-[#241B2F]
                          shadow-[0_15px_40px_rgba(36,27,47,0.18)]
                        "
                      >

                        <div className="border-b border-[#EEE7E0] px-4 py-4">
                          <div className="flex items-center gap-3">

                            <div
                              className="
                                grid
                                h-10
                                w-10
                                shrink-0
                                place-items-center
                                rounded-full
                                bg-[#D96A3A]
                                text-white
                              "
                            >
                              <User className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {displayName}
                              </p>

                              {displayEmail && (
                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {displayEmail}
                                </p>
                              )}
                            </div>

                          </div>
                        </div>


                        <div className="p-2">

                          <Link
                            to="/profile"
                            onClick={closeAccountMenu}
                            className="
                              flex
                              items-center
                              gap-3
                              rounded-xl
                              px-3
                              py-2.5
                              text-sm
                              font-medium
                              transition
                              hover:bg-[#FAF7F2]
                            "
                          >
                            <CircleUserRound className="h-4 w-4 text-[#D96A3A]" />
                            Profile
                          </Link>


                          <Link
                            to="/my-orders"
                            onClick={closeAccountMenu}
                            className="
                              flex
                              items-center
                              gap-3
                              rounded-xl
                              px-3
                              py-2.5
                              text-sm
                              font-medium
                              transition
                              hover:bg-[#FAF7F2]
                            "
                          >
                            <ClipboardList className="h-4 w-4 text-[#D96A3A]" />
                            My Orders
                          </Link>

                        </div>


                        <div className="border-t border-[#EEE7E0] p-2">

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-3
                              py-2.5
                              text-left
                              text-sm
                              font-medium
                              text-red-600
                              transition
                              hover:bg-red-50
                            "
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>

                        </div>

                      </div>
                    )}

                  </>
                ) : (
                  <Link
                    to="/login"
                    className="
                      flex
                      h-10
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-[#D96A3A]/50
                      bg-[#D96A3A]
                      px-4
                      text-[12px]
                      font-semibold
                      text-white
                      transition
                      duration-200
                      hover:bg-[#C85D31]
                    "
                  >
                    <User className="h-[16px] w-[16px]" />
                    <span>Login</span>
                  </Link>
                )}

              </div>


              {/* MOBILE MENU */}

              <button
                type="button"
                aria-label={
                  mobileMenuOpen
                    ? 'Close navigation'
                    : 'Open navigation'
                }
                aria-expanded={mobileMenuOpen}
                onClick={() =>
                  setMobileMenuOpen((current) => !current)
                }
                className="
                  grid
                  h-10
                  w-10
                  place-items-center
                  rounded-full
                  bg-[#D96A3A]
                  text-white
                  transition
                  duration-200
                  hover:bg-[#C85D31]
                  md:hidden
                "
              >
                {mobileMenuOpen ? (
                  <X className="h-[18px] w-[18px]" />
                ) : (
                  <Menu className="h-[18px] w-[18px]" />
                )}
              </button>

            </div>

          </div>

        </div>


        {/* ===================================================
            MOBILE NAVIGATION
        ==================================================== */}

        {mobileMenuOpen && (
          <div
            className="
              border-t
              border-white/10
              bg-[#241B2F]
              md:hidden
            "
          >

            <div className="container-kitchen py-4">

              {/* ACCOUNT */}

              {user?.token ? (
                <div
                  className="
                    mb-3
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.05]
                    p-4
                  "
                >
                  <div className="flex items-center gap-3">

                    <div
                      className="
                        grid
                        h-10
                        w-10
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-[#D96A3A]
                        text-white
                      "
                    >
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {displayName}
                      </p>

                      {displayEmail && (
                        <p className="truncate text-xs text-white/45">
                          {displayEmail}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">

                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2.5
                        text-xs
                        font-medium
                        text-white/80
                        transition
                        hover:bg-white/10
                        hover:text-white
                      "
                    >
                      <CircleUserRound className="h-4 w-4" />
                      Profile
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={closeMobileMenu}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2.5
                        text-xs
                        font-medium
                        text-white/80
                        transition
                        hover:bg-white/10
                        hover:text-white
                      "
                    >
                      <ClipboardList className="h-4 w-4" />
                      My Orders
                    </Link>

                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      mt-2
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-3
                      py-2.5
                      text-xs
                      font-medium
                      text-red-300
                      transition
                      hover:bg-red-500/10
                    "
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>

                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="
                    mb-3
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[#D96A3A]
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#C85D31]
                  "
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
              )}


              {/* TABLE INFO */}

              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.05]
                  px-4
                  py-3
                "
              >

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Ordering for
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    Table {tableNumber || '—'}
                  </p>

                </div>

                <span className="h-2 w-2 rounded-full bg-[#D96A3A]" />

              </div>


              {/* LINKS */}

              <div className="overflow-hidden rounded-2xl border border-white/10">

                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/10
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-white/80
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  Home
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </Link>

                <Link
                  to="/menu"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/10
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-white/80
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  Menu
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </Link>

                <Link
                  to="/contact"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/10
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-white/80
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  Contact
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </Link>

                <Link
                  to="/checkout"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/10
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-white/80
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  Cart
                  <div className="flex items-center gap-2">
                    {cartCount > 0 && (
                      <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-[#D96A3A] px-1 text-[10px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-white/30" />
                  </div>
                </Link>

                <Link
                  to="/admin/login"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-white/50
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  Admin
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </Link>

              </div>

            </div>

          </div>
        )}

      </header>


      {/* =====================================================
    PAGE CONTENT
====================================================== */}

<main className="min-h-[calc(100vh-78px)]">
  <div className="container-kitchen py-6 sm:py-8 lg:py-10">
    <Outlet />
  </div>
</main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#E7DDD3] bg-[#241B2F] text-[#FAF7F2]">

        <div className="container-kitchen">

          <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">

            {/* BRAND */}

            <div>

              <div className="flex items-center gap-3">

                <div
                  className="
                    grid
                    h-10
                    w-10
                    place-items-center
                    rounded-full
                    bg-[#D96A3A]
                    text-white
                  "
                >
                  <Utensils className="h-[17px] w-[17px]" />
                </div>

                <div>

                  <p className="font-serif text-xl">
                    CloudCraves
                  </p>

                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#D96A3A]">
                    Kitchen
                  </p>

                </div>

              </div>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
                {restaurantConfig.tagline}{' '}
                Freshly prepared food and a simple digital
                dining experience.
              </p>

            </div>


            {/* QUICK LINKS */}

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D96A3A]">
                Explore
              </p>

              <div className="mt-4 flex flex-col gap-3">

                <Link
                  to="/menu"
                  className="w-fit text-sm text-white/60 transition hover:text-white"
                >
                  Our Menu
                </Link>

                <Link
                  to="/contact"
                  className="w-fit text-sm text-white/60 transition hover:text-white"
                >
                  Contact Us
                </Link>

                <Link
                  to="/checkout"
                  className="w-fit text-sm text-white/60 transition hover:text-white"
                >
                  Your Cart
                </Link>

                {user?.token && (
                  <>
                    <Link
                      to="/profile"
                      className="w-fit text-sm text-white/60 transition hover:text-white"
                    >
                      Your Profile
                    </Link>

                    <Link
                      to="/my-orders"
                      className="w-fit text-sm text-white/60 transition hover:text-white"
                    >
                      My Orders
                    </Link>
                  </>
                )}

              </div>

            </div>


            {/* ORDERING */}

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D96A3A]">
                Your Table
              </p>

              <p className="mt-4 text-sm leading-6 text-white/55">
                You are currently ordering for
              </p>

              <p className="mt-1 font-serif text-2xl text-white">
                Table {tableNumber || '—'}
              </p>

              <Link
                to="/menu"
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-[#D96A3A]
                  transition
                  hover:text-[#F27A3D]
                "
              >
                Start ordering
                <ChevronRight className="h-4 w-4" />
              </Link>

            </div>

          </div>


          {/* COPYRIGHT */}

          <div
            className="
              flex
              flex-col
              gap-2
              border-t
              border-white/10
              py-5
              text-xs
              text-white/40
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <p>
              © {new Date().getFullYear()} CloudCraves Kitchen. All rights reserved.
            </p>

            <p>
              Fresh food. Simple ordering.
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default CustomerLayout;