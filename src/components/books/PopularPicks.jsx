import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Check, Sparkles } from 'lucide-react';

const POPULAR_BOOKS = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    cover_url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg",
    total_pages: 304,
  },
  {
    title: "Lessons in Chemistry",
    author: "Bonnie Garmus",
    genre: "Fiction",
    cover_url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1634748496i/58065033.jpg",
    total_pages: 400,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    cover_url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
    total_pages: 320,
  },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    genre: "Fiction",
    cover_url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1636978687i/58784475.jpg",
    total_pages: 480,
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: "Fiction",
    cover_url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1664458703i/32620332.jpg",
    total_pages: 388,
  },
  {
    title: "Demon Copperhead",
    author: "Barbara Kingsolver",
    genre: "Literary Fiction",
    cover_url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1649077125i/60194162.jpg",
    total_pages: 560,
  },
];

export default function PopularPicks({ existingBooks = [] }) {
  const queryClient = useQueryClient();
  const [added, setAdded] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setAdded((prev) => ({ ...prev, [variables.title]: true }));
    },
  });

  const existingTitles = new Set(existingBooks.map((b) => b.title));

  const handleAdd = (book) => {
    createMutation.mutate({ ...book, status: 'want_to_read', current_page: 0 });
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-heading text-xl font-bold">Popular Picks</h2>
        <span className="text-xs bg-accent/15 text-accent font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Trending
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {POPULAR_BOOKS.map((book) => {
          const isAlreadyAdded = existingTitles.has(book.title) || added[book.title];
          return (
            <div
              key={book.title}
              className="snap-start flex-shrink-0 w-36 rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              {/* Cover */}
              <div className="aspect-[2/3] bg-muted overflow-hidden">
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="font-heading text-xs font-bold leading-tight line-clamp-2">{book.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{book.author}</p>
                <span className="inline-block text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full mt-1">{book.genre}</span>

                <button
                  onClick={() => !isAlreadyAdded && handleAdd(book)}
                  disabled={isAlreadyAdded || createMutation.isPending}
                  className={`mt-2 w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-lg transition-all ${
                    isAlreadyAdded
                      ? 'bg-secondary/20 text-secondary cursor-default'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {isAlreadyAdded ? (
                    <><Check className="w-3 h-3" /> In Library</>
                  ) : (
                    <><Plus className="w-3 h-3" /> Add to Library</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}