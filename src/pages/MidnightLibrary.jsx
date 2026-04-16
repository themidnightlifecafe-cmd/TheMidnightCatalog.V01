import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Clock, CheckCircle2, Library, RotateCcw, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';

const LIBRARY_BOOKS = [
  {
    id: 'ml-1',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    genre: 'Fantasy',
    cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&h=450&fit=crop',
    available: true,
    copies: 3,
  },
  {
    id: 'ml-2',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    genre: 'Mystery',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop',
    available: true,
    copies: 2,
  },
  {
    id: 'ml-3',
    title: 'The House in the Cerulean Sea',
    author: 'TJ Klune',
    genre: 'Fantasy',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop',
    available: false,
    copies: 0,
  },
  {
    id: 'ml-4',
    title: 'Mexican Gothic',
    author: 'Silvia Moreno-Garcia',
    genre: 'Horror',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
    available: true,
    copies: 1,
  },
  {
    id: 'ml-5',
    title: 'The Bear and the Nightingale',
    author: 'Katherine Arden',
    genre: 'Fantasy',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop',
    available: true,
    copies: 2,
  },
  {
    id: 'ml-6',
    title: 'Ninth House',
    author: 'Leigh Bardugo',
    genre: 'Dark Fantasy',
    cover: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=300&h=450&fit=crop',
    available: false,
    copies: 0,
  },
];

export default function MidnightLibrary() {
  const [search, setSearch] = useState('');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [confirmBook, setConfirmBook] = useState(null);

  const filtered = LIBRARY_BOOKS.filter(b =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.genre.toLowerCase().includes(search.toLowerCase())
  );

  const isBorrowed = (id) => borrowedBooks.some(b => b.id === id);

  const handleBorrow = (book) => {
    setConfirmBook(book);
  };

  const confirmBorrow = () => {
    if (!confirmBook) return;
    const dueDate = addDays(new Date(), 14);
    setBorrowedBooks(prev => [...prev, { ...confirmBook, dueDate, borrowedDate: new Date() }]);
    setConfirmBook(null);
  };

  const handleReturn = (id) => {
    setBorrowedBooks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Library className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">The Midnight Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Borrow books — 14-day lending period, free of charge</p>
        </div>
      </div>

      {/* Currently Borrowed */}
      {borrowedBooks.length > 0 && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
          <h2 className="font-heading font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Currently Borrowed
          </h2>
          <div className="space-y-3">
            {borrowedBooks.map(book => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
              >
                <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                  <p className="text-xs text-accent mt-0.5 font-medium">
                    Due: {format(book.dueDate, 'MMM d, yyyy')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReturn(book.id)}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="w-3 h-3" /> Return
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or genre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-[2/3] bg-muted">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold ${book.available ? 'bg-green-500/90 text-white' : 'bg-muted-foreground/70 text-white'}`}>
                {book.available ? `${book.copies} available` : 'Checked out'}
              </div>
              {isBorrowed(book.id) && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-heading text-xs font-bold leading-tight line-clamp-2">{book.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{book.author}</p>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 mt-1 w-fit">{book.genre}</Badge>
              <div className="mt-auto pt-2">
                {isBorrowed(book.id) ? (
                  <p className="text-[10px] text-primary font-semibold text-center">Borrowed ✓</p>
                ) : (
                  <Button
                    size="sm"
                    className="w-full text-xs h-7"
                    disabled={!book.available}
                    onClick={() => handleBorrow(book)}
                  >
                    {book.available ? 'Borrow' : 'Unavailable'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirm Borrow Modal */}
      <AnimatePresence>
        {confirmBook && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmBook(null)} />
            <motion.div
              className="relative z-10 bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl space-y-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex gap-4 items-start">
                <img src={confirmBook.cover} alt={confirmBook.title} className="w-16 h-24 object-cover rounded-xl" />
                <div>
                  <h3 className="font-heading font-bold text-base">{confirmBook.title}</h3>
                  <p className="text-sm text-muted-foreground">{confirmBook.author}</p>
                  <div className="mt-3 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> 14-day lending period</p>
                    <p className="flex items-center gap-1 mt-1"><User className="w-3 h-3" /> Pick up in-store or request delivery</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmBook(null)}>Cancel</Button>
                <Button className="flex-1" onClick={confirmBorrow}>Confirm Borrow</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <div className="rounded-2xl bg-muted/40 border border-border p-5">
        <h3 className="font-heading font-bold mb-2">How It Works</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex gap-2 items-start">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <p>Browse and select a book you'd like to borrow from The Midnight Library collection.</p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <p>Pick it up in-store or arrange delivery. Your 14-day lending period begins immediately.</p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <p>Return the book before the due date and it'll automatically be available for others.</p>
          </div>
        </div>
      </div>
    </div>
  );
}