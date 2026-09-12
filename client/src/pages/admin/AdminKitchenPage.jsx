import { useEffect, useMemo, useState } from 'react';
import {
  ChefHat,
  Clock3,
  CheckCircle2,
  UtensilsCrossed,
  ArrowRight,
  Inbox,
} from 'lucide-react';

import api from '../../services/api.js';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';

import {
  connectSocket,
  getSocket,
  joinAdminRoom,
} from '../../services/socket.js';

const kitchenStatuses = [
  {
    key: 'RECEIVED',
    label: 'New orders',
    description: 'Waiting to be prepared',
    icon: Inbox,
  },
  {
    key: 'PREPARING',
    label: 'Preparing',
    description: 'Currently being cooked',
    icon: ChefHat,
  },
  {
    key: 'READY_TO_SERVE',
    label: 'Ready to serve',
    description: 'Waiting for service',
    icon: CheckCircle2,
  },
];

const statusButton = {
  RECEIVED: {
    label: 'Start preparing',
    next: 'PREPARING',
  },
  PREPARING: {
    label: 'Mark ready',
    next: 'READY_TO_SERVE',
  },
  READY_TO_SERVE: {
    label: 'Mark served',
    next: 'SERVED',
  },
};

const AdminKitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load kitchen orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /*
   * Keep the kitchen board synchronized with live order updates.
   */
  useEffect(() => {
    const token = api.defaults.headers.common.Authorization;

    if (!token) {
      return;
    }

    const socket = connectSocket(token.replace('Bearer ', ''));

    if (!socket) {
      return;
    }

    const handleConnect = () => {
      joinAdminRoom();
    };

    const handleOrderUpdate = (updatedOrder) => {
      if (!updatedOrder?._id) {
        return;
      }

      setOrders((currentOrders) => {
        const exists = currentOrders.some(
          (order) => order._id === updatedOrder._id
        );

        if (!exists) {
          return [updatedOrder, ...currentOrders];
        }

        return currentOrders.map((order) =>
          order._id === updatedOrder._id
            ? { ...order, ...updatedOrder }
            : order
        );
      });
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

  const grouped = useMemo(
    () =>
      kitchenStatuses.map((status) => ({
        ...status,
        items: orders.filter(
          (order) => order.status === status.key
        ),
      })),
    [orders]
  );

  const updateStatus = async (orderId, status) => {
    setUpdatingOrder(orderId);

    try {
      await api.patch(`/orders/${orderId}/status`, {
        status,
      });

      toast.success(
        `Order moved to ${status.replaceAll('_', ' ')}`
      );

      /*
       * The socket normally updates the UI immediately.
       * Fetching again keeps the board fully synchronized with
       * the server response.
       */
      await fetchOrders();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to update order'
      );
    } finally {
      setUpdatingOrder(null);
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#D96A3A]">
            Back of house
          </p>

          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#241B2F] sm:text-5xl">
            Kitchen display
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Keep track of incoming orders and move them through
            the kitchen as they are prepared.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-[#eadfd5] bg-white px-4 py-2 text-sm text-slate-600 shadow-sm sm:self-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>

          Live kitchen board
        </div>
      </div>

      {/* Kitchen columns */}
      <div className="grid gap-5 xl:grid-cols-3">
        {grouped.map((group) => {
          const Icon = group.icon;
          const action = statusButton[group.key];

          return (
            <section
              key={group.key}
              className="flex min-h-[520px] flex-col overflow-hidden rounded-[30px] border border-[#eadfd5] bg-white shadow-[0_8px_30px_rgba(36,27,47,0.05)]"
            >
              {/* Column header */}
              <div className="border-b border-[#eee6df] bg-[#fcfaf7] px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#D96A3A]">
                      <Icon size={21} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-[#241B2F]">
                        {group.label}
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#241B2F] px-2 text-xs font-semibold text-white">
                    {group.items.length}
                  </span>
                </div>
              </div>

              {/* Orders */}
              <div className="flex-1 space-y-4 p-4">
                {group.items.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#D96A3A]">
                      <UtensilsCrossed size={20} />
                    </div>

                    <p className="mt-4 font-semibold text-[#241B2F]">
                      All clear
                    </p>

                    <p className="mt-1 max-w-[200px] text-sm leading-5 text-slate-500">
                      No orders are currently in this stage.
                    </p>
                  </div>
                ) : (
                  group.items.map((order) => (
                    <article
                      key={order._id}
                      className="rounded-[24px] border border-[#eee6df] bg-white p-5 shadow-sm transition hover:border-[#dfc8bb] hover:shadow-md"
                    >
                      {/* Order identity */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D96A3A]">
                            Order
                          </p>

                          <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#241B2F]">
                            #
                            {order._id
                              .slice(-6)
                              .toUpperCase()}
                          </h3>
                        </div>

                        <div className="rounded-2xl bg-[#f7f3ef] px-3 py-2 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Table
                          </p>

                          <p className="mt-0.5 text-lg font-semibold text-[#241B2F]">
                            {order.tableNumber}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <Clock3 size={14} />
                        <span>
                          {order.estimatedMinutes
                            ? `${order.estimatedMinutes} min preparation`
                            : 'Preparation time not set'}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="mt-5 border-t border-[#eee6df] pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Order items
                        </p>

                        <div className="space-y-2.5">
                          {order.items?.map((item, index) => (
                            <div
                              key={`${order._id}-${item.food || index}`}
                              className="flex items-start justify-between gap-3 text-sm"
                            >
                              <div className="flex min-w-0 gap-3">
                                <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-[#f8e8df] px-1.5 text-xs font-bold text-[#D96A3A]">
                                  {item.quantity}
                                </span>

                                <span className="font-medium text-[#241B2F]">
                                  {item.name}
                                </span>
                              </div>

                              {item.price != null && (
                                <span className="shrink-0 text-xs text-slate-400">
                                  ₹
                                  {Number(item.price).toFixed(
                                    2
                                  )}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action */}
                      {action && (
                        <button
                          type="button"
                          disabled={updatingOrder === order._id}
                          onClick={() =>
                            updateStatus(
                              order._id,
                              action.next
                            )
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D96A3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#C85D31] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingOrder === order._id ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              Updating...
                            </>
                          ) : (
                            <>
                              {action.label}
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default AdminKitchenPage;