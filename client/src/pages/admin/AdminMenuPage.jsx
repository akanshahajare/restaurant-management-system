import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  UtensilsCrossed,
  Package,
  Clock3,
  Star,
  Leaf,
  Flame,
  Search,
  Image as ImageIcon,
  ChefHat,
  CheckCircle2,
  CircleOff,
} from 'lucide-react';

import api from '../../services/api.js';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';
import { LOW_STOCK_THRESHOLD } from '../../config/constants.js';

const getStockStatus = (quantity, isAvailable) => {
  const stock = Number(quantity);

  if (Number.isFinite(stock) && stock === 0) {
    return 'Out of stock';
  }

  if (
    Number.isFinite(stock) &&
    stock > 0 &&
    stock <= LOW_STOCK_THRESHOLD
  ) {
    return 'Low stock';
  }

  return isAvailable ? 'In stock' : 'Unavailable';
};

const getStatusClass = (status) => {
  if (status === 'Out of stock') {
    return 'border-[#f1c9c4] bg-[#fff3f1] text-[#b94a3c]';
  }

  if (status === 'Low stock') {
    return 'border-[#ecd6ad] bg-[#fff8e9] text-[#9a6925]';
  }

  if (status === 'Unavailable') {
    return 'border-[#ddd4e2] bg-[#f6f2f8] text-[#6f6079]';
  }

  return 'border-[#cce3d4] bg-[#eff8f2] text-[#3f7d57]';
};

const inputClass =
  'h-11 w-full rounded-xl border border-[#e6ddd5] bg-[#fcfaf7] px-3.5 text-sm text-[#29242a] outline-none transition placeholder:text-[#9a9189] focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10';

const selectClass =
  'h-11 w-full rounded-xl border border-[#e6ddd5] bg-[#fcfaf7] px-3.5 text-sm text-[#29242a] outline-none transition focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10';

const emptyForm = {
  name: '',
  description: '',
  ingredients: '',
  price: '',
  image: '',
  category: '',
  preparationTime: '',
  spiceLevel: 'Mild',
  rating: 0,
  isVeg: 'true',
  isAvailable: 'true',
  stockQuantity: '',
  isSpecial: 'false',
  isRecommended: 'false',
};

const AdminMenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      ...emptyForm,
      spiceLevel: 'Mild',
      isVeg: 'true',
      isAvailable: 'true',
      isSpecial: 'false',
      isRecommended: 'false',
    },
  });

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        api.get('/categories'),
        api.get('/menu'),
      ]);

      setCategories(catRes.data.data || []);
      setItems(itemRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);

    const payload = {
      ...data,
      price: Number(data.price),
      preparationTime: Number(data.preparationTime),
      rating: Number(data.rating || 0),
      stockQuantity:
        data.stockQuantity === '' ||
        data.stockQuantity === undefined
          ? undefined
          : Number(data.stockQuantity),

      isVeg: data.isVeg === true || data.isVeg === 'true',

      isAvailable:
        data.isAvailable === true ||
        data.isAvailable === 'true',

      isSpecial:
        data.isSpecial === true ||
        data.isSpecial === 'true',

      isRecommended:
        data.isRecommended === true ||
        data.isRecommended === 'true',
    };

    try {
      if (selected) {
        await api.put(`/menu/${selected._id}`, payload);
        toast.success('Menu item updated');
      } else {
        await api.post('/menu', payload);
        toast.success('New menu item added');
      }

      reset(emptyForm);
      setSelected(null);
      await fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to save menu item'
      );
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setSelected(item);

    reset({
      name: item.name || '',
      description: item.description || '',
      ingredients: item.ingredients || '',
      price: item.price ?? '',
      image: item.image || '',
      category: item.category?._id || '',
      preparationTime: item.preparationTime ?? '',
      spiceLevel: item.spiceLevel || 'Mild',
      rating: item.rating ?? 0,
      isVeg: String(Boolean(item.isVeg)),
      isAvailable: String(Boolean(item.isAvailable)),
      stockQuantity: item.stockQuantity ?? '',
      isSpecial: String(Boolean(item.isSpecial)),
      isRecommended: String(Boolean(item.isRecommended)),
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const startNewItem = () => {
    setSelected(null);
    reset(emptyForm);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const cancelEdit = () => {
    setSelected(null);
    reset(emptyForm);
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) {
      return;
    }

    setDeleting(id);

    try {
      await api.delete(`/menu/${id}`);

      toast.success('Menu item deleted');

      if (selected?._id === id) {
        cancelEdit();
      }

      await fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to delete item'
      );
    } finally {
      setDeleting(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.name?.toLowerCase().includes(query) ||
      item.category?.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  const availableCount = items.filter(
    (item) => item.isAvailable
  ).length;

  const unavailableCount = items.filter(
    (item) => !item.isAvailable
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-px w-7 bg-[#D96A3A]" />

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D96A3A]">
              Menu management
            </p>
          </div>

          <h1 className="font-serif text-4xl tracking-tight text-[#241B2F] sm:text-5xl">
            Your menu
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#766e68]">
            Manage dishes, pricing, availability, stock and
            recommendations from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={startNewItem}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96A3A] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(217,106,58,0.2)] transition hover:-translate-y-0.5 hover:bg-[#C85D31] hover:shadow-[0_14px_28px_rgba(217,106,58,0.26)]"
        >
          <Plus size={17} />
          Add menu item
        </button>
      </div>

      {/* =====================================================
          QUICK STATS
      ====================================================== */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e7ddd3] bg-white px-5 py-4 shadow-[0_8px_25px_rgba(36,27,47,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4dfd2] text-[#D96A3A]">
              <UtensilsCrossed size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9a9189]">
                Total dishes
              </p>

              <p className="mt-0.5 text-xl font-semibold text-[#241B2F]">
                {items.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7ddd3] bg-white px-5 py-4 shadow-[0_8px_25px_rgba(36,27,47,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff8f2] text-[#3f7d57]">
              <CheckCircle2 size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9a9189]">
                Available
              </p>

              <p className="mt-0.5 text-xl font-semibold text-[#241B2F]">
                {availableCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7ddd3] bg-white px-5 py-4 shadow-[0_8px_25px_rgba(36,27,47,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6f2f8] text-[#6f6079]">
              <CircleOff size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9a9189]">
                Unavailable
              </p>

              <p className="mt-0.5 text-xl font-semibold text-[#241B2F]">
                {unavailableCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          EDITOR + MENU
      ====================================================== */}
      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        {/* ===================================================
            FORM
        ==================================================== */}
        <section className="h-fit rounded-[30px] border border-[#e7ddd3] bg-white p-5 shadow-[0_10px_35px_rgba(36,27,47,0.07)] sm:p-6 xl:sticky xl:top-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4dfd2] text-[#D96A3A]">
                {selected ? (
                  <Pencil size={19} />
                ) : (
                  <ChefHat size={20} />
                )}
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a9189]">
                {selected ? 'Editing item' : 'New menu item'}
              </p>

              <h2 className="mt-1 font-serif text-2xl text-[#241B2F]">
                {selected ? 'Edit dish' : 'Add a dish'}
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#766e68]">
                {selected
                  ? 'Update the details of this menu item.'
                  : 'Create a new dish for your restaurant menu.'}
              </p>
            </div>

            {selected && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e6ddd5] text-[#766e68] transition hover:border-[#D96A3A] hover:text-[#D96A3A]"
                title="Cancel editing"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
          >
            {/* Basic information */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                Dish name
              </label>

              <input
                {...register('name', { required: true })}
                placeholder="e.g. Butter Chicken"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                Description
              </label>

              <textarea
                {...register('description')}
                placeholder="Describe the dish..."
                className="min-h-[88px] w-full resize-none rounded-xl border border-[#e6ddd5] bg-[#fcfaf7] px-3.5 py-3 text-sm text-[#29242a] outline-none transition placeholder:text-[#9a9189] focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                Ingredients
              </label>

              <input
                {...register('ingredients')}
                placeholder="Chicken, tomato, butter..."
                className={inputClass}
              />
            </div>

            {/* Price / prep */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Price
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#9a9189]">
                    ₹
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { required: true })}
                    placeholder="0.00"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Prep time
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    {...register('preparationTime')}
                    placeholder="15"
                    className={`${inputClass} pr-12`}
                  />

                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9a9189]">
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* Category / stock */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Category
                </label>

                <select
                  {...register('category')}
                  className={selectClass}
                >
                  <option value="">Select category</option>

                  {categories.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register('stockQuantity')}
                  placeholder="Quantity"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                Image URL
              </label>

              <div className="relative">
                <ImageIcon
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9189]"
                />

                <input
                  {...register('image')}
                  placeholder="https://..."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Spice / rating / veg */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Spice
                </label>

                <select
                  {...register('spiceLevel')}
                  className={selectClass}
                >
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Spicy">Spicy</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Rating
                </label>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...register('rating')}
                  placeholder="4.5"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Type
                </label>

                <select
                  {...register('isVeg')}
                  className={selectClass}
                >
                  <option value="true">Veg</option>
                  <option value="false">Non-Veg</option>
                </select>
              </div>
            </div>

            {/* Availability */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Availability
                </label>

                <select
                  {...register('isAvailable')}
                  className={selectClass}
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                  Special
                </label>

                <select
                  {...register('isSpecial')}
                  className={selectClass}
                >
                  <option value="false">Regular</option>
                  <option value="true">Today's special</option>
                </select>
              </div>
            </div>

            {/* Recommended */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766e68]">
                Recommendation
              </label>

              <select
                {...register('isRecommended')}
                className={selectClass}
              >
                <option value="false">Regular item</option>
                <option value="true">Recommended</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#D96A3A] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(217,106,58,0.18)] transition hover:-translate-y-0.5 hover:bg-[#C85D31] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : selected ? (
                <>
                  <Pencil size={16} />
                  Update dish
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create dish
                </>
              )}
            </button>
          </form>
        </section>

        {/* ===================================================
            MENU LIST
        ==================================================== */}
        <section className="min-w-0">
          <div className="rounded-[30px] border border-[#e7ddd3] bg-white p-5 shadow-[0_10px_35px_rgba(36,27,47,0.06)] sm:p-6">
            {/* List header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-2xl text-[#241B2F]">
                    Menu items
                  </h2>

                  <span className="rounded-full bg-[#f4dfd2] px-3 py-1 text-xs font-semibold text-[#C85D31]">
                    {items.length}
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#766e68]">
                  Manage your dishes and inventory.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9189]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Result count */}
            {search && (
              <div className="mt-4 rounded-xl bg-[#faf7f2] px-3.5 py-2.5 text-xs text-[#766e68]">
                Showing{' '}
                <span className="font-semibold text-[#241B2F]">
                  {filteredItems.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-[#241B2F]">
                  {items.length}
                </span>{' '}
                menu items
              </div>
            )}

            {/* Items */}
            <div className="mt-6 space-y-3">
              {filteredItems.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4dfd2] text-[#D96A3A]">
                    <UtensilsCrossed size={23} />
                  </div>

                  <p className="mt-4 font-semibold text-[#241B2F]">
                    {search
                      ? 'No dishes found'
                      : 'No menu items yet'}
                  </p>

                  <p className="mt-1 max-w-sm text-sm text-[#766e68]">
                    {search
                      ? 'Try a different search term.'
                      : 'Add your first dish using the form.'}
                  </p>

                  {!search && (
                    <button
                      type="button"
                      onClick={startNewItem}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D96A3A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#C85D31]"
                    >
                      <Plus size={14} />
                      Add first dish
                    </button>
                  )}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const stockStatus = getStockStatus(
                    item.stockQuantity,
                    item.isAvailable
                  );

                  return (
                    <article
                      key={item._id}
                      className="group overflow-hidden rounded-[24px] border border-[#eee6df] bg-[#fcfaf7] transition duration-200 hover:border-[#dfc8bb] hover:bg-white hover:shadow-[0_8px_25px_rgba(36,27,47,0.05)]"
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                        {/* Image */}
                        <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#f1ebe5] sm:h-24 sm:w-24">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#c8bdb3]">
                              <UtensilsCrossed size={25} />
                            </div>
                          )}
                        </div>

                        {/* Main details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[#241B2F]">
                              {item.name}
                            </h3>

                            {item.isSpecial && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1dc] px-2.5 py-1 text-[10px] font-semibold text-[#a96820]">
                                <Star size={10} />
                                Special
                              </span>
                            )}

                            {item.isRecommended && (
                              <span className="rounded-full bg-[#f4dfd2] px-2.5 py-1 text-[10px] font-semibold text-[#C85D31]">
                                Recommended
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[#9a9189]">
                            {item.category?.name ||
                              'Uncategorized'}
                          </p>

                          {item.description && (
                            <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-5 text-[#766e68]">
                              {item.description}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6ddd5] bg-white px-2.5 py-1 text-xs font-semibold text-[#241B2F]">
                              ₹
                              {Number(item.price || 0).toFixed(
                                2
                              )}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6ddd5] bg-white px-2.5 py-1 text-xs text-[#766e68]">
                              <Package size={12} />
                              {item.stockQuantity ?? 'N/A'}
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                stockStatus
                              )}`}
                            >
                              {stockStatus}
                            </span>

                            {item.preparationTime && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6ddd5] bg-white px-2.5 py-1 text-xs text-[#766e68]">
                                <Clock3 size={12} />
                                {item.preparationTime} min
                              </span>
                            )}

                            {item.isVeg && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#cce3d4] bg-[#eff8f2] px-2.5 py-1 text-xs font-semibold text-[#3f7d57]">
                                <Leaf size={11} />
                                Veg
                              </span>
                            )}

                            {item.spiceLevel === 'Spicy' && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#f1c9c4] bg-[#fff3f1] px-2.5 py-1 text-xs font-semibold text-[#b94a3c]">
                                <Flame size={11} />
                                Spicy
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 gap-2 sm:flex-col">
                          <button
                            type="button"
                            onClick={() => editItem(item)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfd4ca] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#241B2F] transition hover:border-[#D96A3A] hover:text-[#D96A3A] sm:flex-none"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={deleting === item._id}
                            onClick={() =>
                              deleteItem(item._id)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#f1c9c4] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#b94a3c] transition hover:bg-[#fff3f1] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                          >
                            <Trash2 size={14} />

                            {deleting === item._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminMenuPage;