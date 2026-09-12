import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  X,
  UtensilsCrossed,
  CalendarDays,
  Layers3,
} from 'lucide-react';

import api from '../../services/api.js';
import Spinner from '../../components/common/Spinner.jsx';

const inputClass =
  'h-12 w-full rounded-xl border border-[#e6ddd5] bg-[#fcfaf7] px-4 text-sm text-[#241B2F] outline-none transition placeholder:text-slate-400 focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [categoryRes, menuRes] = await Promise.all([
        api.get('/categories'),
        api.get('/menu'),
      ]);

      setCategories(categoryRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          'Unable to load categories'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const foodCounts = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category._id] = menuItems.filter(
        (item) =>
          (item.category?._id || item.category) ===
          category._id
      ).length;

      return acc;
    }, {});
  }, [categories, menuItems]);

  const totalDishes = menuItems.length;

  const openCreateDialog = () => {
    setEditingCategory(null);

    reset({
      name: '',
      description: '',
    });

    setIsDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);

    reset({
      name: category.name || '',
      description: category.description || '',
    });

    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (submitting) return;

    setIsDialogOpen(false);
    setEditingCategory(null);
    reset({
      name: '',
      description: '',
    });
  };

  const onSubmit = async (data) => {
    const trimmedName = data.name?.trim();

    if (!trimmedName) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);

    try {
      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory._id}`,
          {
            name: trimmedName,
            description:
              data.description?.trim() || '',
          }
        );

        toast.success('Category updated');
      } else {
        await api.post('/categories', {
          name: trimmedName,
          description:
            data.description?.trim() || '',
        });

        toast.success('Category created');
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      reset();

      await fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to save category'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = (category) => {
    const count = foodCounts[category._id] || 0;

    if (count > 0) {
      toast.error(
        `Cannot delete ${category.name} because food items still use it.`
      );

      return;
    }

    setDeleteTarget(category);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);

    try {
      await api.delete(
        `/categories/${deleteTarget._id}`
      );

      toast.success('Category deleted');

      setDeleteTarget(null);

      await fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to delete category'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#D96A3A]">
            Menu organization
          </p>

          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#241B2F] sm:text-5xl">
            Categories
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Organize your dishes into clean, easy-to-browse
            sections for the restaurant menu.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96A3A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C85D31]"
        >
          <Plus size={17} />
          Add category
        </button>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[26px] border border-[#eadfd5] bg-white p-5 shadow-[0_8px_30px_rgba(36,27,47,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Categories
              </p>

              <p className="mt-3 text-3xl font-semibold text-[#241B2F]">
                {categories.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#D96A3A]">
              <Layers3 size={20} />
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Menu sections available
          </p>
        </div>

        <div className="rounded-[26px] border border-[#eadfd5] bg-white p-5 shadow-[0_8px_30px_rgba(36,27,47,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Menu items
              </p>

              <p className="mt-3 text-3xl font-semibold text-[#241B2F]">
                {totalDishes}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#D96A3A]">
              <UtensilsCrossed size={20} />
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Dishes across all categories
          </p>
        </div>

        <div className="rounded-[26px] border border-[#eadfd5] bg-[#241B2F] p-5 text-white shadow-[0_10px_35px_rgba(36,27,47,0.12)] sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                Organization
              </p>

              <p className="mt-3 font-serif text-2xl font-semibold">
                Keep it simple
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#D96A3A]">
              <FolderOpen size={20} />
            </div>
          </div>

          <p className="mt-3 text-sm leading-5 text-white/55">
            Categories with dishes cannot be deleted until
            those dishes are moved elsewhere.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Category list */}
      {!error && categories.length === 0 ? (
        <div className="rounded-[30px] border border-[#eadfd5] bg-white p-12 text-center shadow-[0_8px_30px_rgba(36,27,47,0.05)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#D96A3A]">
            <FolderOpen size={23} />
          </div>

          <h2 className="mt-5 font-serif text-2xl font-semibold text-[#241B2F]">
            No categories yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create your first category to start organizing
            the restaurant menu.
          </p>

          <button
            type="button"
            onClick={openCreateDialog}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#D96A3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C85D31]"
          >
            <Plus size={16} />
            Create category
          </button>
        </div>
      ) : (
        !error && (
          <section className="rounded-[30px] border border-[#eadfd5] bg-white p-5 shadow-[0_8px_30px_rgba(36,27,47,0.05)] sm:p-6">
            {/* Section heading */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#241B2F]">
                  All categories
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {categories.length}{' '}
                  {categories.length === 1
                    ? 'category'
                    : 'categories'}{' '}
                  in your menu
                </p>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-[22px] border border-[#eee6df] md:block">
              <div className="grid grid-cols-[1.6fr_0.7fr_0.8fr_0.8fr] bg-[#fcfaf7] px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                <span>Category</span>
                <span>Dishes</span>
                <span>Created</span>
                <span>Actions</span>
              </div>

              {categories.map((category) => {
                const count =
                  foodCounts[category._id] || 0;

                return (
                  <div
                    key={category._id}
                    className="grid grid-cols-[1.6fr_0.7fr_0.8fr_0.8fr] items-center border-t border-[#eee6df] px-5 py-5 transition hover:bg-[#fcfaf7]"
                  >
                    {/* Category */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#D96A3A]">
                        <FolderOpen size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[#241B2F]">
                          {category.name}
                        </p>

                        {category.description ? (
                          <p className="mt-1 line-clamp-2 max-w-md text-sm leading-5 text-slate-500">
                            {category.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-slate-400">
                            No description
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Food count */}
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8e8df] px-3 py-1.5 text-xs font-semibold text-[#D96A3A]">
                        <UtensilsCrossed size={12} />
                        {count}
                      </span>
                    </div>

                    {/* Created */}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays size={14} />

                      {category.createdAt
                        ? new Date(
                            category.createdAt
                          ).toLocaleDateString()
                        : '—'}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditDialog(category)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfd4ca] bg-white px-3 py-2 text-xs font-semibold text-[#241B2F] transition hover:border-[#D96A3A] hover:text-[#D96A3A]"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          requestDelete(category)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {categories.map((category) => {
                const count =
                  foodCounts[category._id] || 0;

                return (
                  <article
                    key={category._id}
                    className="rounded-[24px] border border-[#eee6df] bg-[#fcfaf7] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#D96A3A]">
                        <FolderOpen size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[#241B2F]">
                          {category.name}
                        </h3>

                        {category.description ? (
                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            {category.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-slate-400">
                            No description
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8e8df] px-3 py-1.5 text-xs font-semibold text-[#D96A3A]">
                        <UtensilsCrossed size={12} />
                        {count}{' '}
                        {count === 1 ? 'dish' : 'dishes'}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6ddd5] bg-white px-3 py-1.5 text-xs text-slate-500">
                        <CalendarDays size={12} />
                        {category.createdAt
                          ? new Date(
                              category.createdAt
                            ).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditDialog(category)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfd4ca] bg-white px-3 py-2.5 text-xs font-semibold text-[#241B2F] transition hover:border-[#D96A3A] hover:text-[#D96A3A]"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          requestDelete(category)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )
      )}

      {/* Create / edit modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#241B2F]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[30px] border border-[#eadfd5] bg-[#FAF7F2] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#D96A3A]">
                  {editingCategory ? (
                    <Pencil size={18} />
                  ) : (
                    <Plus size={19} />
                  )}
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D96A3A]">
                  {editingCategory
                    ? 'Edit category'
                    : 'New category'}
                </p>

                <h3 className="mt-1 font-serif text-2xl font-semibold text-[#241B2F]">
                  {editingCategory
                    ? 'Update category'
                    : 'Create a category'}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Give your menu section a clear name and
                  description.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={submitting}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dfd4ca] bg-white text-slate-500 transition hover:border-[#D96A3A] hover:text-[#D96A3A] disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Category name
                </label>

                <input
                  {...register('name')}
                  placeholder="e.g. Starters"
                  autoFocus
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </label>

                <textarea
                  {...register('description')}
                  placeholder="A short description of this category..."
                  className="min-h-[110px] w-full resize-none rounded-xl border border-[#e6ddd5] bg-[#fcfaf7] px-4 py-3 text-sm text-[#241B2F] outline-none transition placeholder:text-slate-400 focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={submitting}
                  className="rounded-xl border border-[#dfd4ca] bg-white px-5 py-3 text-sm font-semibold text-[#241B2F] transition hover:border-[#D96A3A] hover:text-[#D96A3A] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D96A3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C85D31] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving...
                    </>
                  ) : editingCategory ? (
                    <>
                      <Pencil size={15} />
                      Save changes
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      Create category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#241B2F]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] border border-[#eadfd5] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <Trash2 size={19} />
                </div>

                <h3 className="mt-4 font-serif text-2xl font-semibold text-[#241B2F]">
                  Delete category?
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  !submitting && setDeleteTarget(null)
                }
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfd4ca] bg-white text-slate-500 hover:text-[#D96A3A]"
              >
                <X size={17} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-[#241B2F]">
                {deleteTarget.name}
              </span>
              ?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={submitting}
                className="rounded-xl border border-[#dfd4ca] bg-white px-5 py-3 text-sm font-semibold text-[#241B2F] transition hover:border-[#D96A3A] hover:text-[#D96A3A] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;