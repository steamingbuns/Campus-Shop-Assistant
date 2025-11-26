import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    title: 'Marketplace',
    description: 'Browse curated listings with campus-only pricing and fast meetups.',
    icon: ShoppingBag,
    gradient: 'from-indigo-600/20 via-indigo-500/10 to-blue-400/20',
    href: '/marketplace',
  },
  {
    title: 'Chat Assistant',
    description: 'Get instant guidance on deals, swaps, or finding exactly what you need.',
    icon: MessageCircle,
    gradient: 'from-blue-500/20 via-cyan-400/20 to-indigo-500/10',
    href: '/marketplace',
  },
  {
    title: 'Tracking',
    description: 'Track pickups and deliveries with live status and trusted handoffs.',
    icon: MapPin,
    gradient: 'from-indigo-600/15 via-blue-500/10 to-emerald-400/15',
    href: '/profile',
  },
];

const MotionLink = motion(Link);

function Home() {
  return (
    <div className="relative z-10 space-y-16">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center"
      >
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 shadow-sm shadow-indigo-100 ring-1 ring-indigo-100">
            <Sparkles className="h-4 w-4" />
            Premium campus marketplace
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Shop smart. Sell fast. Stay on campus.
            </h1>
            <p className="text-lg text-slate-600 sm:text-xl">
              Discover essentials, tech, and textbooks with students you trust. Every interaction is
              tailored for quick pickups, secure trades, and verified campus-only deals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Explore marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white/80 px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm shadow-indigo-50 transition hover:border-indigo-200 hover:shadow-md"
            >
              Become a seller
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
            </Link>
            <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm shadow-indigo-50 ring-1 ring-white/60">
              <Clock3 className="h-4 w-4 text-indigo-500" />
              Same-day meetups on campus
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-xl">
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-indigo-50 ring-1 ring-indigo-50">
              <p className="text-sm font-semibold text-indigo-600">4.8 / 5 satisfaction</p>
              <p className="mt-2 text-lg font-bold text-slate-900">Trusted by students</p>
              <p className="text-sm text-slate-500">Verified campus accounts and safe handoffs.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 p-4 text-white shadow-lg shadow-blue-200">
              <p className="text-sm font-semibold opacity-90">Smart assistant</p>
              <p className="mt-2 text-lg font-bold">Ask for deals</p>
              <p className="text-sm opacity-90">Chat to find books, gadgets, or roommates quickly.</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="relative h-full"
        >
          <div className="absolute -left-6 -top-10 h-24 w-24 rounded-full bg-indigo-100/80 blur-2xl" />
          <div className="absolute -right-8 bottom-4 h-24 w-24 rounded-full bg-blue-100/70 blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-2xl shadow-indigo-100 ring-1 ring-white/60 backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">Live</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">Marketplace pulse</h3>
                <p className="text-sm text-slate-500">Trending listings across your campus</p>
              </div>
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                Safe & verified
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 p-4 text-white shadow-md shadow-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Top pick</p>
                    <p className="text-xl font-semibold">Noise-canceling headphones</p>
                    <p className="mt-1 text-sm opacity-90">Meet at Library Hub</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-indigo-50 ring-1 ring-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Smart pickup</p>
                    <p className="mt-1 text-sm text-slate-500">ETA • Today, 4:30 PM</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500" />
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-indigo-50 ring-1 ring-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-md shadow-blue-200">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Need something specific?</p>
                    <p className="text-xs text-slate-500">Ask our assistant for quick matches.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-white/90 to-indigo-50/90 p-4 shadow-sm shadow-indigo-100 ring-1 ring-indigo-50">
                <p className="text-sm font-semibold text-slate-800">Instant checkout</p>
                <p className="mt-1 text-xs text-slate-500">Tap to add to cart, schedule pickup, and message the seller.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">Built for students</p>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Everything you need on campus</h2>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm shadow-indigo-50 transition hover:border-indigo-200 hover:text-indigo-800"
          >
            Browse all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <MotionLink
              to={feature.href}
              key={feature.title}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl bg-white/80 p-5 shadow-sm shadow-indigo-50 ring-1 ring-indigo-50"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition duration-300 group-hover:opacity-80`} />
              <div className="relative flex h-full flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
                <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </MotionLink>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
