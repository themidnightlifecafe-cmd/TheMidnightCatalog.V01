import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Sparkles } from 'lucide-react';
import RecommendationEngine from '@/components/recommendations/RecommendationEngine';

export default function Recommendations() {
  const { user } = useAuth();

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-updated_date'),
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-chart-4" /> For You
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered picks based on your reading taste
        </p>
      </div>

      <RecommendationEngine books={books} booksLoading={booksLoading} user={user} />
    </div>
  );
}