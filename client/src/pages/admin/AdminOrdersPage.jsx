import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock3,
  ClipboardList,
  Eye,
  Flame,
  ChefHat,
  CheckCircle2,
  XCircle,
  Utensils,
  Users,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';

import api from '../../services/api.js';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';
import {
  connectSocket,
  joinAdminRoom,
} from '../../services/socket.js';

const statusActions = {
  RECEIVED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_TO_SERVE', 'CANCELLED'],
  READY_TO_SERVE: ['SERVED', 'CANCELLED'],
  SERVED: ['COMPLETED'],
};

const statusMeta = {
  RECEIVED: {
    label: 'Received',
    className: 'bg-[#F4E8D8] text-[#8A5A24]',
    icon: ClipboardList,
  },
  PREPARING: {
    label: 'Preparing',
    className: 'bg-[#F4DFD2] text-[#B84F27]',
    icon: ChefHat,
  },
  READY_TO_SERVE: {
    label: 'Ready to serve',
    className: 'bg-[#E7E1F0] text-[#5A456E]',
    icon: Utensils,
  },
  SERVED: {
    label: 'Served',
    className: 'bg-[#E3EFE5] text-[#3E7650]',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-[#E3EFE5] text-[#3E7650]',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-[#F8E5E3] text-[#A84C45]',
    icon: XCircle,
  },
};

const actionMeta = {
  PREPARING: {
    className:
      'bg-[#241B2F] text-white hover:bg-[#34283F]',
  },
  READY_TO_SERVE: {
    className:
      'bg-[#D96A3A] text-white hover:bg-[#C85D31]',
  },
  SERVED: {
    className:
      'bg-[#3E7650] text-white hover:bg-[#326140]',
  },
  COMPLETED: {
    className:
      'bg-[#3E7650] text-white hover:bg-[#326140]',
  },
  CANCELLED: {
    className:
      'border border-[#E5C4C0] bg-white text-[#A84C45] hover:bg-[#FDF2F1]',
  },
};

const formatStatus = (status) => {
  return status
    ?.replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatTime = (date) => {
  if (!date) return '';

  try {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preparationTimes, setPreparationTimes] = useState({});

  // Search / filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get('/orders');

      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);

      toast.error(
        err.response?.data?.message ||
          'Unable to load orders'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /*
   * Real-time order updates.
   *
   * Backend emits:
   * io.to('admin').emit('orderUpdate', order)
   */
  useEffect(() => {
    const token =
      api.defaults.headers.common.Authorization?.split(' ')[1];

    if (!token) {
      return;
    }

    const socket = connectSocket(token);

    if (!socket) {
      return;
    }

    const handleOrderUpdate = (updatedOrder) => {
      if (!updatedOrder?._id) {
        return;
      }

      setOrders((currentOrders) => {
        const existingIndex = currentOrders.findIndex(
          (order) => order._id === updatedOrder._id
        );

        if (existingIndex === -1) {
          return [updatedOrder, ...currentOrders];
        }

        const nextOrders = [...currentOrders];

        nextOrders[existingIndex] = {
          ...nextOrders[existingIndex],
          ...updatedOrder,
        };

        return nextOrders;
      });

      toast.success(
        `Order ${updatedOrder._id
          .slice(-6)
          .toUpperCase()} updated`
      );
    };

    const handleConnect = () => {
      joinAdminRoom();
    };

    socket.on('connect', handleConnect);
    socket.on('orderUpdate', handleOrderUpdate);

    if (socket.connected) {
      joinAdminRoom();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('orderUpdate', handleOrderUpdate);
    };
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status,
      });

      toast.success(
        `Order marked ${status.replaceAll('_', ' ')}`
      );

      fetchOrders();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to update order'
      );
    }
  };

  const updatePreparationTime = async (
    orderId,
    minutes
  ) => {
    try {
      await api.patch(
        `/orders/${orderId}/preparation-time`,
        {
          estimatedMinutes: Number(minutes),
        }
      );

      toast.success('Preparation time updated');

      fetchOrders();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to update preparation time'
      );
    }
  };

  const handlePreparationTimeChange = (
    orderId,
    value
  ) => {
    setPreparationTimes((current) => ({
      ...current,
      [orderId]: value,
    }));
  };

  /*
   * ==========================================================
   * SEARCH + FILTER
   *
   * Searches:
   * - Full order ID
   * - Short order ID
   * - Table number
   * - Customer name
   * - Customer email
   * - Customer phone
   * - Food/item names
   * - Order status
   * ==========================================================
   */
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      // Status filter
      if (
        statusFilter !== 'ALL' &&
        order.status !== statusFilter
      ) {
        return false;
      }

      // No search query
      if (!query) {
        return true;
      }

      const shortOrderId = order._id
        ?.slice(-6)
        .toLowerCase();

      const fullOrderId = order._id?.toLowerCase();

      const tableNumber = String(
        order.tableNumber ?? ''
      ).toLowerCase();

      const customerName =
        order.userId?.name?.toLowerCase() || '';

      const customerEmail =
        order.userId?.email?.toLowerCase() || '';

      const customerPhone =
        order.userId?.phone?.toLowerCase() || '';

      const status =
        formatStatus(order.status)?.toLowerCase() || '';

      const itemNames =
        order.items
          ?.map((item) => item.name || '')
          .join(' ')
          .toLowerCase() || '';

      return (
        shortOrderId?.includes(query) ||
        fullOrderId?.includes(query) ||
        tableNumber.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        customerPhone.includes(query) ||
        status.includes(query) ||
        itemNames.includes(query)
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  const hasFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'ALL';

  const orderSummary = useMemo(() => {
    return {
      total: orders.length,

      received: orders.filter(
        (order) => order.status === 'RECEIVED'
      ).length,

      preparing: orders.filter(
        (order) => order.status === 'PREPARING'
      ).length,

      ready: orders.filter(
        (order) => order.status === 'READY_TO_SERVE'
      ).length,
    };
  }, [orders]);

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

      <section>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#D96A3A]">
              Restaurant operations
            </p>

            <h1 className="font-serif text-4xl leading-none tracking-[-0.03em] text-[#241B2F] sm:text-5xl">
              Manage orders.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#766E68]">
              Monitor incoming orders, move them through the
              kitchen and keep service running smoothly.
            </p>
          </div>

          {/* LIVE INDICATOR */}

          <div className="flex items-center gap-3 self-start rounded-full border border-[#E7DDD3] bg-white px-4 py-2.5 shadow-[0_5px_20px_rgba(36,27,47,0.04)] lg:self-auto">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D96A3A] opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#D96A3A]" />
            </span>

            <span className="text-xs font-semibold text-[#5F5752]">
              Live order updates
            </span>
          </div>

        </div>
      </section>


      {/* =====================================================
          SEARCH + FILTER
      ====================================================== */}

      <section className="rounded-[24px] border border-[#E7DDD3] bg-white p-4 shadow-[0_6px_25px_rgba(36,27,47,0.035)] sm:p-5">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A918A]"
              size={18}
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search orders, tables, customers or dishes..."
              className="h-12 w-full rounded-full border border-[#E0D5CA] bg-[#FCFAF7] pl-11 pr-11 text-sm text-[#241B2F] outline-none transition placeholder:text-[#9A918A] focus:border-[#D96A3A] focus:bg-white focus:ring-2 focus:ring-[#D96A3A]/10"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-[#9A918A] transition hover:text-[#241B2F]"
              >
                <X size={17} />
              </button>
            )}

          </div>


          {/* STATUS FILTER */}

          <div className="relative lg:w-[210px]">

            <SlidersHorizontal
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9A918A]"
              size={17}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-12 w-full appearance-none rounded-full border border-[#E0D5CA] bg-[#FCFAF7] pl-11 pr-4 text-sm font-semibold text-[#241B2F] outline-none transition focus:border-[#D96A3A] focus:bg-white focus:ring-2 focus:ring-[#D96A3A]/10"
            >
              <option value="ALL">
                All statuses
              </option>

              <option value="RECEIVED">
                Received
              </option>

              <option value="PREPARING">
                Preparing
              </option>

              <option value="READY_TO_SERVE">
                Ready to serve
              </option>

              <option value="SERVED">
                Served
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>

          </div>

        </div>


        {/* SEARCH RESULT INFO */}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">

          <p className="text-xs text-[#9A918A]">
            {hasFilters ? (
              <>
                Showing{' '}
                <span className="font-bold text-[#5F5752]">
                  {filteredOrders.length}
                </span>{' '}
                of{' '}
                <span className="font-bold text-[#5F5752]">
                  {orders.length}
                </span>{' '}
                orders
              </>
            ) : (
              <>
                Search by order ID, table, customer or dish
              </>
            )}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-[#D96A3A] transition hover:text-[#B84F27] hover:underline"
            >
              Clear search & filters
            </button>
          )}

        </div>

      </section>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-[20px] border border-[#E7DDD3] bg-white p-5 shadow-[0_6px_25px_rgba(36,27,47,0.035)]">

          <div className="flex items-center justify-between">

            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F1E9DE] text-[#241B2F]">
              <ClipboardList className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A918A]">
              Total
            </span>

          </div>

          <p className="mt-5 font-serif text-3xl text-[#241B2F]">
            {orderSummary.total}
          </p>

          <p className="mt-1 text-xs text-[#766E68]">
            Orders in system
          </p>

        </div>


        {/* RECEIVED */}

        <div className="rounded-[20px] border border-[#E7DDD3] bg-white p-5 shadow-[0_6px_25px_rgba(36,27,47,0.035)]">

          <div className="flex items-center justify-between">

            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F4E8D8] text-[#8A5A24]">
              <ClipboardList className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A918A]">
              New
            </span>

          </div>

          <p className="mt-5 font-serif text-3xl text-[#241B2F]">
            {orderSummary.received}
          </p>

          <p className="mt-1 text-xs text-[#766E68]">
            Awaiting preparation
          </p>

        </div>


        {/* PREPARING */}

        <div className="rounded-[20px] border border-[#E7DDD3] bg-white p-5 shadow-[0_6px_25px_rgba(36,27,47,0.035)]">

          <div className="flex items-center justify-between">

            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F4DFD2] text-[#B84F27]">
              <ChefHat className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A918A]">
              Kitchen
            </span>

          </div>

          <p className="mt-5 font-serif text-3xl text-[#241B2F]">
            {orderSummary.preparing}
          </p>

          <p className="mt-1 text-xs text-[#766E68]">
            Currently preparing
          </p>

        </div>


        {/* READY */}

        <div className="rounded-[20px] border border-[#E7DDD3] bg-white p-5 shadow-[0_6px_25px_rgba(36,27,47,0.035)]">

          <div className="flex items-center justify-between">

            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#E7E1F0] text-[#5A456E]">
              <Utensils className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A918A]">
              Ready
            </span>

          </div>

          <p className="mt-5 font-serif text-3xl text-[#241B2F]">
            {orderSummary.ready}
          </p>

          <p className="mt-1 text-xs text-[#766E68]">
            Ready to serve
          </p>

        </div>

      </section>


      {/* =====================================================
          ORDERS
      ====================================================== */}

      <section>

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D96A3A]">
              Live queue
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#241B2F]">
              Current orders
            </h2>

          </div>

          <span className="text-sm text-[#766E68]">
            {filteredOrders.length}{' '}
            {filteredOrders.length === 1
              ? 'order'
              : 'orders'}
          </span>

        </div>


        {/* NO ORDERS AT ALL */}

        {orders.length === 0 ? (

          <div className="rounded-[28px] border border-[#E7DDD3] bg-white px-6 py-16 text-center shadow-[0_8px_30px_rgba(36,27,47,0.035)]">

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F1E9DE] text-[#D96A3A]">
              <ClipboardList className="h-7 w-7" />
            </div>

            <h3 className="mt-5 font-serif text-3xl text-[#241B2F]">
              No orders yet
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#766E68]">
              New customer orders will appear here automatically
              when they are placed.
            </p>

          </div>

        ) : filteredOrders.length === 0 ? (

          /* =================================================
             NO SEARCH RESULTS
          ================================================== */

          <div className="rounded-[28px] border border-[#E7DDD3] bg-white px-6 py-16 text-center shadow-[0_8px_30px_rgba(36,27,47,0.035)]">

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F1E9DE] text-[#D96A3A]">
              <Search className="h-7 w-7" />
            </div>

            <h3 className="mt-5 font-serif text-3xl text-[#241B2F]">
              No matching orders
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#766E68]">
              We couldn't find any orders matching
              {searchQuery
                ? ` "${searchQuery}"`
                : ' your selected filter'}.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-[#D96A3A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C85D31]"
            >
              View all orders
            </button>

          </div>

        ) : (

          <div className="space-y-5">

            {filteredOrders.map((order) => {

              const meta =
                statusMeta[order.status] ||
                statusMeta.RECEIVED;

              const StatusIcon = meta.icon;

              const preparationValue =
                preparationTimes[order._id] ??
                order.estimatedMinutes ??
                '';

              return (

                <article
                  key={order._id}
                  className="overflow-hidden rounded-[24px] border border-[#E7DDD3] bg-white shadow-[0_8px_30px_rgba(36,27,47,0.045)]"
                >

                  {/* ORDER TOP */}

                  <div className="border-b border-[#EEE7E0] px-5 py-5 sm:px-6">

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      <div className="flex items-start gap-4">

                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F1E9DE] text-[#241B2F]">
                          <ShoppingBagIcon />
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="font-serif text-2xl text-[#241B2F]">
                              Order #
                              {order._id
                                .slice(-6)
                                .toUpperCase()}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${meta.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>

                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#766E68]">

                            <span className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              Table {order.tableNumber}
                            </span>

                            {order.createdAt && (
                              <span className="flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5" />
                                {formatTime(order.createdAt)}
                              </span>
                            )}

                            {order.userId?.name && (
                              <span>
                                Customer: {order.userId.name}
                              </span>
                            )}

                          </div>

                        </div>

                      </div>


                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2">

                        {(statusActions[order.status] || []).map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  order._id,
                                  status
                                )
                              }
                              className={`rounded-full px-4 py-2.5 text-xs font-bold transition ${
                                actionMeta[status]?.className ||
                                'bg-[#241B2F] text-white hover:bg-[#34283F]'
                              }`}
                            >
                              {formatStatus(status)}
                            </button>
                          )
                        )}

                        <Link
                          to={`/receipt/${order._id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#E0D5CA] bg-white px-4 py-2.5 text-xs font-bold text-[#241B2F] transition hover:border-[#D96A3A] hover:text-[#D96A3A]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Receipt
                        </Link>

                      </div>

                    </div>

                  </div>


                  {/* ORDER BODY */}

                  <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_280px]">

                    {/* ITEMS */}

                    <div>

                      <div className="mb-3 flex items-center gap-2">

                        <Utensils className="h-4 w-4 text-[#D96A3A]" />

                        <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#5F5752]">
                          Order items
                        </h4>

                      </div>

                      <div className="overflow-hidden rounded-2xl border border-[#EEE7E0]">

                        {order.items.map((item, index) => (

                          <div
                            key={`${order._id}-${item.food}-${index}`}
                            className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
                              index !== order.items.length - 1
                                ? 'border-b border-[#EEE7E0]'
                                : ''
                            }`}
                          >

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-[#241B2F]">
                                {item.name}
                              </p>

                              {item.price !== undefined && (
                                <p className="mt-0.5 text-xs text-[#9A918A]">
                                  ₹
                                  {Number(
                                    item.price || 0
                                  ).toFixed(2)}{' '}
                                  each
                                </p>
                              )}

                            </div>

                            <span className="shrink-0 rounded-full bg-[#F7F2EC] px-3 py-1 text-xs font-bold text-[#5F5752]">
                              × {item.quantity}
                            </span>

                          </div>

                        ))}

                      </div>

                    </div>


                    {/* PREPARATION */}

                    <div className="rounded-[20px] border border-[#E7DDD3] bg-[#FCFAF7] p-4">

                      <div className="flex items-center gap-2">

                        <div className="grid h-8 w-8 place-items-center rounded-full bg-[#F4DFD2] text-[#D96A3A]">
                          <Clock3 className="h-4 w-4" />
                        </div>

                        <div>

                          <p className="text-xs font-bold uppercase tracking-wide text-[#5F5752]">
                            Preparation
                          </p>

                          <p className="text-[11px] text-[#9A918A]">
                            Estimated time
                          </p>

                        </div>

                      </div>


                      <div className="mt-4 flex items-center gap-2">

                        <input
                          type="number"
                          min="1"
                          value={preparationValue}
                          onChange={(event) =>
                            handlePreparationTimeChange(
                              order._id,
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-xl border border-[#E0D5CA] bg-white px-3 text-sm font-semibold text-[#241B2F] outline-none transition focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
                        />

                        <span className="shrink-0 text-xs font-medium text-[#766E68]">
                          min
                        </span>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          updatePreparationTime(
                            order._id,
                            preparationValue
                          )
                        }
                        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#241B2F] text-xs font-bold text-white transition hover:bg-[#34283F]"
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        Update time
                      </button>

                    </div>

                  </div>


                  {/* TOTAL */}

                  <div className="flex items-center justify-between border-t border-[#EEE7E0] bg-[#FCFAF7] px-5 py-4 sm:px-6">

                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#766E68]">

                      <Flame className="h-4 w-4 text-[#D96A3A]" />

                      Order total

                    </div>

                    <span className="font-serif text-2xl text-[#241B2F]">
                      ₹
                      {Number(
                        order.total || 0
                      ).toFixed(2)}
                    </span>

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </section>

    </div>
  );
};


/*
 * Small local icon wrapper.
 */
const ShoppingBagIcon = () => {
  return (
    <ClipboardList className="h-5 w-5" />
  );
};

export default AdminOrdersPage;