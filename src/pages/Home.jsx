import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookOpen, ArrowRight, Sparkles, Users, MapPin, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import BookCard from '@/components/books/BookCard';

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState('');

  const { data: currentlyReading = [] } = useQuery({
    queryKey: ['books', 'reading'],
    queryFn: () => base44.entities.Book.filter({ status: 'reading' }, '-updated_date', 4),
  });

  const { data: recentUpdates = [] } = useQuery({
    queryKey: ['social-updates-home'],
    queryFn: () => base44.entities.SocialUpdate.list('-created_date', 3),
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-8 md:p-12 overflow-hidden"
      >
        <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-10">
          <BookOpen className="w-32 h-32 md:w-48 md:h-48 text-primary" />
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Your cozy<br />reading corner
          </h1>
          <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">
            Track your books, share your reads with friends, and discover local bookstores. Your literary journey starts here.
          </p>

          {/* Website Connector */}
          <div className="mt-6 p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Connect Your Website</p>
            <div className="flex gap-2">
              <Input
                placeholder="https://your-website.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" className="gap-1.5">
                <ExternalLink className="w-4 h-4" />
                Connect
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { icon: BookOpen, label: 'Currently Reading', value: currentlyReading.length, color: 'text-primary bg-primary/10' },
          { icon: TrendingUp, label: 'Books This Year', value: '12', color: 'text-secondary bg-secondary/10' },
          { icon: Users, label: 'Friends Reading', value: '8', color: 'text-accent bg-accent/10' },
          { icon: MapPin, label: 'Nearby Stores', value: '5', color: 'text-chart-5 bg-chart-5/10' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-card border border-border">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color.split(' ')[1]}`}>
              <stat.icon className={`w-4 h-4 ${stat.color.split(' ')[0]}`} />
            </div>
            <p className="text-2xl font-heading font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.section>

      {/* Currently Reading */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold">Currently Reading</h2>
          <Link to="/library" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {currentlyReading.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentlyReading.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 rounded-2xl border border-dashed border-border bg-muted/30">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mt-3">No books being read right now</p>
            <Link to="/library">
              <Button size="sm" variant="outline" className="mt-3">Add a book</Button>
            </Link>
          </div>
        )}
      </motion.section>

      {/* Recent Friend Activity */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-chart-4" />
            Friend Activity
          </h2>
          <Link to="/social" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentUpdates.length > 0 ? (
          <div className="space-y-3">
            {recentUpdates.map((update) => (
              <div key={update.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {(update.user_name || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{update.user_name || 'Someone'}</span>
                    <span className="text-muted-foreground"> {update.update_type === 'started' ? 'started' : update.update_type === 'finished' ? 'finished' : 'is reading'} </span>
                    <span className="font-medium font-heading">{update.book_title}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 rounded-2xl border border-dashed border-border bg-muted/30">
            <Users className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mt-3">No friend activity yet</p>
            <Link to="/social">
              <Button size="sm" variant="outline" className="mt-3">Share an update</Button>
            </Link>
          </div>
        )}
      </motion.section>
    </div>
  );
}