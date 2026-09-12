import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  Navigation,
  MessageCircle,
} from 'lucide-react';

import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { restaurantConfig } from '../../config/restaurant.js';

const ContactPage = () => {
  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd3] bg-white px-4 py-2.5 text-sm font-semibold text-[#241B2F] shadow-sm transition hover:border-[#d96a3a] hover:text-[#d96a3a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] bg-[#241B2F] px-6 py-10 text-white shadow-[0_14px_40px_rgba(36,27,47,0.14)] sm:px-10 sm:py-12">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#D96A3A]/15" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#D96A3A]/10" />

        <div className="relative max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#D96A3A]">
            Contact us
          </p>

          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">
            We’re here to help
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
            Have a question about your order, need a table, or simply want
            to know more about our menu? Our team is always happy to help.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-white/55">
            <span className="h-px w-8 bg-[#D96A3A]" />
            <span>{restaurantConfig.name || 'CloudCraves Kitchen'}</span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Restaurant information */}
        <Card className="rounded-[30px] border-[#e7ddd3] bg-white p-6 shadow-[0_10px_35px_rgba(36,27,47,0.06)] sm:p-7">
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4dfd2] text-[#D96A3A]">
              <MapPin className="h-5 w-5" />
            </div>

            <h2 className="font-serif text-2xl text-[#241B2F] sm:text-3xl">
              Restaurant information
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#766e68]">
              Everything you need to get in touch with us.
            </p>
          </div>

          <div className="space-y-3">
            {/* Phone */}
            <div className="rounded-[22px] border border-[#e7ddd3] bg-[#fcfaf7] p-4 transition hover:border-[#d96a3a]/40">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#D96A3A] shadow-sm">
                  <Phone className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a9189]">
                    Phone
                  </p>

                  <a
                    href={`tel:${restaurantConfig.phone}`}
                    className="mt-1 block text-sm font-semibold text-[#241B2F] transition hover:text-[#D96A3A]"
                  >
                    {restaurantConfig.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-[22px] border border-[#e7ddd3] bg-[#fcfaf7] p-4 transition hover:border-[#d96a3a]/40">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#D96A3A] shadow-sm">
                  <Mail className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a9189]">
                    Email
                  </p>

                  <a
                    href={`mailto:${restaurantConfig.email}`}
                    className="mt-1 block break-all text-sm font-semibold text-[#241B2F] transition hover:text-[#D96A3A]"
                  >
                    {restaurantConfig.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-[22px] border border-[#e7ddd3] bg-[#fcfaf7] p-4 transition hover:border-[#d96a3a]/40">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#D96A3A] shadow-sm">
                  <MapPin className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a9189]">
                    Address
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#29242a]">
                    {restaurantConfig.address}
                  </p>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      restaurantConfig.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#D96A3A] transition hover:text-[#C85D31]"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Get directions
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              as="a"
              href={`tel:${restaurantConfig.phone}`}
              className="btn-primary flex-1"
            >
              <Phone className="h-4 w-4" />
              Call restaurant
            </Button>

            <Button
              as="a"
              href={`mailto:${restaurantConfig.email}`}
              className="btn-secondary flex-1"
            >
              <Mail className="h-4 w-4" />
              Email restaurant
            </Button>
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Opening hours */}
          <Card className="rounded-[30px] border-[#e7ddd3] bg-white p-6 shadow-[0_10px_35px_rgba(36,27,47,0.06)] sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4dfd2] text-[#D96A3A]">
                <Clock className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-serif text-2xl text-[#241B2F]">
                  Opening hours
                </h2>

                <p className="mt-1 text-sm text-[#766e68]">
                  Come visit us during these hours.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {restaurantConfig.openingHours.map((hour, index) => (
                <div
                  key={`${hour}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#e7ddd3] bg-[#fcfaf7] px-4 py-3"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D96A3A]" />

                  <span className="text-sm font-medium text-[#29242a]">
                    {hour}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Help card */}
          <div className="relative overflow-hidden rounded-[30px] bg-[#f4dfd2] p-6 sm:p-7">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40" />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#D96A3A] shadow-sm">
                <MessageCircle className="h-5 w-5" />
              </div>

              <h2 className="mt-5 font-serif text-2xl text-[#241B2F]">
                Need a little help?
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#5f5550]">
                Our team can help with table questions, menu recommendations,
                order support, or special requests during your visit.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#D96A3A]">
                <span className="h-px w-6 bg-[#D96A3A]" />
                We’d love to hear from you
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-[24px] border border-[#e7ddd3] bg-white px-5 py-4 text-center shadow-sm sm:flex-row sm:text-left">
        <div>
          <p className="text-sm font-semibold text-[#241B2F]">
            Looking for something delicious?
          </p>

          <p className="mt-1 text-xs text-[#766e68]">
            Explore our menu and order your favourites.
          </p>
        </div>

        <Link
          to="/menu"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#241B2F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d2852]"
        >
          Explore menu
        </Link>
      </div>
    </div>
  );
};

export default ContactPage;