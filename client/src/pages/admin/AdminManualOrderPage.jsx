import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import api from '../../services/api.js';
import Spinner from '../../components/common/Spinner.jsx';
import {
  Minus,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  ReceiptText,
  CircleAlert,
  CheckCircle2,
  Sofa,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';

const AdminManualOrderPage = () => {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [discount, setDiscount] = useState('0');
  const [instructions, setInstructions] = useState('');
  const [tablesLoading, setTablesLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [menuError, setMenuError] = useState('');

  useEffect(() => {
    const loadTables = async () => {
      try {
        const response = await api.get('/tables');
        setTables(response.data.data || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            'Unable to load tables'
        );
      } finally {
        setTablesLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadTables();
    loadCategories();
  }, []);

  useEffect(() => {
    const loadMenu = async () => {
      setMenuLoading(true);
      setMenuError('');

      try {
        const response = await api.get('/menu', {
          params: {
            search: searchTerm || undefined,
            category: selectedCategory || undefined,
            availability: 'available',
          },
        });

        setMenuItems(response.data.data || []);
      } catch (err) {
        setMenuError(
          err.response?.data?.message ||
            'Unable to load menu'
        );
      } finally {
        setMenuLoading(false);
      }
    };

    const timeout = setTimeout(loadMenu, 250);

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedCategory]);

  const sortedTables = useMemo(() => {
    return [...tables].sort((a, b) => {
      if (a.status === b.status) {
        return a.number.localeCompare(b.number);
      }

      return a.status === 'AVAILABLE' ? -1 : 1;
    });
  }, [tables]);

  const subtotal = useMemo(() => {
    return orderItems.reduce(
      (sum, item) =>
        sum + Number(item.price) * item.quantity,
      0
    );
  }, [orderItems]);

  const discountValue = useMemo(() => {
    const parsed = Number(discount);

    return Number.isFinite(parsed) ? parsed : 0;
  }, [discount]);

  const gst = useMemo(
    () => Number((subtotal * 0.05).toFixed(2)),
    [subtotal]
  );

  const total = useMemo(
    () =>
      Number(
        (subtotal + gst - discountValue).toFixed(2)
      ),
    [subtotal, gst, discountValue]
  );

  const itemCount = useMemo(
    () =>
      orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [orderItems]
  );

  const addItem = (item) => {
    if (!item.isAvailable) {
      toast.error(
        `${item.name} is currently unavailable`
      );
      return;
    }

    setOrderItems((current) => {
      const existing = current.find(
        (entry) => entry._id === item._id
      );

      if (existing) {
        return current.map((entry) =>
          entry._id === item._id
            ? {
                ...entry,
                quantity: entry.quantity + 1,
              }
            : entry
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setOrderItems((current) =>
      current
        .map((entry) => {
          if (entry._id !== itemId) {
            return entry;
          }

          const nextQuantity =
            entry.quantity + delta;

          return nextQuantity > 0
            ? {
                ...entry,
                quantity: nextQuantity,
              }
            : null;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (itemId) => {
    setOrderItems((current) =>
      current.filter(
        (entry) => entry._id !== itemId
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }

    if (orderItems.length === 0) {
      toast.error(
        'Add at least one item to create the order'
      );
      return;
    }

    if (
      !Number.isFinite(Number(discount)) ||
      Number(discount) < 0
    ) {
      toast.error(
        'Discount must be zero or greater'
      );
      return;
    }

    if (Number(discount) > subtotal) {
      toast.error(
        'Discount cannot exceed the subtotal'
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        tableNumber: selectedTable.number,

        items: orderItems.map((item) => ({
          foodId: item._id,
          quantity: item.quantity,
          instructions: item.instructions || '',
        })),

        discount: Number(discount),

        customerNotes:
          instructions.trim() ||
          'Manual order created by admin',
      };

      const response = await api.post(
        '/orders/manual',
        payload
      );

      const createdOrder = response.data.data;

      toast.success(
        `Order created successfully • ${createdOrder._id
          .slice(-6)
          .toUpperCase()}`
      );

      setLastOrder(createdOrder);
      setOrderItems([]);
      setDiscount('0');
      setInstructions('');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to create manual order'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D96A3A]">
            Front desk
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#241B2F] sm:text-5xl">
            Create manual order
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Build a dine-in order for a table and send it
            directly into the kitchen workflow.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#eadfd5] bg-white px-4 py-3 shadow-[0_6px_24px_rgba(36,27,47,0.04)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e8df] text-[#D96A3A]">
            <ReceiptText size={18} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current order
            </p>

            <p className="text-sm font-semibold text-[#241B2F]">
              {itemCount}{' '}
              {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="hidden items-center gap-3 rounded-[24px] border border-[#eadfd5] bg-white px-5 py-4 shadow-[0_6px_24px_rgba(36,27,47,0.04)] sm:flex">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#D96A3A]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D96A3A] text-xs text-white">
            1
          </span>
          Table
        </div>

        <ChevronRight
          size={16}
          className="text-slate-300"
        />

        <div
          className={`flex items-center gap-2 text-sm font-semibold ${
            orderItems.length
              ? 'text-[#D96A3A]'
              : 'text-slate-400'
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
              orderItems.length
                ? 'bg-[#D96A3A] text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            2
          </span>
          Menu
        </div>

        <ChevronRight
          size={16}
          className="text-slate-300"
        />

        <div
          className={`flex items-center gap-2 text-sm font-semibold ${
            orderItems.length
              ? 'text-[#D96A3A]'
              : 'text-slate-400'
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
              orderItems.length
                ? 'bg-[#D96A3A] text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            3
          </span>
          Review & create
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Tables */}
          <section className="rounded-[30px] border border-[#eadfd5] bg-white p-5 shadow-[0_8px_30px_rgba(36,27,47,0.05)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8e8df] text-xs font-bold text-[#D96A3A]">
                    1
                  </span>

                  <h2 className="font-serif text-2xl font-semibold text-[#241B2F]">
                    Select table
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Available tables are shown first.
                </p>
              </div>

              {selectedTable && (
                <div className="rounded-full bg-[#f8e8df] px-3 py-1.5 text-xs font-semibold text-[#D96A3A]">
                  Table {selectedTable.number}
                </div>
              )}
            </div>

            {tablesLoading ? (
              <div className="mt-8 flex justify-center">
                <Spinner />
              </div>
            ) : sortedTables.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#dfd4ca] bg-[#fcfaf7] p-6 text-center text-sm text-slate-500">
                No tables are currently available.
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sortedTables.map((table) => {
                  const isSelected =
                    selectedTable?._id === table._id;

                  const isAvailable =
                    table.status === 'AVAILABLE';

                  return (
                    <button
                      key={table._id}
                      type="button"
                      onClick={() =>
                        setSelectedTable(table)
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-[#D96A3A] bg-[#fdf0e9] shadow-sm'
                          : 'border-[#e8ded6] bg-[#fcfaf7] hover:border-[#D96A3A]/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Sofa
                            size={17}
                            className={
                              isSelected
                                ? 'text-[#D96A3A]'
                                : 'text-slate-400'
                            }
                          />

                          <span className="font-semibold text-[#241B2F]">
                            {table.number}
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isAvailable
                            ? 'Available'
                            : 'Occupied'}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        {isAvailable
                          ? 'Ready for a new order'
                          : 'Currently occupied'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Menu */}
          <section className="rounded-[30px] border border-[#eadfd5] bg-white p-5 shadow-[0_8px_30px_rgba(36,27,47,0.05)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8e8df] text-xs font-bold text-[#D96A3A]">
                    2
                  </span>

                  <h2 className="font-serif text-2xl font-semibold text-[#241B2F]">
                    Choose dishes
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Search the available restaurant menu.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search dishes"
                    className="h-11 w-full rounded-xl border border-[#e6ddd5] bg-[#fcfaf7] pl-9 pr-4 text-sm text-[#241B2F] outline-none transition placeholder:text-slate-400 focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10 sm:w-56"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-[#e6ddd5] bg-[#fcfaf7] px-4 text-sm text-[#241B2F] outline-none transition focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
                >
                  <option value="">
                    All categories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {menuLoading ? (
              <div className="mt-8 flex justify-center">
                <Spinner />
              </div>
            ) : menuError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {menuError}
              </div>
            ) : menuItems.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#dfd4ca] bg-[#fcfaf7] p-8 text-center">
                <UtensilsCrossed
                  size={24}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No available dishes match your search.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {menuItems.map((item) => (
                  <article
                    key={item._id}
                    className="group rounded-[24px] border border-[#eee6df] bg-[#fcfaf7] p-3 transition hover:border-[#D96A3A]/40 hover:bg-white hover:shadow-[0_8px_25px_rgba(36,27,47,0.06)]"
                  >
                    <div className="flex gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#f1ebe5] text-slate-400">
                          <UtensilsCrossed size={24} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-[#241B2F]">
                              {item.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.category?.name ||
                                'Uncategorized'}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.isVeg
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {item.isVeg
                              ? 'VEG'
                              : 'NON-VEG'}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#241B2F]">
                            ₹
                            {Number(
                              item.price
                            ).toFixed(2)}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              addItem(item)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#D96A3A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#C85D31]"
                          >
                            <Plus size={14} />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <section className="sticky top-6 rounded-[30px] border border-[#eadfd5] bg-white p-5 shadow-[0_10px_35px_rgba(36,27,47,0.07)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8e8df] text-xs font-bold text-[#D96A3A]">
                    3
                  </span>

                  <h2 className="font-serif text-2xl font-semibold text-[#241B2F]">
                    Current order
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Review before sending to the kitchen.
                </p>
              </div>

              <div className="rounded-full bg-[#241B2F] px-3 py-1.5 text-xs font-semibold text-white">
                {itemCount}
              </div>
            </div>

            {selectedTable && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#fdf0e9] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#D96A3A]">
                  <Sofa size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#D96A3A]">
                    Serving table
                  </p>

                  <p className="text-sm font-semibold text-[#241B2F]">
                    Table {selectedTable.number}
                  </p>
                </div>
              </div>
            )}

            {orderItems.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-[#dfd4ca] bg-[#fcfaf7] p-8 text-center">
                <ShoppingBag
                  size={25}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-500">
                  Your order is empty
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Add dishes from the menu to start
                  building this order.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-[#eee6df] bg-[#fcfaf7] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#241B2F]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          ₹
                          {Number(
                            item.price
                          ).toFixed(2)}{' '}
                          each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item._id)
                        }
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-xl border border-[#e1d8d0] bg-white p-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              -1
                            )
                          }
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[#f8e8df] hover:text-[#D96A3A]"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="min-w-8 text-center text-sm font-semibold text-[#241B2F]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              1
                            )
                          }
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[#f8e8df] hover:text-[#D96A3A]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-[#241B2F]">
                        ₹
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cooking instructions
              </label>

              <textarea
                value={instructions}
                onChange={(event) =>
                  setInstructions(
                    event.target.value
                  )
                }
                placeholder="Less spicy, no onions, extra cheese..."
                className="mt-2 min-h-[90px] w-full resize-none rounded-2xl border border-[#e6ddd5] bg-[#fcfaf7] px-4 py-3 text-sm text-[#241B2F] outline-none transition placeholder:text-slate-400 focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
              />
            </div>

            {/* Discount */}
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Discount
              </label>

              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  value={discount}
                  min="0"
                  step="0.01"
                  onChange={(event) =>
                    setDiscount(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  className="h-11 w-full rounded-xl border border-[#e6ddd5] bg-[#fcfaf7] pl-9 pr-4 text-sm text-[#241B2F] outline-none transition focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-5 rounded-[24px] bg-[#241B2F] p-5 text-white">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-white/60">
                  <span>Discount</span>
                  <span>
                    -₹{discountValue.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-white/60">
                  <span>GST (5%)</span>
                  <span>
                    ₹{gst.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40">
                        Grand total
                      </p>

                      <p className="mt-1 font-serif text-3xl font-semibold">
                        ₹{total.toFixed(2)}
                      </p>
                    </div>

                    <UtensilsCrossed
                      size={22}
                      className="mb-1 text-[#D96A3A]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Create */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                !selectedTable ||
                orderItems.length === 0
              }
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#D96A3A] px-5 text-sm font-semibold text-white transition hover:bg-[#C85D31] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating order...
                </>
              ) : (
                <>
                  <ReceiptText size={17} />
                  Create order
                </>
              )}
            </button>

            {!selectedTable && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Select a table before creating the order.
              </p>
            )}
          </section>

          {/* Result */}
          {lastOrder ? (
            <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Success
                  </p>

                  <h3 className="font-serif text-xl font-semibold text-[#241B2F]">
                    Order created
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-2 rounded-2xl bg-white p-4 text-sm text-slate-600">
                <p className="flex justify-between gap-4">
                  <span>Order ID</span>
                  <span className="font-semibold text-[#241B2F]">
                    {lastOrder._id
                      .slice(-6)
                      .toUpperCase()}
                  </span>
                </p>

                <p className="flex justify-between gap-4">
                  <span>Table</span>
                  <span className="font-semibold text-[#241B2F]">
                    {lastOrder.tableNumber}
                  </span>
                </p>

                <p className="flex justify-between gap-4">
                  <span>Total</span>
                  <span className="font-semibold text-[#241B2F]">
                    ₹
                    {Number(
                      lastOrder.total
                    ).toFixed(2)}
                  </span>
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700">
                <ReceiptText size={14} />
                Order entered the kitchen workflow.
              </div>
            </section>
          ) : (
            <section className="flex items-start gap-3 rounded-[28px] border border-[#eadfd5] bg-[#fcfaf7] p-5">
              <CircleAlert
                size={19}
                className="mt-0.5 shrink-0 text-[#D96A3A]"
              />

              <div>
                <p className="text-sm font-semibold text-[#241B2F]">
                  Final total is server-calculated
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  The backend recalculates menu prices,
                  quantities, GST and discount rules
                  before accepting the order.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManualOrderPage;