import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react';

const features = [
  {
    title: 'Browse Marketplace',
    description: 'Find textbooks, tech, and essentials from verified students on campus.',
    icon: ShoppingBag,
    href: '/marketplace',
  },
  {
    title: 'Safe Meetups',
    description: 'Schedule pickups on campus with live tracking and secure handoffs.',
    icon: MapPin,
    href: '/profile',
  },
  {
    title: 'Chat Assistant',
    description: 'Get instant help finding deals or connecting with the right sellers.',
    icon: MessageCircle,
    href: '/chatbot',
  },
];

function Home() {
  return (
    <div className="relative z-10 space-y-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl space-y-8 text-center"
      >
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Shop smart. Sell fast.
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Stay on campus.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 sm:text-xl">
            The easiest way to buy and sell with students you trust. Safe meetups, verified accounts, and campus-only deals.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:translate-y-[-2px] hover:shadow-xl"
          >
            Explore Marketplace
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-500 bg-white px-6 py-3 text-base font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Start Selling
          </Link>
        </div>

        {/* Quick Stats */}
        {/* <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">500+</p>
            <p className="text-sm text-slate-600">Active Listings</p>
          </div>
          <div className="h-12 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">1,200+</p>
            <p className="text-sm text-slate-600">Students</p>
          </div>
          <div className="h-12 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">4.8/5</p>
            <p className="text-sm text-slate-600">Satisfaction</p>
          </div>
        </div> */}
      </motion.section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Everything you need</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                to={feature.href}
                className="group block h-full rounded-2xl bg-white/80 p-6 shadow-sm shadow-blue-50 ring-1 ring-blue-50 transition hover:shadow-lg hover:ring-blue-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-200">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition group-hover:gap-3">
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
