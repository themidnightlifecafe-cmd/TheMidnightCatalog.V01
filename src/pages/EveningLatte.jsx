import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ExternalLink, Search, Coffee, Star, Plus, Minus, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURED_BOOKS = [
  {
    id: 1,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    price: 14.99,
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop',
    badge: 'Bestseller',
    rating: 4.8,
  },
  {
    id: 2,
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    price: 16.99,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop',
    badge: 'Hot Pick',
    rating: 4.9,
  },
  {
    id: 3,
    title: 'Babel',
    author: 'R.F. Kuang',
    price: 13.99,
    cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&h=450&fit=crop',
    badge: 'Staff Pick',
    rating: 4.7,
  },
  {
    id: 4,
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    price: 15.99,
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
    badge: null,
    rating: 4.6,
  },
  {
    id: 5,
    title: 'A Court of Thorns and Roses',
    author: 'Sarah J. Maas',
    price: 12.99,
    cover: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=300&h=450&fit=crop',
    badge: 'Popular',
    rating: 4.7,
  },
  {
    id: 6,
    title: 'The Atlas Six',
    author: 'Olivie Blake',
    price: 14.49,
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop',
    badge: null,
    rating: 4.5,
  },
];

export default function EveningLatte() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = FEATURED_BOOKS.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (book) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === book.id);
      if (existing) return prev.map(i => i.id === book.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...book, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = () => {
    window.open('https://www.theeveninglatte.com', '_blank');
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Coffee className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">The Evening Latte</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Order books directly from our partner bookshop</p>
            <a
              href="https://www.theeveninglatte.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1"
            >
              Visit website <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <Button
          onClick={() => setCartOpen(o => !o)}
          className="gap-2 relative"
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Cart Panel */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-lg">Your Cart</h2>
                <button onClick={() => setCartOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.cover} alt={item.title} className="w-10 h-14 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-heading font-bold text-xl">${total.toFixed(2)}</p>
                    </div>
                    <Button onClick={handleCheckout} className="gap-2">
                      Checkout on Evening Latte <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search books..."
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
              {book.badge && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[9px] font-bold">
                  {book.badge}
                </span>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-heading text-xs font-bold leading-tight line-clamp-2">{book.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{book.author}</p>
              <div className="flex items-center gap-0.5 mt-1">
                <Star className="w-3 h-3 fill-accent text-accent" />
                <span className="text-[10px] text-muted-foreground">{book.rating}</span>
              </div>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-accent">${book.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(book)}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visit Full Store CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/20 p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-heading font-bold text-lg">Browse the full collection</h3>
          <p className="text-sm text-muted-foreground mt-1">Thousands more titles available on The Evening Latte website</p>
        </div>
        <Button onClick={() => window.open('https://www.theeveninglatte.com', '_blank')} className="gap-2">
          Visit The Evening Latte <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}