import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  CalendarDays,
  IndianRupee,
  Flame,
  Clock3,
  RefreshCw,
  Sparkles,
  Utensils,
  ShoppingBag,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';

const AdminReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get('/reports');
      setStats(response.data?.data || null);
    } catch (error) {
      console.error('Failed to load reports:', error);

      toast.error(
        error.response?.data?.message ||
          'Unable to load reports'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const dailyRevenue = Number(stats?.dailyRevenue || 0);
  const weeklyRevenue = Number(stats?.weeklyRevenue || 0);
  const monthlyRevenue = Number(stats?.monthlyRevenue || 0);

  const popularDishes = useMemo(() => {
    if (!Array.isArray(stats?.popularDishes)) {
      return [];
    }

    return [...stats.popularDishes].sort(
      (a, b) =>
        Number(b.popularity || 0) -
        Number(a.popularity || 0)
    );
  }, [stats]);

  const peakHours = useMemo(() => {
    if (!Array.isArray(stats?.peakHours)) {
      return [];
    }

    return [...stats.peakHours].sort(
      (a, b) =>
        Number(b.count || 0) -
        Number(a.count || 0)
    );
  }, [stats]);

  const totalPopularDishSales = useMemo(() => {
    return popularDishes.reduce(
      (sum, dish) =>
        sum + Number(dish.popularity || 0),
      0
    );
  }, [popularDishes]);

  const topDish = popularDishes[0];

  const busiestHour = peakHours[0];

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatHour = (hour) => {
    const numericHour = Number(hour);

    if (Number.isNaN(numericHour)) {
      return `${hour}:00`;
    }

    const suffix = numericHour >= 12 ? 'PM' : 'AM';
    const displayHour =
      numericHour % 12 === 0
        ? 12
        : numericHour % 12;

    return `${displayHour}:00 ${suffix}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[#E7DDD3] bg-white px-5 py-3 text-sm text-[#6F655E] shadow-sm">
          <RefreshCw className="h-4 w-4 animate-spin text-[#D96A3A]" />
          Loading reports...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-[#E7DDD3] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBE9E1] text-[#D96A3A]">
            <BarChart3 className="h-6 w-6" />
          </div>

          <h2 className="mt-5 font-serif text-2xl text-[#241B2F]">
            Reports unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#756B63]">
            We couldn't load the restaurant analytics right
            now. Try refreshing the report.
          </p>

          <button
            type="button"
            onClick={() => loadReports(true)}
            disabled={refreshing}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#D96A3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C85D31] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[#E7DDD3] bg-[#241B2F] px-6 py-7 text-white shadow-sm md:px-8 md:py-8">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#D96A3A]/20 blur-2xl" />

        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              <Sparkles className="h-3.5 w-3.5 text-[#F0A27F]" />
              Business intelligence
            </div>

            <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              Know your numbers.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
              A quick view of sales performance, popular
              dishes, and the hours when your restaurant is
              busiest.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadReports(true)}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/15 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh reports
          </button>
        </div>
      </section>

      {/* Revenue cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FBE9E1]" />

          <div className="relative flex items-center justify-between">
            <div className="rounded-2xl bg-[#FBE9E1] p-3 text-[#D96A3A]">
              <IndianRupee className="h-5 w-5" />
            </div>

            <span className="rounded-full bg-[#FCF8F4] px-3 py-1.5 text-xs font-semibold text-[#9A8D83]">
              Today
            </span>
          </div>

          <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A8D83]">
            Daily sales
          </p>

          <p className="relative mt-2 font-serif text-3xl text-[#241B2F]">
            {formatCurrency(dailyRevenue)}
          </p>

          <div className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#6D806E]">
            <TrendingUp className="h-3.5 w-3.5" />
            Current day revenue
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#F4EFE9]" />

          <div className="relative flex items-center justify-between">
            <div className="rounded-2xl bg-[#F4EFE9] p-3 text-[#241B2F]">
              <CalendarDays className="h-5 w-5" />
            </div>

            <span className="rounded-full bg-[#FCF8F4] px-3 py-1.5 text-xs font-semibold text-[#9A8D83]">
              7 days
            </span>
          </div>

          <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A8D83]">
            Weekly sales
          </p>

          <p className="relative mt-2 font-serif text-3xl text-[#241B2F]">
            {formatCurrency(weeklyRevenue)}
          </p>

          <div className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#6D806E]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Rolling weekly revenue
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FBE9E1]" />

          <div className="relative flex items-center justify-between">
            <div className="rounded-2xl bg-[#FBE9E1] p-3 text-[#D96A3A]">
              <BarChart3 className="h-5 w-5" />
            </div>

            <span className="rounded-full bg-[#FCF8F4] px-3 py-1.5 text-xs font-semibold text-[#9A8D83]">
              30 days
            </span>
          </div>

          <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A8D83]">
            Monthly sales
          </p>

          <p className="relative mt-2 font-serif text-3xl text-[#241B2F]">
            {formatCurrency(monthlyRevenue)}
          </p>

          <div className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#6D806E]">
            <TrendingUp className="h-3.5 w-3.5" />
            Monthly revenue
          </div>
        </div>
      </section>

      {/* Quick insights */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#FBE9E1] p-3 text-[#D96A3A]">
              <Trophy className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A8D83]">
                Top dish
              </p>

              <p className="mt-1 font-semibold text-[#241B2F]">
                {topDish?.name || 'No data yet'}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#756B63]">
            {topDish
              ? `${Number(topDish.popularity || 0)} sold`
              : 'Sales data will appear here'}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#F4EFE9] p-3 text-[#241B2F]">
              <Utensils className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A8D83]">
                Dish sales
              </p>

              <p className="mt-1 font-semibold text-[#241B2F]">
                {totalPopularDishSales}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#756B63]">
            Units across popular dishes
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#FBE9E1] p-3 text-[#D96A3A]">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A8D83]">
                Peak hour
              </p>

              <p className="mt-1 font-semibold text-[#241B2F]">
                {busiestHour
                  ? formatHour(busiestHour._id)
                  : 'No data'}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#756B63]">
            {busiestHour
              ? `${Number(busiestHour.count || 0)} orders`
              : 'Order patterns will appear here'}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#F4EFE9] p-3 text-[#241B2F]">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A8D83]">
                Insights
              </p>

              <p className="mt-1 font-semibold text-[#241B2F]">
                {popularDishes.length}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#756B63]">
            Popular dishes being tracked
          </p>
        </div>
      </section>

      {/* Analytics */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Popular dishes */}
        <div className="rounded-[2rem] border border-[#E7DDD3] bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between border-b border-[#EEE5DD] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-[#D96A3A]" />

                <h2 className="font-serif text-2xl text-[#241B2F]">
                  Best-selling dishes
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#756B63]">
                See which dishes are driving demand.
              </p>
            </div>

            <span className="rounded-full bg-[#FBE9E1] px-3 py-1.5 text-xs font-semibold text-[#D96A3A]">
              Top {popularDishes.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {popularDishes.length === 0 ? (
              <div className="rounded-2xl bg-[#FCFAF7] px-4 py-8 text-center">
                <Utensils className="mx-auto h-7 w-7 text-[#C8BDB4]" />

                <p className="mt-3 text-sm font-semibold text-[#4C423B]">
                  No dish data yet
                </p>

                <p className="mt-1 text-xs text-[#91867E]">
                  Popular dishes will appear once orders are
                  recorded.
                </p>
              </div>
            ) : (
              popularDishes.map((dish, index) => {
                const popularity = Number(
                  dish.popularity || 0
                );

                const maxPopularity = Number(
                  popularDishes[0]?.popularity || 1
                );

                const percentage = Math.max(
                  (popularity / maxPopularity) * 100,
                  5
                );

                return (
                  <div
                    key={dish._id || `${dish.name}-${index}`}
                    className="rounded-[1.5rem] border border-[#E8DED5] bg-[#FCFAF7] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#241B2F] font-serif text-lg text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-semibold text-[#241B2F]">
                            {dish.name || 'Unnamed dish'}
                          </p>

                          <span className="shrink-0 text-sm font-semibold text-[#D96A3A]">
                            {popularity} sold
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E9DED5]">
                          <div
                            className="h-full rounded-full bg-[#D96A3A] transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Peak hours */}
        <div className="rounded-[2rem] border border-[#E7DDD3] bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between border-b border-[#EEE5DD] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[#D96A3A]" />

                <h2 className="font-serif text-2xl text-[#241B2F]">
                  Peak hours
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#756B63]">
                Understand when your restaurant gets busiest.
              </p>
            </div>

            <span className="rounded-full bg-[#F4EFE9] px-3 py-1.5 text-xs font-semibold text-[#756B63]">
              Orders
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {peakHours.length === 0 ? (
              <div className="rounded-2xl bg-[#FCFAF7] px-4 py-8 text-center">
                <Clock3 className="mx-auto h-7 w-7 text-[#C8BDB4]" />

                <p className="mt-3 text-sm font-semibold text-[#4C423B]">
                  No peak-hour data yet
                </p>

                <p className="mt-1 text-xs text-[#91867E]">
                  Order timing data will appear here.
                </p>
              </div>
            ) : (
              peakHours.map((hour, index) => {
                const count = Number(hour.count || 0);

                const maxCount = Number(
                  peakHours[0]?.count || 1
                );

                const percentage = Math.max(
                  (count / maxCount) * 100,
                  5
                );

                return (
                  <div
                    key={hour._id || `hour-${index}`}
                    className="rounded-[1.5rem] border border-[#E8DED5] bg-[#FCFAF7] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBE9E1] text-[#D96A3A]">
                        <Clock3 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-[#241B2F]">
                            {formatHour(hour._id)}
                          </p>

                          <span className="shrink-0 text-sm font-semibold text-[#D96A3A]">
                            {count} orders
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E9DED5]">
                          <div
                            className="h-full rounded-full bg-[#241B2F] transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Revenue overview */}
      <section className="rounded-[2rem] border border-[#E7DDD3] bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-[#EEE5DD] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#D96A3A]" />

              <h2 className="font-serif text-2xl text-[#241B2F]">
                Revenue overview
              </h2>
            </div>

            <p className="mt-1 text-sm text-[#756B63]">
              Current revenue snapshot across three reporting
              periods.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F4EFE9] px-3 py-1.5 text-xs font-semibold text-[#756B63]">
            <TrendingUp className="h-3.5 w-3.5" />
            Sales performance
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-[#FCFAF7] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#756B63]">
                Daily
              </span>

              <span className="text-xs font-semibold text-[#9A8D83]">
                1D
              </span>
            </div>

            <p className="mt-3 font-serif text-2xl text-[#241B2F]">
              {formatCurrency(dailyRevenue)}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E9DED5]">
              <div
                className="h-full rounded-full bg-[#D96A3A]"
                style={{
                  width: `${Math.min(
                    monthlyRevenue > 0
                      ? (dailyRevenue / monthlyRevenue) * 100
                      : 0,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-[#FCFAF7] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#756B63]">
                Weekly
              </span>

              <span className="text-xs font-semibold text-[#9A8D83]">
                7D
              </span>
            </div>

            <p className="mt-3 font-serif text-2xl text-[#241B2F]">
              {formatCurrency(weeklyRevenue)}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E9DED5]">
              <div
                className="h-full rounded-full bg-[#241B2F]"
                style={{
                  width: `${Math.min(
                    monthlyRevenue > 0
                      ? (weeklyRevenue / monthlyRevenue) * 100
                      : 0,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-[#FCFAF7] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#756B63]">
                Monthly
              </span>

              <span className="text-xs font-semibold text-[#9A8D83]">
                30D
              </span>
            </div>

            <p className="mt-3 font-serif text-2xl text-[#241B2F]">
              {formatCurrency(monthlyRevenue)}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E9DED5]">
              <div
                className="h-full w-full rounded-full bg-[#D96A3A]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminReportsPage;