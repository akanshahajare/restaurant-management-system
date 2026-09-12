import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Leaf,
  Plus,
  ShieldCheck,
  Star,
  Utensils,
  UsersRound,
} from 'lucide-react';

import api from '../../services/api.js';
import { restaurantConfig } from '../../config/restaurant.js';
import { useCart } from '../../context/CartContext.jsx';

/*
 * ---------------------------------------------------------
 * HOMEPAGE HERO DISHES
 * ---------------------------------------------------------
 *
 * These are local images from:
 *
 * client/public/images/menu/
 *
 * A random dish is selected every time the WelcomePage
 * component mounts.
 */

const heroDishes = [
  {
    name: 'Butter Chicken',
    image: '/images/menu/butter-chicken.jpg',
    price: 320,
    rating: 4.7,
  },
  {
    name: 'Chicken Biryani',
    image: '/images/menu/chicken-biryani.jpg',
    price: 300,
    rating: 4.8,
  },
  {
    name: 'Mutton Biryani',
    image: '/images/menu/mutton-biryani.jpg',
    price: 360,
    rating: 4.8,
  },
  {
    name: 'Chicken Tikka',
    image: '/images/menu/chicken-tikka.jpg',
    price: 280,
    rating: 4.6,
  },
  {
    name: 'Tandoori Chicken',
    image: '/images/menu/tandoori-chicken.jpg',
    price: 340,
    rating: 4.7,
  },
  {
    name: 'Paneer Butter Masala',
    image: '/images/menu/paneer-butter-masala.jpg',
    price: 280,
    rating: 4.6,
  },
  {
    name: 'Kadai Paneer',
    image: '/images/menu/kadai-paneer.jpg',
    price: 270,
    rating: 4.5,
  },
  {
    name: 'Margherita Pizza',
    image: '/images/menu/margherita-pizza.jpg',
    price: 280,
    rating: 4.6,
  },
  {
    name: 'Peri Peri Chicken Pizza',
    image: '/images/menu/peri-peri-chicken-pizza.jpg',
    price: 360,
    rating: 4.7,
  },
  {
    name: 'Chicken Shawarma',
    image: '/images/menu/chicken-shawarma.jpg',
    price: 240,
    rating: 4.6,
  },
  {
    name: 'Chocolate Brownie',
    image: '/images/menu/chocolate-brownie.jpg',
    price: 180,
    rating: 4.5,
  },
  {
    name: 'Mango Cheesecake',
    image: '/images/menu/mango-cheesecake.jpg',
    price: 220,
    rating: 4.6,
  },
];

const WelcomePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    tableNumber,
    setTableNumber,
    cartItems,
    addToCart,
  } = useCart();

  /*
   * ---------------------------------------------------------
   * RANDOM HERO DISH
   * ---------------------------------------------------------
   *
   * useState initializer runs when this page mounts.
   * Therefore a new dish is selected when the user enters
   * the Welcome page again.
   */

  const [heroDish] = useState(() => {
    const randomIndex = Math.floor(
      Math.random() * heroDishes.length
    );

    return heroDishes[randomIndex];
  });

  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  /*
   * ---------------------------------------------------------
   * TABLE NUMBER
   * ---------------------------------------------------------
   *
   * QR code example:
   *
   * /?table=2
   *
   * We preserve this existing functionality.
   */

  useEffect(() => {
    const tableParam = searchParams.get('table');

    if (tableParam) {
      setTableNumber(tableParam);
      sessionStorage.setItem('rm-table', tableParam);
      return;
    }

    const storedTable = sessionStorage.getItem('rm-table');

    if (storedTable) {
      setTableNumber(storedTable);
    }
  }, [searchParams, setTableNumber]);

  /*
   * ---------------------------------------------------------
   * LOAD REAL FEATURED FOOD FROM BACKEND
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadFeaturedFood = async () => {
      try {
        const response = await api.get('/menu', {
          params: {
            recommended: 'true',
            availability: 'available',
          },
        });

        if (!mounted) return;

        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setFeaturedItems(items.slice(0, 3));
      } catch (error) {
        console.error('Unable to load featured menu:', error);

        if (mounted) {
          setFeaturedItems([]);
        }
      } finally {
        if (mounted) {
          setLoadingFeatured(false);
        }
      }
    };

    loadFeaturedFood();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * START ORDERING
   * ---------------------------------------------------------
   */

  const handleStartOrdering = () => {
    const selectedTable = String(tableNumber || '').trim();

    if (!selectedTable) {
      return;
    }

    sessionStorage.setItem('rm-table', selectedTable);
    setTableNumber(selectedTable);

    navigate('/menu');
  };

  /*
   * ---------------------------------------------------------
   * ADD FOOD TO CART
   * ---------------------------------------------------------
   */

  const handleAddToCart = (item) => {
    addToCart({
      foodId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      instructions: '',
    });
  };

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative bg-[#FAF7F2]">

        <div className="container-kitchen">

          <div className="grid min-h-[calc(100vh-78px)] items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-14">

            {/* -------------------------------------------------
                LEFT — RESTAURANT INTRO
            -------------------------------------------------- */}

            <div className="order-2 relative z-10 lg:order-1">

              <div className="max-w-xl">

                {/* EYEBROW */}

                <div className="restaurant-eyebrow">
                  Welcome to our kitchen
                </div>


                {/* TITLE */}

                <h1 className="mt-5 max-w-xl text-[3.5rem] leading-[0.94] sm:text-6xl lg:text-7xl">

                  Good food.

                  <span className="mt-2 block text-[#D96A3A]">
                    Good mood.
                  </span>

                </h1>


                {/* DECORATIVE DIVIDER */}

                <div className="mt-7 flex items-center gap-3">

                  <div className="restaurant-divider" />

                  <Utensils
                    className="h-4 w-4 text-[#D96A3A]"
                    strokeWidth={1.6}
                  />

                  <div className="restaurant-divider" />

                </div>


                {/* DESCRIPTION */}

                <p className="mt-7 max-w-lg text-[15px] leading-7 text-[#766E68] sm:text-base">
                  {restaurantConfig.description}
                  {' '}
                  Browse our menu, choose your favourites and
                  enjoy a simple digital dining experience right
                  from your table.
                </p>


                {/* TABLE + START ORDERING */}

                <div className="mt-9 max-w-xl">

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">

                    {/* TABLE */}

                    <label
                      htmlFor="table-number"
                      className="
                        flex
                        min-h-[58px]
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[#E7DDD3]
                        bg-white
                        px-4
                        shadow-[0_8px_25px_rgba(36,27,47,0.04)]
                      "
                    >

                      <span
                        className="
                          grid
                          h-9
                          w-9
                          shrink-0
                          place-items-center
                          rounded-full
                          bg-[#F4DFD2]
                          text-[#D96A3A]
                        "
                      >
                        <UsersRound className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">

                        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A9189]">
                          Your table
                        </span>

                        <input
                          id="table-number"
                          type="text"
                          inputMode="numeric"
                          value={tableNumber}
                          onChange={(event) =>
                            setTableNumber(event.target.value)
                          }
                          className="
                            mt-0.5
                            w-full
                            bg-transparent
                            text-sm
                            font-bold
                            text-[#241B2F]
                            outline-none
                          "
                          aria-label="Table number"
                        />

                      </span>

                    </label>


                    {/* START BUTTON */}

                    <button
                      type="button"
                      onClick={handleStartOrdering}
                      className="
                        group
                        inline-flex
                        min-h-[58px]
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#D96A3A]
                        px-6
                        text-sm
                        font-bold
                        text-white
                        shadow-[0_12px_25px_rgba(217,106,58,0.20)]
                        transition
                        duration-200
                        hover:-translate-y-0.5
                        hover:bg-[#C85D31]
                        hover:shadow-[0_16px_30px_rgba(217,106,58,0.26)]
                        sm:px-7
                      "
                    >

                      Start Ordering

                      <ArrowRight
                        className="
                          h-4
                          w-4
                          transition
                          duration-200
                          group-hover:translate-x-1
                        "
                      />

                    </button>

                  </div>

                </div>


                {/* TRUST POINTS */}

                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">

                  <div className="flex items-center gap-2">

                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F4DFD2] text-[#D96A3A]">
                      <Leaf className="h-3.5 w-3.5" />
                    </span>

                    <span className="text-xs font-semibold text-[#5F5852]">
                      Fresh ingredients
                    </span>

                  </div>


                  <span className="hidden h-4 w-px bg-[#D9CEC4] sm:block" />


                  <div className="flex items-center gap-2">

                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F4DFD2] text-[#D96A3A]">
                      <Clock3 className="h-3.5 w-3.5" />
                    </span>

                    <span className="text-xs font-semibold text-[#5F5852]">
                      Made to order
                    </span>

                  </div>


                  <span className="hidden h-4 w-px bg-[#D9CEC4] sm:block" />


                  <div className="flex items-center gap-2">

                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F4DFD2] text-[#D96A3A]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>

                    <span className="text-xs font-semibold text-[#5F5852]">
                      Secure payments
                    </span>

                  </div>

                </div>


                {/* CART REMINDER */}

                {cartItems.length > 0 && (
                  <Link
                    to="/checkout"
                    className="
                      mt-6
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      font-bold
                      text-[#D96A3A]
                      transition
                      hover:text-[#C85D31]
                    "
                  >

                    You have {cartItems.length} item
                    {cartItems.length !== 1 ? 's' : ''} in your cart

                    <ChevronRight className="h-4 w-4" />

                  </Link>
                )}

              </div>

            </div>


            {/* -------------------------------------------------
                RIGHT — RANDOM HERO FOOD IMAGE
            -------------------------------------------------- */}

            <div className="order-1 relative lg:order-2">

              {/* Decorative background circle */}

              <div
                className="
                  absolute
                  -right-12
                  top-1/2
                  hidden
                  h-[520px]
                  w-[520px]
                  -translate-y-1/2
                  rounded-full
                  bg-[#3D2852]
                  lg:block
                "
              />


              {/* Decorative ring */}

              <div
                className="
                  absolute
                  -right-2
                  top-1/2
                  hidden
                  h-[570px]
                  w-[570px]
                  -translate-y-1/2
                  rounded-full
                  border
                  border-[#3D2852]/20
                  lg:block
                "
              />


              {/* IMAGE CONTAINER */}

              <div className="relative mx-auto w-full max-w-[680px]">

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[32px]
                    bg-[#F1E9DE]
                    shadow-[0_30px_70px_rgba(36,27,47,0.14)]
                    lg:rounded-[42px]
                  "
                >

                  <div className="aspect-[1.08/1] sm:aspect-[1.15/1]">

                    <img
                      src={heroDish.image}
                      alt={`Freshly prepared ${heroDish.name}`}
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />

                  </div>


                  {/* IMAGE OVERLAY */}

                  <div
                    className="
                      absolute
                      inset-x-0
                      bottom-0
                      bg-gradient-to-t
                      from-[#241B2F]/70
                      via-[#241B2F]/15
                      to-transparent
                      px-5
                      pb-5
                      pt-20
                      sm:px-7
                      sm:pb-7
                    "
                  >

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F4B18D]">
                          From our kitchen
                        </p>

                        <p className="mt-1 font-serif text-2xl text-white sm:text-3xl">
                          {heroDish.name}
                        </p>

                      </div>


                      <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#241B2F]">
                        ₹{heroDish.price}
                      </span>

                    </div>

                  </div>

                </div>


                {/* FLOATING RATING */}

                <div
                  className="
                    absolute
                    -bottom-5
                    left-5
                    rounded-2xl
                    border
                    border-[#E7DDD3]
                    bg-white
                    px-4
                    py-3
                    shadow-[0_15px_40px_rgba(36,27,47,0.12)]
                    sm:left-8
                  "
                >

                  <div className="flex items-center gap-2">

                    <Star
                      className="h-4 w-4 fill-[#D96A3A] text-[#D96A3A]"
                    />

                    <span className="text-sm font-bold text-[#241B2F]">
                      {heroDish.rating}
                    </span>

                  </div>

                  <p className="mt-0.5 text-[10px] text-[#766E68]">
                    Customer favourite
                  </p>

                </div>


                {/* FLOATING BADGE */}

                <div
                  className="
                    absolute
                    -right-2
                    top-6
                    hidden
                    rounded-2xl
                    border
                    border-[#E7DDD3]
                    bg-white
                    px-4
                    py-3
                    shadow-[0_15px_40px_rgba(36,27,47,0.10)]
                    sm:block
                    lg:-right-5
                  "
                >

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9A9189]">
                    Ordering for
                  </p>

                  <p className="mt-1 font-serif text-lg text-[#241B2F]">
                    Table {tableNumber || '—'}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURE STRIP
      ====================================================== */}

      <section className="border-y border-[#E7DDD3] bg-[#F1E9DE]">

        <div className="container-kitchen">

          <div className="grid divide-y divide-[#D9CEC4] md:grid-cols-3 md:divide-x md:divide-y-0">

            <div className="flex items-center gap-4 px-0 py-6 md:px-8 md:first:pl-0">

              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#D96A3A]">
                <Leaf className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-serif text-lg text-[#241B2F]">
                  Fresh ingredients
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#766E68]">
                  Quality ingredients in every dish.
                </p>

              </div>

            </div>


            <div className="flex items-center gap-4 px-0 py-6 md:px-8">

              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#D96A3A]">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-serif text-lg text-[#241B2F]">
                  Made to order
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#766E68]">
                  Prepared fresh after you order.
                </p>

              </div>

            </div>


            <div className="flex items-center gap-4 px-0 py-6 md:px-8 md:last:pr-0">

              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#D96A3A]">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-serif text-lg text-[#241B2F]">
                  Easy & secure
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#766E68]">
                  Simple ordering and secure payments.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURED MENU
      ====================================================== */}

      <section className="bg-[#FAF7F2] py-20 lg:py-24">

        <div className="container-kitchen">

          {/* SECTION HEADING */}

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="restaurant-eyebrow">
                From our kitchen
              </p>

              <h2 className="mt-3 text-4xl sm:text-5xl">
                Our favourites
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#766E68]">
                A few dishes our guests keep coming back for.
              </p>

            </div>


            <Link
              to="/menu"
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-bold
                text-[#D96A3A]
                transition
                hover:text-[#C85D31]
              "
            >

              Explore full menu

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition
                  duration-200
                  group-hover:translate-x-1
                "
              />

            </Link>

          </div>


          {/* LOADING */}

          {loadingFeatured && (
            <div className="mt-10 grid gap-6 md:grid-cols-3">

              {[1, 2, 3].map((item) => (

                <div
                  key={item}
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[#E7DDD3]
                    bg-white
                  "
                >

                  <div className="aspect-[4/3] animate-pulse bg-[#EDE5DC]" />

                  <div className="space-y-3 p-5">

                    <div className="h-6 w-2/3 animate-pulse rounded bg-[#EDE5DC]" />

                    <div className="h-4 w-full animate-pulse rounded bg-[#EDE5DC]" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#EDE5DC]" />

                  </div>

                </div>

              ))}

            </div>
          )}


          {/* FOOD CARDS */}

          {!loadingFeatured && featuredItems.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-3">

              {featuredItems.map((item) => (

                <article
                  key={item._id}
                  className="
                    group
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[#E7DDD3]
                    bg-white
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-[0_22px_50px_rgba(36,27,47,0.10)]
                  "
                >

                  {/* IMAGE */}

                  <Link
                    to={`/menu/${item._id}`}
                    className="block overflow-hidden"
                  >

                    <div className="relative aspect-[4/3] bg-[#F1E9DE]">

                      <img
                        src={
                          item.image ||
                          '/images/menu/paneer-tikka.jpg'
                        }
                        alt={item.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-500
                          group-hover:scale-105
                        "
                      />


                      {/* VEG INDICATOR */}

                      <div
                        className="
                          absolute
                          left-4
                          top-4
                          grid
                          h-7
                          w-7
                          place-items-center
                          rounded-full
                          bg-white
                          shadow-sm
                        "
                        title={
                          item.isVeg
                            ? 'Vegetarian'
                            : 'Non-vegetarian'
                        }
                      >

                        <span
                          className={`
                            h-3
                            w-3
                            rounded-full
                            border-2
                            ${
                              item.isVeg
                                ? 'border-[#3F7D57]'
                                : 'border-[#B94A3C]'
                            }
                          `}
                        />

                      </div>


                      {/* SPECIAL */}

                      {item.isSpecial && (
                        <span
                          className="
                            absolute
                            right-4
                            top-4
                            rounded-full
                            bg-[#241B2F]
                            px-3
                            py-1.5
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-white
                          "
                        >
                          Special
                        </span>
                      )}

                    </div>

                  </Link>


                  {/* CONTENT */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <Link to={`/menu/${item._id}`}>

                          <h3 className="truncate font-serif text-2xl text-[#241B2F] transition group-hover:text-[#D96A3A]">
                            {item.name}
                          </h3>

                        </Link>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#766E68]">
                          {item.description ||
                            'Freshly prepared and made to order.'}
                        </p>

                      </div>


                      <span className="shrink-0 font-serif text-xl text-[#D96A3A]">
                        ₹{item.price}
                      </span>

                    </div>


                    <div className="mt-5 flex items-center justify-between gap-3">

                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#766E68]">

                        <Star
                          className="h-3.5 w-3.5 fill-[#D96A3A] text-[#D96A3A]"
                        />

                        {Number(item.rating || 0).toFixed(1)}

                      </span>


                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-[#241B2F]
                          px-4
                          py-2
                          text-xs
                          font-bold
                          text-white
                          transition
                          hover:bg-[#3D2852]
                        "
                      >

                        <Plus className="h-3.5 w-3.5" />

                        Add

                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>
          )}


          {/* NO FEATURED ITEMS */}

          {!loadingFeatured && featuredItems.length === 0 && (
            <div
              className="
                mt-10
                rounded-3xl
                border
                border-dashed
                border-[#D9CEC4]
                bg-[#F1E9DE]
                px-6
                py-12
                text-center
              "
            >

              <Utensils className="mx-auto h-8 w-8 text-[#D96A3A]" />

              <h3 className="mt-4 font-serif text-2xl text-[#241B2F]">
                Our menu is getting ready
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#766E68]">
                Head over to the full menu to see what&apos;s available.
              </p>

              <Link
                to="/menu"
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#D96A3A]
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-[#C85D31]
                "
              >

                View Menu

                <ArrowRight className="h-4 w-4" />

              </Link>

            </div>
          )}

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="bg-[#3D2852] text-white">

        <div className="container-kitchen">

          <div className="grid items-center gap-10 py-16 md:grid-cols-[1fr_auto] md:py-20">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#F4B18D]">
                Ready when you are
              </p>

              <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-white sm:text-5xl">
                Something delicious is waiting for you.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                Browse the menu, pick your favourites and we&apos;ll
                take care of the rest.
              </p>

            </div>


            <button
              type="button"
              onClick={handleStartOrdering}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#D96A3A]
                px-6
                text-sm
                font-bold
                text-white
                transition
                hover:bg-[#C85D31]
                md:min-w-[190px]
              "
            >

              Start Ordering

              <ArrowRight className="h-4 w-4" />

            </button>

          </div>

        </div>

      </section>

    </div>
  );
};

export default WelcomePage;