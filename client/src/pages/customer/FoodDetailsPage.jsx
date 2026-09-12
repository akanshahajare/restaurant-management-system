import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  Clock3,
  Star,
  Flame,
  Leaf,
  ShoppingBag,
} from 'lucide-react';

import api from '../../services/api';
import { useCart } from '../../context/CartContext';

const getImageUrl = (image) => {
  if (!image) return '/images/menu/paneer-tikka.jpg';

  if (image.startsWith('http')) return image;

  if (image.startsWith('/')) return image;

  return `/${image}`;
};

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString('en-IN')}`;

export default function FoodDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    cartItems,
    addToCart,
    updateQuantity,
    toggleFavorite,
    favorites,
  } = useCart();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  /*
   * ---------------------------------------------------------
   * LOAD FOOD ITEM
   * ---------------------------------------------------------
   *
   * Use the dedicated backend endpoint:
   *
   * GET /api/menu/:id
   *
   * This is better than loading the entire menu and
   * searching for the selected item on the frontend.
   */

  useEffect(() => {
    const loadFood = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/menu/${id}`);

        const found = response.data?.data || response.data;

        if (!found) {
          setError('Food item not found.');
          return;
        }

        setFood(found);
      } catch (err) {
        console.error('Failed to load food:', err);

        setError(
          err.response?.data?.message ||
            'Unable to load this food item.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadFood();
    }
  }, [id]);

  /*
   * ---------------------------------------------------------
   * CART
   * ---------------------------------------------------------
   */

  const foodId = food?._id || food?.id;

  const cartItem = cartItems.find(
    (item) =>
      String(item.foodId || item._id || item.id) ===
      String(foodId)
  );

  const cartQuantity = Number(cartItem?.quantity || 0);

  /*
   * ---------------------------------------------------------
   * FAVORITE
   * ---------------------------------------------------------
   */

  const isFavorite = favorites?.some(
    (item) =>
      String(item?._id || item?.id || item) ===
      String(foodId)
  );

  /*
   * ---------------------------------------------------------
   * ADD TO CART
   * ---------------------------------------------------------
   */

  const handleAddToCart = () => {
    if (!food) return;

    addToCart(food, quantity, instructions);
  };

  /*
   * ---------------------------------------------------------
   * QUANTITY
   * ---------------------------------------------------------
   */

  const handleIncrease = () => {
    setQuantity((value) => value + 1);
  };

  const handleDecrease = () => {
    setQuantity((value) => Math.max(1, value - 1));
  };

  /*
   * ---------------------------------------------------------
   * EXISTING CART QUANTITY
   * ---------------------------------------------------------
   */

  const handleCartIncrease = () => {
    if (!cartItem) return;

    updateQuantity(
      cartItem.foodId || cartItem._id || cartItem.id,
      cartQuantity + 1
    );
  };

  const handleCartDecrease = () => {
    if (!cartItem) return;

    updateQuantity(
      cartItem.foodId || cartItem._id || cartItem.id,
      cartQuantity - 1
    );
  };

  /*
   * ---------------------------------------------------------
   * LOADING STATE
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="container-kitchen py-8">
          <div className="h-5 w-24 animate-pulse rounded bg-[#E7DDD3]" />

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-[28px] bg-[#EDE5DC]" />

            <div className="space-y-5 py-4">
              <div className="h-5 w-32 animate-pulse rounded bg-[#E7DDD3]" />

              <div className="h-12 w-3/4 animate-pulse rounded bg-[#E7DDD3]" />

              <div className="h-5 w-full animate-pulse rounded bg-[#E7DDD3]" />

              <div className="h-5 w-2/3 animate-pulse rounded bg-[#E7DDD3]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR STATE
   * ---------------------------------------------------------
   */

  if (error || !food) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="container-kitchen py-16 text-center">
          <p className="restaurant-eyebrow">
            Oops
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#241B2F]">
            {error || 'Food item not found'}
          </h1>

          <Link
            to="/menu"
            className="mt-8 inline-flex rounded-full bg-[#241B2F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3D2852]"
          >
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * FOOD DETAILS
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#29242A]">
      <main className="container-kitchen py-6 pb-32 sm:py-10 lg:py-14">

        {/* ===================================================
            BACK BUTTON
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#766E68] transition hover:text-[#D96A3A]"
        >
          <ArrowLeft size={17} />

          Back to menu
        </button>


        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">

          {/* =================================================
              IMAGE
          ================================================== */}

          <div className="relative">

            <div className="sticky top-24 overflow-hidden rounded-[28px] bg-[#F1E9DE]">

              <div className="aspect-square sm:aspect-[5/4] lg:aspect-square">

                <img
                  src={getImageUrl(food.image)}
                  alt={food.name}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src =
                      '/images/menu/paneer-tikka.jpg';
                  }}
                />

              </div>


              {/* ===========================================
                  BADGES
              ============================================ */}

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">

                {food.isSpecial && (
                  <span className="rounded-full bg-[#D96A3A] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                    Chef&apos;s special
                  </span>
                )}

                {food.isRecommended && (
                  <span className="rounded-full bg-[#241B2F] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                    Recommended
                  </span>
                )}

              </div>


              {/* ===========================================
                  FAVORITE
              ============================================ */}

              <button
                type="button"
                onClick={() => toggleFavorite(food)}
                className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#241B2F] shadow-md transition hover:scale-105"
                aria-label="Toggle favorite"
              >
                <Heart
                  size={20}
                  fill={isFavorite ? '#D96A3A' : 'none'}
                  className={
                    isFavorite
                      ? 'text-[#D96A3A]'
                      : ''
                  }
                />
              </button>

            </div>

          </div>


          {/* =================================================
              DETAILS
          ================================================== */}

          <div className="flex flex-col justify-center">

            {/* =============================================
                CATEGORY
            ============================================== */}

            <p className="restaurant-eyebrow">
              {typeof food.category === 'object'
                ? food.category?.name || 'From our kitchen'
                : food.category || 'From our kitchen'}
            </p>


            {/* =============================================
                NAME
            ============================================== */}

            <h1 className="mt-3 font-serif text-5xl leading-[0.95] tracking-[-0.04em] text-[#241B2F] sm:text-6xl">
              {food.name}
            </h1>


            {/* =============================================
                RATING + VEG
            ============================================== */}

            <div className="mt-5 flex flex-wrap items-center gap-4">

              {food.rating !== undefined && (
                <span className="flex items-center gap-1.5 text-sm font-bold text-[#29242A]">

                  <Star
                    size={17}
                    fill="#D96A3A"
                    className="text-[#D96A3A]"
                  />

                  {Number(food.rating).toFixed(1)}

                </span>
              )}


              {food.isVeg !== undefined && (
                <span
                  className={`flex items-center gap-1.5 text-sm font-semibold ${
                    food.isVeg
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                >

                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      food.isVeg
                        ? 'border-green-700'
                        : 'border-red-700'
                    }`}
                  >

                    <span
                      className={`h-2 w-2 rounded-full ${
                        food.isVeg
                          ? 'bg-green-700'
                          : 'bg-red-700'
                      }`}
                    />

                  </span>

                  {food.isVeg
                    ? 'Vegetarian'
                    : 'Non-vegetarian'}

                </span>
              )}

            </div>


            {/* =============================================
                PRICE
            ============================================== */}

            <div className="mt-7">

              <span className="font-serif text-4xl text-[#D96A3A]">
                {formatPrice(food.price)}
              </span>

            </div>


            {/* =============================================
                DESCRIPTION
            ============================================== */}

            <p className="mt-6 max-w-xl text-base leading-8 text-[#766E68]">
              {food.description ||
                'Freshly prepared with carefully selected ingredients and served straight from our kitchen.'}
            </p>


            {/* =============================================
                META
            ============================================== */}

            <div className="my-7 flex flex-wrap gap-3">

              {food.preparationTime && (
                <div className="flex items-center gap-2 rounded-full bg-[#F1E9DE] px-4 py-2.5 text-sm font-semibold text-[#29242A]">

                  <Clock3
                    size={16}
                    className="text-[#D96A3A]"
                  />

                  {food.preparationTime} min

                </div>
              )}


              {food.spiceLevel && (
                <div className="flex items-center gap-2 rounded-full bg-[#F1E9DE] px-4 py-2.5 text-sm font-semibold text-[#29242A]">

                  <Flame
                    size={16}
                    className="text-[#D96A3A]"
                  />

                  {food.spiceLevel}

                </div>
              )}


              {food.isVeg && (
                <div className="flex items-center gap-2 rounded-full bg-[#F1E9DE] px-4 py-2.5 text-sm font-semibold text-[#29242A]">

                  <Leaf
                    size={16}
                    className="text-green-700"
                  />

                  Fresh & vegetarian

                </div>
              )}

            </div>


            {/* =============================================
                INGREDIENTS
            ============================================== */}

            {food.ingredients && (
              <div className="border-y border-[#E7DDD3] py-5">

                <p className="restaurant-eyebrow mb-3">
                  Ingredients
                </p>

                <p className="text-sm leading-7 text-[#766E68]">

                  {Array.isArray(food.ingredients)
                    ? food.ingredients.join(' · ')
                    : food.ingredients}

                </p>

              </div>
            )}


            {/* =============================================
                QUANTITY
            ============================================== */}

            <div className="mt-7">

              <p className="mb-3 text-sm font-bold text-[#29242A]">
                Quantity
              </p>

              <div className="flex items-center gap-3">

                <div className="flex h-12 items-center rounded-full border border-[#E0D5CA] bg-white p-1">

                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#241B2F] transition hover:bg-[#F1E9DE]"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={17} />
                  </button>


                  <span className="w-10 text-center text-sm font-extrabold">
                    {quantity}
                  </span>


                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#241B2F] transition hover:bg-[#F1E9DE]"
                    aria-label="Increase quantity"
                  >
                    <Plus size={17} />
                  </button>

                </div>


                <span className="text-sm text-[#766E68]">
                  {formatPrice(
                    Number(food.price) * quantity
                  )}
                </span>

              </div>

            </div>


            {/* =============================================
                SPECIAL INSTRUCTIONS
            ============================================== */}

            <div className="mt-6">

              <label
                htmlFor="instructions"
                className="mb-2 block text-sm font-bold text-[#29242A]"
              >
                Special instructions

                <span className="ml-1 font-normal text-[#9A918A]">
                  (optional)
                </span>

              </label>


              <textarea
                id="instructions"
                value={instructions}
                onChange={(event) =>
                  setInstructions(event.target.value)
                }
                rows={3}
                placeholder="Less spicy, no onions, extra sauce..."
                className="w-full resize-none rounded-2xl border border-[#E0D5CA] bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#9A918A] focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
              />

            </div>


            {/* =============================================
                ADD TO CART
            ============================================== */}

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#D96A3A] text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(217,106,58,0.22)] transition hover:bg-[#C85D31] hover:shadow-[0_14px_30px_rgba(217,106,58,0.28)]"
            >

              <ShoppingBag size={19} />

              {cartQuantity > 0
                ? `Add another · ${formatPrice(
                    Number(food.price) * quantity
                  )}`
                : `Add to cart · ${formatPrice(
                    Number(food.price) * quantity
                  )}`}

            </button>


            {/* =============================================
                EXISTING CART ITEM
            ============================================== */}

            {cartQuantity > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F1E9DE] px-4 py-3">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-[#766E68]">
                    Already in your cart
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#241B2F]">
                    {cartQuantity}{' '}
                    {cartQuantity === 1
                      ? 'item'
                      : 'items'}
                  </p>

                </div>


                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={handleCartDecrease}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition hover:bg-[#E7DDD3]"
                    aria-label="Decrease cart quantity"
                  >
                    <Minus size={15} />
                  </button>


                  <span className="w-5 text-center text-sm font-bold">
                    {cartQuantity}
                  </span>


                  <button
                    type="button"
                    onClick={handleCartIncrease}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#241B2F] text-white transition hover:bg-[#3D2852]"
                    aria-label="Increase cart quantity"
                  >
                    <Plus size={15} />
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}