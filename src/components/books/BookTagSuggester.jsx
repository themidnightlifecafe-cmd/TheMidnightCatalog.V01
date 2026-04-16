import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ALL_TAGS = [
  'fast-paced', 'slow-burn', 'character-driven', 'plot-driven',
  'thought-provoking', 'light read', 'dark themes', 'emotional',
  'funny', 'suspenseful', 'romantic', 'action-packed',
  'philosophical', 'inspirational', 'coming-of-age', 'atmospheric',
];

const TAG_COLORS = {
  'fast-paced': 'bg-orange-100 text-orange-700 border-orange-200',
  'slow-burn': 'bg-amber-100 text-amber-700 border-amber-200',
  'character-driven': 'bg-blue-100 text-blue-700 border-blue-200',
  'plot-driven': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'thought-provoking': 'bg-purple-100 text-purple-700 border-purple-200',
  'light read': 'bg-green-100 text-green-700 border-green-200',
  'dark themes': 'bg-slate-100 text-slate-700 border-slate-200',
  'emotional': 'bg-pink-100 text-pink-700 border-pink-200',
  'funny': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'suspenseful': 'bg-red-100 text-red-700 border-red-200',
  'romantic': 'bg-rose-100 text-rose-700 border-rose-200',
  'action-packed': 'bg-orange-100 text-orange-700 border-orange-200',
  'philosophical': 'bg-violet-100 text-violet-700 border-violet-200',
  'inspirational': 'bg-teal-100 text-teal-700 border-teal-200',
  'coming-of-age': 'bg-lime-100 text-lime-700 border-lime-200',
  'atmospheric': 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

export function TagBadge({ tag, onRemove, className }) {
  const color = TAG_COLORS[tag] || 'bg-muted text-muted-foreground border-border';
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border', color, className)}>
      {tag}
      {onRemove && (
        <button onClick={() => onRemove(tag)} className="hover:opacity-60 transition-opacity ml-0.5">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}

export default function BookTagSuggester({ book, currentTags = [], onTagsChange }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    setSuggestions([]);
    const prompt = `You are a book tagging assistant. Based on the following book info, suggest 4-6 tags that best describe the reading experience.
Title: "${book.title}"
Author: "${book.author}"
Genre: "${book.genre || 'unknown'}"
Notes: "${book.notes || ''}"

Choose ONLY from this list: ${ALL_TAGS.join(', ')}

Return a JSON object: { "tags": ["tag1", "tag2", ...] }`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: { tags: { type: 'array', items: { type: 'string' } } },
      },
    });
    const suggested = (result.tags || []).filter(t => ALL_TAGS.includes(t) && !currentTags.includes(t));
    setSuggestions(suggested);
    setLoading(false);
  };

  const addTag = (tag) => {
    if (!currentTags.includes(tag)) {
      onTagsChange([...currentTags, tag]);
      setSuggestions(s => s.filter(t => t !== tag));
    }
  };

  const removeTag = (tag) => onTagsChange(currentTags.filter(t => t !== tag));

  const manualOptions = ALL_TAGS.filter(t => !currentTags.includes(t) && !suggestions.includes(t));

  return (
    <div className="space-y-3">
      {/* Current tags */}
      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {currentTags.map(t => <TagBadge key={t} tag={t} onRemove={removeTag} />)}
        </div>
      )}

      {/* AI suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> AI suggestions — tap to add
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(t => (
              <button key={t} onClick={() => addTag(t)}>
                <TagBadge tag={t} className="cursor-pointer hover:opacity-80 pr-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual picker */}
      {showAll && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Add manually</p>
          <div className="flex flex-wrap gap-1.5">
            {manualOptions.map(t => (
              <button key={t} onClick={() => addTag(t)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-2.5 h-2.5" /> {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleSuggest} disabled={loading} className="gap-1.5 h-7 text-xs">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
          {loading ? 'Analyzing…' : 'Suggest Tags'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowAll(v => !v)} className="h-7 text-xs text-muted-foreground">
          {showAll ? 'Hide all' : 'Browse all tags'}
        </Button>
      </div>
    </div>
  );
}