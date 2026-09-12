import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from '../../components/common/Card.jsx';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(user?.user || user || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');

        setProfile(response.data.data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || 'Unable to load profile'
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container-kitchen py-16">
        <div className="mx-auto max-w-3xl">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 h-72 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-kitchen py-10 sm:py-14">

      {/* HEADER */}

      <div className="mx-auto max-w-3xl">

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D96A3A]">
          My Account
        </p>

        <h1 className="mt-2 font-serif text-4xl font-semibold text-[#241B2F] sm:text-5xl">
          Your Profile
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Manage your account information and quickly access your orders.
        </p>

      </div>


      {/* PROFILE CARD */}

      <div className="mx-auto mt-8 max-w-3xl">

        <Card className="overflow-hidden">

          {/* PROFILE HEADER */}

          <div className="flex flex-col gap-5 border-b border-[#EEE7E0] pb-6 sm:flex-row sm:items-center">

            <div
              className="
                grid
                h-20
                w-20
                shrink-0
                place-items-center
                rounded-full
                bg-[#D96A3A]
                text-white
                shadow-[0_8px_25px_rgba(217,106,58,0.2)]
              "
            >
              <User className="h-9 w-9" />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#241B2F]">
                {profile?.name || 'Customer'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {profile?.email || 'No email available'}
              </p>

              <span
                className="
                  mt-3
                  inline-flex
                  rounded-full
                  bg-[#D96A3A]/10
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  capitalize
                  text-[#D96A3A]
                "
              >
                {profile?.role || 'customer'}
              </span>
            </div>

          </div>


          {/* INFORMATION */}

          <div className="grid gap-4 py-6 sm:grid-cols-2">

            <div
              className="
                rounded-2xl
                border
                border-[#EEE7E0]
                bg-[#FAF7F2]
                p-4
              "
            >
              <div className="flex items-center gap-3">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#D96A3A]">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#241B2F]">
                    {profile?.name || 'Not provided'}
                  </p>
                </div>

              </div>
            </div>


            <div
              className="
                rounded-2xl
                border
                border-[#EEE7E0]
                bg-[#FAF7F2]
                p-4
              "
            >
              <div className="flex items-center gap-3">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#D96A3A]">
                  <Mail className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-[#241B2F]">
                    {profile?.email || 'Not provided'}
                  </p>
                </div>

              </div>
            </div>


            <div
              className="
                rounded-2xl
                border
                border-[#EEE7E0]
                bg-[#FAF7F2]
                p-4
              "
            >
              <div className="flex items-center gap-3">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#D96A3A]">
                  <Phone className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#241B2F]">
                    {profile?.phone || 'Not provided'}
                  </p>
                </div>

              </div>
            </div>


            <div
              className="
                rounded-2xl
                border
                border-[#EEE7E0]
                bg-[#FAF7F2]
                p-4
              "
            >
              <div className="flex items-center gap-3">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#D96A3A]">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Account
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-[#241B2F]">
                    {profile?.role || 'Customer'}
                  </p>
                </div>

              </div>
            </div>

          </div>


          {/* ACTIONS */}

          <div className="border-t border-[#EEE7E0] pt-6">

            <Link
              to="/my-orders"
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-[#EEE7E0]
                bg-[#FAF7F2]
                px-4
                py-4
                transition
                hover:border-[#D96A3A]/40
                hover:bg-[#D96A3A]/5
              "
            >

              <div className="flex items-center gap-3">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#D96A3A] text-white">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#241B2F]">
                    My Orders
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    View your previous and current orders
                  </p>
                </div>

              </div>

              <ArrowRight className="h-5 w-5 text-[#D96A3A]" />

            </Link>

          </div>

        </Card>

      </div>

    </div>
  );
};

export default ProfilePage;