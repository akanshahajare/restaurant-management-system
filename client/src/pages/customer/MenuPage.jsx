import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Star,
  Clock3,
  Leaf,
  Flame,
} from 'lucide-react';

import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { restaurantConfig } from '../../config/restaurant';

const getImageUrl = (image) => {
  if (!image) return '/images/paneer.webp';

  if (image.startsWith('http')) return image;

  if (image.startsWith('/')) return image;

  return `/${image}`;
};

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

export default function MenuPage() {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    toggleFavorite,
    favorites,
  } = useCart();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietary, setDietary] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  const [showFilters, setShowFilters] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError('');
  
      const params = {
        availability: 'available',
      };
  
      if (search.trim()) {
        params.search = search.trim();
      }
  
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
  
      if (dietary === 'veg') {
        params.isVeg = 'true';
      }
  
      if (dietary === 'nonveg') {
        params.isVeg = 'false';
      }
  
      const response = await api.get('/menu', { params });
  
      const items = [...(response.data?.data || [])];
  
      // --------------------------------------------------------
      // CLIENT-SIDE SORTING
      // --------------------------------------------------------
  
      items.sort((a, b) => {
        const priceA = Number(a.price || 0);
        const priceB = Number(b.price || 0);
  
        const ratingA = Number(a.rating || 0);
        const ratingB = Number(b.rating || 0);
  
        const popularityA = Number(a.popularity || 0);
        const popularityB = Number(b.popularity || 0);
  
        switch (sortBy) {
          case 'priceLowToHigh':
            return priceA - priceB;
  
          case 'priceHighToLow':
            return priceB - priceA;
  
          case 'rating':
            if (ratingB !== ratingA) {
              return ratingB - ratingA;
            }
  
            return popularityB - popularityA;
  
          case 'popularity':
            if (popularityB !== popularityA) {
              return popularityB - popularityA;
            }
  
            return ratingB - ratingA;
  
          case 'recommended':
          default:
            // Recommended dishes first
            if (Boolean(b.isRecommended) !== Boolean(a.isRecommended)) {
              return Boolean(b.isRecommended) - Boolean(a.isRecommended);
            }
  
            // Then popularity
            if (popularityB !== popularityA) {
              return popularityB - popularityA;
            }
  
            // Then rating
            return ratingB - ratingA;
        }
      });
  
      setFoods(items);
    } catch (err) {
      console.error('Failed to load menu:', err);
      setError('Unable to load the menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');

      const data = response.data?.data || [];

      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, dietary, sortBy]);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const getCartItem = (foodId) => {
    return cartItems.find(
      (item) =>
        String(item.foodId || item._id || item.id) === String(foodId)
    );
  };

  const handleAdd = (food) => {
    addToCart(food, 1);
  };

  const handleIncrease = (food) => {
    const item = getCartItem(food._id);

    if (!item) {
      addToCart(food, 1);
      return;
    }

    updateQuantity(
      item.foodId || item._id || item.id,
      Number(item.quantity || 0) + 1
    );
  };

  const handleDecrease = (food) => {
    const item = getCartItem(food._id);

    if (!item) return;

    const id = item.foodId || item._id || item.id;
    const nextQuantity = Number(item.quantity || 0) - 1;

    updateQuantity(id, nextQuantity);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setDietary('all');
    setSortBy('recommended');
  };

  const hasActiveFilters =
    search.trim() ||
    selectedCategory !== 'All' ||
    dietary !== 'all' ||
    sortBy !== 'recommended';

  const categoryNames = categories
    .map((category) => category.name || category.title)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#29242A]">
      {/* HERO */}
      <section className="border-b border-[#E7DDD3] bg-[#FAF7F2]">
        <div className="container-kitchen py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <p className="restaurant-eyebrow mb-4">
              {restaurantConfig.name}
            </p>

            <h1 className="font-serif text-5xl leading-[0.95] tracking-[-0.04em] text-[#241B2F] sm:text-6xl lg:text-7xl">
              Our
              <span className="text-[#D96A3A]"> Menu.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#766E68] sm:text-lg">
              Freshly prepared dishes, comforting classics and
              something delicious for every mood.
            </p>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="border-b border-[#E7DDD3] bg-[#FAF7F2]">
        <div className="container-kitchen py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766E68]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes..."
                className="h-12 w-full rounded-full border border-[#E0D5CA] bg-white pl-11 pr-11 text-sm outline-none transition placeholder:text-[#9A918A] focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
              />

              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#766E68] hover:text-[#241B2F]"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* DESKTOP FILTERS */}
            <div className="hidden items-center gap-2 lg:flex">
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="h-12 rounded-full border border-[#E0D5CA] bg-white px-4 text-sm font-medium outline-none focus:border-[#D96A3A]"
              >
                <option value="all">All dishes</option>
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-vegetarian</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 rounded-full border border-[#E0D5CA] bg-white px-4 text-sm font-medium outline-none focus:border-[#D96A3A]"
              >
                <option value="recommended">Recommended</option>
                <option value="priceLowToHigh">
                  Price: Low to High
                </option>
                <option value="priceHighToLow">
                  Price: High to Low
                </option>
                <option value="rating">Top Rated</option>
                <option value="popularity">Popular</option>
              </select>
            </div>

            {/* MOBILE FILTER BUTTON */}
            <button
              onClick={() => setShowFilters((value) => !value)}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#E0D5CA] bg-white px-5 text-sm font-semibold lg:hidden"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </div>

          {/* MOBILE FILTER PANEL */}
          {showFilters && (
            <div className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="h-11 rounded-xl border border-[#E0D5CA] bg-white px-3 text-sm outline-none"
              >
                <option value="all">All dishes</option>
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-vegetarian</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 rounded-xl border border-[#E0D5CA] bg-white px-3 text-sm outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="priceLowToHigh">Price: Low</option>
                <option value="priceHighToLow">Price: High</option>
                <option value="rating">Top Rated</option>
                <option value="popularity">Popular</option>
              </select>
            </div>
          )}

          {/* CATEGORIES */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === 'All'
                  ? 'bg-[#241B2F] text-white'
                  : 'border border-[#E0D5CA] bg-white text-[#766E68] hover:border-[#D96A3A] hover:text-[#D96A3A]'
              }`}
            >
              All
            </button>

            {categoryNames.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-[#241B2F] text-white'
                    : 'border border-[#E0D5CA] bg-white text-[#766E68] hover:border-[#D96A3A] hover:text-[#D96A3A]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MENU */}
      <main className="container-kitchen py-10 pb-32 sm:py-14 lg:py-16">
        {/* RESULT HEADER */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="restaurant-eyebrow mb-2">
              Fresh from the kitchen
            </p>

            <h2 className="font-serif text-3xl tracking-[-0.025em] text-[#241B2F] sm:text-4xl">
              {selectedCategory === 'All'
                ? 'Everything delicious'
                : selectedCategory}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#766E68]">
              {loading ? 'Loading...' : `${foods.length} dishes`}
            </span>

            {hasActiveFilters && !loading && (
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-[#D96A3A] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p>{error}</p>

            <button
              onClick={fetchMenu}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[24px] bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-[#EDE5DC]" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#EDE5DC]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#EDE5DC]" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#EDE5DC]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && foods.length === 0 && (
          <div className="rounded-[28px] border border-[#E7DDD3] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F1E9DE]">
              <Search size={25} className="text-[#D96A3A]" />
            </div>

            <h3 className="mt-5 font-serif text-3xl text-[#241B2F]">
              Nothing found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#766E68]">
              We couldn't find anything matching your search.
              Try another dish or clear your filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 rounded-full bg-[#D96A3A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C85D31]"
            >
              View full menu
            </button>
          </div>
        )}

        {/* FOOD GRID */}
        {!loading && foods.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {foods.map((food) => {
              const foodId = food._id || food.id;
              const cartItem = getCartItem(foodId);
              const quantity = Number(cartItem?.quantity || 0);

              const isFavorite = favorites?.some(
                (item) =>
                  String(item?._id || item?.id || item) === String(foodId)
              );

              return (
                <article
                  key={foodId}
                  className="group overflow-hidden rounded-[24px] border border-[#E7DDD3] bg-white shadow-[0_8px_30px_rgba(36,27,47,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(36,27,47,0.10)]"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F1E9DE]">
                    <Link to={`/menu/${foodId}`}>
                      <img
                        src={getImageUrl(food.image)}
                        alt={food.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src =
                            '/images/paneer.webp';
                        }}
                      />
                    </Link>

                    {/* TOP BADGES */}
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {food.isSpecial && (
                        <span className="rounded-full bg-[#D96A3A] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
                          Special
                        </span>
                      )}

                      {food.isRecommended && (
                        <span className="rounded-full bg-[#241B2F] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
                          Recommended
                        </span>
                      )}
                    </div>

                    {/* FAVORITE */}
                    <button
                      onClick={() => toggleFavorite(food)}
                      aria-label={
                        isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#241B2F] shadow-sm backdrop-blur transition hover:scale-105"
                    >
                      <Heart
                        size={18}
                        fill={isFavorite ? '#D96A3A' : 'none'}
                        className={
                          isFavorite ? 'text-[#D96A3A]' : ''
                        }
                      />
                    </button>

                    {/* PRICE */}
                    <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#241B2F] shadow-sm">
                      {formatPrice(food.price)}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        to={`/menu/${foodId}`}
                        className="min-w-0"
                      >
                        <h3 className="font-serif text-2xl leading-tight text-[#241B2F] transition group-hover:text-[#D96A3A]">
                          {food.name}
                        </h3>
                      </Link>

                      {food.isVeg !== undefined && (
                        <span
                          title={
                            food.isVeg
                              ? 'Vegetarian'
                              : 'Non-vegetarian'
                          }
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                            food.isVeg
                              ? 'border-green-600 text-green-600'
                              : 'border-red-600 text-red-600'
                          }`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              food.isVeg
                                ? 'bg-green-600'
                                : 'bg-red-600'
                            }`}
                          />
                        </span>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-6 text-[#766E68]">
                      {food.description ||
                        'Freshly prepared with quality ingredients.'}
                    </p>

                    {/* META */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#766E68]">
                      {food.rating !== undefined && (
                        <span className="flex items-center gap-1 font-semibold text-[#29242A]">
                          <Star
                            size={14}
                            fill="#D96A3A"
                            className="text-[#D96A3A]"
                          />
                          {Number(food.rating).toFixed(1)}
                        </span>
                      )}

                      {food.preparationTime && (
                        <span className="flex items-center gap-1">
                          <Clock3 size={14} />
                          {food.preparationTime} min
                        </span>
                      )}

                      {food.spiceLevel && (
                        <span className="flex items-center gap-1">
                          <Flame size={14} />
                          {food.spiceLevel}
                        </span>
                      )}

                      {food.isVeg && (
                        <span className="flex items-center gap-1 text-green-700">
                          <Leaf size={14} />
                          Veg
                        </span>
                      )}
                    </div>

                    {/* ACTION */}
                    <div className="mt-5">
                      {quantity === 0 ? (
                        <button
                          onClick={() => handleAdd(food)}
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#241B2F] text-sm font-bold text-white transition hover:bg-[#34283F]"
                        >
                          <Plus size={17} />
                          Add to cart
                        </button>
                      ) : (
                        <div className="flex h-11 items-center justify-between rounded-full bg-[#F1E9DE] px-2">
                          <button
                            onClick={() => handleDecrease(food)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#241B2F] shadow-sm transition hover:bg-[#D96A3A] hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="text-sm font-extrabold text-[#241B2F]">
                            {quantity}
                          </span>

                          <button
                            onClick={() => handleIncrease(food)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D96A3A] text-white shadow-sm transition hover:bg-[#C85D31]"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* MOBILE CART BAR */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-[380px]">
          <Link
            to="/checkout"
            className="flex items-center justify-between rounded-[20px] bg-[#241B2F] px-5 py-4 text-white shadow-[0_15px_45px_rgba(36,27,47,0.3)] transition hover:bg-[#34283F]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D96A3A]">
                <ShoppingBag size={18} />
              </div>

              <div>
                <p className="text-sm font-bold">
                  {cartCount}{' '}
                  {cartCount === 1 ? 'item' : 'items'}
                </p>

                <p className="text-xs text-white/60">
                  View your order
                </p>
              </div>
            </div>

            <span className="text-sm font-extrabold">
              {formatPrice(cartTotal)}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}