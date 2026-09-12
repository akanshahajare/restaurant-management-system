import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  CalendarDays,
  Flame,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';

import api from '../../services/api.js';
import Spinner from '../../components/common/Spinner.jsx';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/reports');
        setStats(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-[28px] border border-[#E8C8C2] bg-[#FFF4F2] p-6 text-[#A8473A]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A8473A]/10">
            <AlertCircle size={20} />
          </div>

          <div>
            <p className="font-semibold">Unable to load dashboard</p>
            <p className="mt-1 text-sm text-[#9B6862]">
              We could not retrieve the latest restaurant statistics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalOrders = Number(stats.totalOrders || 0);
  const pendingOrders = Number(stats.pendingOrders || 0);
  const completedOrders = Number(stats.completedOrders || 0);

  const dailyRevenue = Number(stats.dailyRevenue || 0);
  const weeklyRevenue = Number(stats.weeklyRevenue || 0);
  const monthlyRevenue = Number(stats.monthlyRevenue || 0);

  const popularDishes = Array.isArray(stats.popularDishes)
    ? stats.popularDishes
    : [];

  const orderCompletion =
    totalOrders > 0
      ? Math.round((completedOrders / totalOrders) * 100)
      : 0;

  const statCards = [
    {
      label: 'Total orders',
      value: totalOrders,
      description: 'All orders received',
      icon: ClipboardList,
      iconClass: 'bg-[#F7E8E0] text-[#D96A3A]',
    },
    {
      label: 'Pending orders',
      value: pendingOrders,
      description: 'Orders still in progress',
      icon: Clock3,
      iconClass: 'bg-[#FFF1DA] text-[#C97922]',
    },
    {
      label: 'Completed orders',
      value: completedOrders,
      description: 'Successfully completed',
      icon: CheckCircle2,
      iconClass: 'bg-[#E9F4ED] text-[#47775A]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#D96A3A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#D96A3A]">
              Restaurant overview
            </span>
          </div>

          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#241B2F] sm:text-5xl">
            Dashboard
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#766D78]">
            A quick look at your orders, revenue, and most popular dishes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-[#E8DED2] bg-white px-4 py-2.5 text-sm text-[#766D78] shadow-sm lg:self-auto">
          <CalendarDays size={16} className="text-[#D96A3A]" />
          <span>Restaurant performance</span>
        </div>
      </div>

      {/* Orders */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-[#D96A3A]" />

          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#241B2F]">
            Orders
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="group rounded-[28px] border border-[#E8DED2] bg-white p-6 shadow-[0_8px_30px_rgba(36,27,47,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(36,27,47,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B9097]">
                      {item.label}
                    </p>

                    <p className="mt-4 text-4xl font-semibold tracking-tight text-[#241B2F]">
                      {item.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconClass}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-4 text-sm text-[#8A8088]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completion */}
      <section>
        <div className="rounded-[30px] border border-[#E8DED2] bg-white p-6 shadow-[0_8px_30px_rgba(36,27,47,0.05)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#47775A]" />

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#241B2F]">
                  Order completion
                </p>
              </div>

              <p className="mt-2 text-sm text-[#8A8088]">
                Percentage of all orders successfully completed.
              </p>
            </div>

            <p className="font-serif text-4xl font-semibold text-[#241B2F]">
              {orderCompletion}%
            </p>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#F1EBE5]">
            <div
              className="h-full rounded-full bg-[#47775A] transition-all duration-500"
              style={{ width: `${orderCompletion}%` }}
            />
          </div>
        </div>
      </section>

      {/* Revenue */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-[#D96A3A]" />

          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#241B2F]">
            Revenue
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Today */}
          <div className="relative overflow-hidden rounded-[30px] bg-[#241B2F] p-6 text-white shadow-[0_12px_35px_rgba(36,27,47,0.14)]">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#D96A3A]/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                  Today
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <IndianRupee size={18} className="text-[#D96A3A]" />
                </div>
              </div>

              <p className="mt-6 font-serif text-3xl font-semibold">
                ₹{dailyRevenue.toFixed(2)}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-sm text-white/55">
                <ArrowUpRight size={15} />
                Revenue generated today
              </div>
            </div>
          </div>

          {/* Weekly */}
          <div className="rounded-[30px] border border-[#E8DED2] bg-white p-6 shadow-[0_8px_30px_rgba(36,27,47,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B9097]">
                  This week
                </p>

                <p className="mt-5 font-serif text-3xl font-semibold tracking-tight text-[#241B2F]">
                  ₹{weeklyRevenue.toFixed(2)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7E8E0] text-[#D96A3A]">
                <TrendingUp size={18} />
              </div>
            </div>

            <p className="mt-2 text-sm text-[#8A8088]">
              Revenue generated this week
            </p>
          </div>

          {/* Monthly */}
          <div className="rounded-[30px] border border-[#E8DED2] bg-white p-6 shadow-[0_8px_30px_rgba(36,27,47,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B9097]">
                  This month
                </p>

                <p className="mt-5 font-serif text-3xl font-semibold tracking-tight text-[#241B2F]">
                  ₹{monthlyRevenue.toFixed(2)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7E8E0] text-[#D96A3A]">
                <IndianRupee size={18} />
              </div>
            </div>

            <p className="mt-2 text-sm text-[#8A8088]">
              Revenue generated this month
            </p>
          </div>
        </div>
      </section>

      {/* Popular dishes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-[#D96A3A]" />

            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#241B2F]">
              Popular dishes
            </h2>
          </div>

          <span className="text-xs text-[#9B9097]">
            Best sellers
          </span>
        </div>

        <div className="rounded-[30px] border border-[#E8DED2] bg-white p-5 shadow-[0_8px_30px_rgba(36,27,47,0.05)] sm:p-6">
          {popularDishes.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7E8E0] text-[#D96A3A]">
                <Flame size={21} />
              </div>

              <p className="mt-4 font-semibold text-[#241B2F]">
                No popular dishes yet
              </p>

              <p className="mt-1 text-sm text-[#8A8088]">
                Popular dishes will appear here as orders come in.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {popularDishes.map((item, index) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-[#EEE5DC] bg-[#FCFAF7] px-4 py-4 transition hover:border-[#E3C9BB] hover:bg-[#FFF9F5]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#241B2F] text-sm font-semibold text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#241B2F]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-sm text-[#8A8088]">
                        Sold {Number(item.popularity || 0)} times
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-[#F7E8E0] px-3 py-1 text-xs font-semibold text-[#D96A3A]">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;