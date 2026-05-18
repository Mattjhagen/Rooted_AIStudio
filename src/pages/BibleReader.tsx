import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { BIBLE_BOOKS, BibleBook } from '../data/bibleMetadata';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, BookOpen, Zap, Loader2, Settings2 } from 'lucide-react';
import ReadingSettingsMenu, { BackgroundTheme, FontFamily } from '../components/ReadingSettingsMenu';
import VerseActionMenu from '../components/VerseActionMenu';
import NoteModal from '../components/NoteModal';
import ShareToGroupModal from '../components/ShareToGroupModal';
import { useFirebase } from '../context/FirebaseContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BibleVerse {
  chapter: number;
  verse: number;
  text: string;
}

interface BibleChapterResponse {
  reference: string;
  verses: BibleVerse[];
  text: string;
}

interface AIInsights {
  context: string;
  takeaways: string[];
  application: string;
}

interface ReadingSettings {
  theme: BackgroundTheme;
  fontFamily: FontFamily;
  fontSize: number;
}

const DEFAULT_SETTINGS: ReadingSettings = {
  theme: 'white',
  fontFamily: 'serif',
  fontSize: 18,
};

export default function BibleReader() {
  const { bookId, chapter } = useParams();
  const navigate = useNavigate();
  const readerRef = useRef<HTMLDivElement>(null);
  const { user } = useFirebase();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const [book, setBook] = useState<BibleBook | null>(null);
  const [chapterData, setChapterData] = useState<BibleChapterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Reading Settings
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    const saved = localStorage.getItem('readingSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Selection
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<Record<number, { id?: string, color: string }>>({});
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isShareToGroupOpen, setIsShareToGroupOpen] = useState(false);

  // Load Highlights from Firestore
  useEffect(() => {
    if (!user || !bookId || !chapter) {
      // Clear highlights if logged out (or use local storage as fallback if desired)
      setHighlights({});
      return;
    }

    const q = query(
      collection(db, 'highlights'),
      where('userId', '==', user.uid),
      where('bookId', '==', bookId),
      where('chapter', '==', parseInt(chapter))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hMap: Record<number, { id: string, color: string }> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.verseNumbers.forEach((v: number) => {
          hMap[v] = { id: doc.id, color: data.color };
        });
      });
      setHighlights(hMap);
    });

    return () => unsubscribe();
  }, [user, bookId, chapter]);

  useEffect(() => {
    localStorage.setItem('readingSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const foundBook = BIBLE_BOOKS.find(b => b.id === bookId);
    setBook(foundBook || null);

    if (foundBook && chapter) {
      fetchChapter(foundBook.name, chapter);
    } else {
      setChapterData(null);
      setInsights(null);
    }
    // Reset selection on chapter change
    setSelectedVerses([]);
  }, [bookId, chapter]);

  const fetchChapter = async (bookName: string, chapterNum: string) => {
    setLoading(true);
    setInsights(null);
    try {
      const res = await fetch(`https://bible-api.com/${bookName}+${chapterNum}`);
      const data = await res.json();
      setChapterData(data);
    } catch (err) {
      console.error("Fetch Bible Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAIInsights = async (specificVerses?: number[]) => {
    if (!chapterData || !book) return;
    setLoadingInsights(true);
    
    const targetVerses = specificVerses || [];
    const textToAnalyze = targetVerses.length > 0 
      ? chapterData.verses.filter(v => targetVerses.includes(v.verse)).map(v => v.text).join(' ')
      : chapterData.text;

    try {
      const res = await fetch('/api/bible/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: book.name,
          chapter: chapter,
          verses: targetVerses,
          text: textToAnalyze
        })
      });
      const data = await res.json();
      setInsights(data);
      if (specificVerses) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    } catch (err) {
      console.error("AI Insights Error:", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev => 
      prev.includes(verseNum) 
        ? prev.filter(v => v !== verseNum) 
        : [...prev, verseNum].sort((a, b) => a - b)
    );
  };

  const handleHighlight = async (color: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      // For simplicity, we create one document per highlight action.
      // If color is transparent, we find existing docs and delete them.
      if (color === 'transparent') {
        const toDeleteIds = new Set<string>();
        selectedVerses.forEach(v => {
          if (highlights[v]?.id) toDeleteIds.add(highlights[v].id!);
        });
        
        for (const id of Array.from(toDeleteIds)) {
          await deleteDoc(doc(db, 'highlights', id));
        }
      } else {
        await addDoc(collection(db, 'highlights'), {
          userId: user.uid,
          bookId,
          chapter: parseInt(chapter!),
          verseNumbers: selectedVerses,
          color,
          createdAt: new Date().toISOString()
        });
      }
      setSelectedVerses([]);
    } catch (err) {
      console.error("Highlight error:", err);
    }
  };

  const handleSaveNote = async (text: string, isPublic: boolean) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'notes'), {
        userId: user.uid,
        userName: user.displayName || 'Rooted Explorer',
        bookId,
        chapter: parseInt(chapter!),
        verseNumbers: selectedVerses,
        text,
        isPublic,
        createdAt: new Date().toISOString()
      });
      setSelectedVerses([]);
    } catch (err) {
      console.error("Save note error:", err);
    }
  };

  const handleShare = () => {
    const verseText = chapterData?.verses
      .filter(v => selectedVerses.includes(v.verse))
      .map(v => `${v.verse}: ${v.text}`)
      .join('\n');
    
    const shareText = `"${verseText}"\n\n— ${book?.name} ${chapter} (WEB Translation)\nRead more: https://rootedapp.space/bible/${bookId}/${chapter}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Rooted Daily - ${book?.name} ${chapter}`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  const handleShareToGroup = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsShareToGroupOpen(true);
  };

  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'tan': return 'bg-[#f4ecd8] text-[#5b4636] min-h-screen transition-colors duration-300';
      case 'black': return 'bg-neutral-900 text-neutral-100 min-h-screen transition-colors duration-300';
      default: return 'bg-white text-neutral-900 min-h-screen transition-colors duration-300';
    }
  };

  const getFontClass = () => {
    switch (settings.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'display': return 'font-display';
      default: return 'font-sans';
    }
  };

  const getHighlightClass = (color: string) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-200/60 dark:bg-yellow-500/30';
      case 'green': return 'bg-green-200/60 dark:bg-green-500/30';
      case 'blue': return 'bg-blue-200/60 dark:bg-blue-500/30';
      case 'pink': return 'bg-pink-200/60 dark:bg-pink-500/30';
      case 'purple': return 'bg-purple-200/60 dark:bg-purple-500/30';
      default: return '';
    }
  };

  if (!book) {
    return <div className="p-20 text-center">Book not found</div>;
  }

  // If no chapter selected, show chapter index for that book
  if (!chapter) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
        <Link to="/bible" className="mb-8 flex items-center text-sm font-medium text-neutral-500 hover:text-emerald-600 transition-colors">
          <ChevronLeft size={16} />
          <span>Back to Library</span>
        </Link>
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">{book.name}</h1>
          <p className="mt-4 text-lg text-neutral-600">Select a chapter to start reading.</p>
        </header>

        <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((num) => (
            <Link
              key={num}
              to={`/bible/${book.id}/${num}`}
              className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm font-medium transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {num}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={getThemeClasses()}
      onClick={(e) => {
        // Only toggle settings if clicking "white space" (not a verse or menu)
        if (e.target === e.currentTarget || (readerRef.current && !readerRef.current.contains(e.target as Node))) {
          setIsSettingsOpen(!isSettingsOpen);
        }
      }}
    >
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to={`/bible/${book.id}`}
            className="flex items-center text-sm font-medium opacity-60 hover:opacity-100 hover:text-emerald-600 transition-all"
          >
            <ChevronLeft size={16} />
            <span>{book.name} Chapters</span>
          </Link>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-full p-2 hover:bg-black/5 transition-colors"
              title="Reading Settings"
            >
              <Settings2 size={20} />
            </button>
            <div className="h-4 w-px bg-current opacity-10 mx-2" />
            {parseInt(chapter) > 1 && (
              <button 
                onClick={() => navigate(`/bible/${book.id}/${parseInt(chapter) - 1}`)}
                className="rounded-full p-2 hover:bg-black/5 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {parseInt(chapter) < book.chapters && (
              <button 
                onClick={() => navigate(`/bible/${book.id}/${parseInt(chapter) + 1}`)}
                className="rounded-full p-2 hover:bg-black/5 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
            <p className="mt-4 opacity-60">Opening Scripture...</p>
          </div>
        ) : (
          <div ref={readerRef}>
            <motion.article 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`max-w-none ${getFontClass()}`}
              style={{ fontSize: `${settings.fontSize}px` }}
            >
              <h2 className="mb-12 text-4xl font-bold tracking-tight text-center md:text-5xl">
                {book.name} {chapter}
              </h2>
              
              <div className="space-y-6 leading-relaxed">
                {chapterData?.verses.map((v) => (
                  <span 
                    key={v.verse} 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVerseSelection(v.verse);
                    }}
                    className={`inline-block mr-1.5 px-0.5 rounded transition-all cursor-pointer select-none
                      ${selectedVerses.includes(v.verse) ? 'ring-2 ring-emerald-500 bg-emerald-500/10' : ''}
                      ${highlights[v.verse] ? getHighlightClass(highlights[v.verse].color) : ''}
                      hover:bg-black/5
                    `}
                  >
                    <sup className="text-[0.6em] font-bold text-emerald-600 mr-1 opacity-80 select-none">
                      {v.verse}
                    </sup>
                    {v.text}
                  </span>
                ))}
              </div>

              <div className="mt-20 rounded-3xl border border-current/10 bg-current/5 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">AI Deep Dive</h3>
                      <p className="text-xs opacity-60 font-medium uppercase tracking-wider">Gemini 1.5 Flash</p>
                    </div>
                  </div>
                  {!insights && !loadingInsights && (
                    <button 
                      onClick={() => getAIInsights()}
                      className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95"
                    >
                      Generate Insights
                    </button>
                  )}
                </div>

                {loadingInsights && (
                  <div className="flex items-center space-x-3 text-emerald-600 py-4">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-bold tracking-tight italic">Reflecting on the Word of God...</span>
                  </div>
                )}

                <AnimatePresence>
                  {insights && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Contextual Overview</h4>
                        <p className="leading-relaxed opacity-90">{insights.context}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-3">Spiritual Essentials</h4>
                        <ul className="space-y-3">
                          {insights.takeaways.map((item, i) => (
                            <li key={i} className="flex items-start space-x-3">
                              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                              <span className="opacity-90">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-6 border border-current/10 shadow-inner">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Daily Life Application</h4>
                        <p className="italic opacity-90 font-medium">"{insights.application}"</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
          </div>
        )}
      </div>

      <ReadingSettingsMenu 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={setSettings}
      />

      <VerseActionMenu 
        selectedVerses={selectedVerses}
        onClose={() => setSelectedVerses([])}
        onHighlight={handleHighlight}
        onAddNote={() => {
          if (!user) {
            setIsAuthOpen(true);
          } else {
            setIsNoteModalOpen(true);
          }
        }}
        onShareToGroup={handleShareToGroup}
        onShare={handleShare}
        onAskAI={() => getAIInsights(selectedVerses)}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        selectedVerses={selectedVerses}
      />

      <ShareToGroupModal
        isOpen={isShareToGroupOpen}
        onClose={() => setIsShareToGroupOpen(false)}
        selectedVerses={selectedVerses}
        verseText={chapterData?.verses.filter(v => selectedVerses.includes(v.verse)).map(v => v.text).join(' ') || ''}
        bookName={book?.name || ''}
        chapter={chapter || ''}
        insightText={insights?.application}
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </div>
  );
}
