import { Link } from 'react-router-dom';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export default function BibleIndex() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">Scripture Library</h1>
        <p className="mt-4 text-lg text-neutral-600">Explore the Word of God book by book.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {BIBLE_BOOKS.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.01 }}
          >
            <Link 
              to={`/bible/${book.id}`}
              className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50/30"
            >
              <div>
                <h3 className="text-lg font-bold group-hover:text-emerald-700">{book.name}</h3>
                <p className="text-sm text-neutral-500">{book.chapters} Chapters</p>
              </div>
              <ChevronRight className="text-neutral-300 transition-colors group-hover:text-emerald-500" size={20} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
