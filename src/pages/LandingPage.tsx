import { motion } from 'motion/react';
import { BookOpen, Download, Heart, Smartphone, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDownloadLink } from '../lib/os';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
              Renew Your Mind.<br />
              <span className="text-emerald-600">Rooted in Truth.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 md:text-xl">
              Experience Scripture with natural audio narration, AI-guided reflections, and spiritual habit tracking. Designed for your daily walk.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <a 
                href={getDownloadLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl bg-neutral-900 px-8 py-4 text-white shadow-xl hover:bg-neutral-800 transition-all active:scale-95"
              >
                <Download size={20} />
                <span>Download App</span>
              </a>
              <Link to="/bible" className="flex items-center space-x-2 rounded-xl border border-neutral-200 bg-white px-8 py-4 text-neutral-900 shadow-sm hover:bg-neutral-50 transition-all active:scale-95">
                <BookOpen size={20} />
                <span>Read Bible</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-3">
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold">AI Reflections</h3>
              <p className="mt-2 text-neutral-600">Get personalized insights and reflections based on your daily scripture reading to deepen your understanding.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold">Habit Tracking</h3>
              <p className="mt-2 text-neutral-600">Build spiritual disciplines with integrated tracking for prayer, meditation, and scripture memory.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold">Audio Bible</h3>
              <p className="mt-2 text-neutral-600">Listen to God's word with high-quality, expressive narrations that bring the Bible to life on the go.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
