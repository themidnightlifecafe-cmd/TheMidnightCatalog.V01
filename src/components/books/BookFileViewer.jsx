import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, X, ExternalLink, Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BookFileViewer({ book }) {
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const updateFileMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.update(book.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'epub'].includes(ext)) {
      alert('Only PDF and EPUB files are supported.');
      return;
    }

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await updateFileMutation.mutateAsync({
      file_url,
      file_name: file.name,
      file_type: ext,
    });
    setUploading(false);
    e.target.value = '';
  };

  const handleRemove = async () => {
    if (!confirm('Remove attached file?')) return;
    await updateFileMutation.mutateAsync({ file_url: null, file_name: null, file_type: null });
    setViewerOpen(false);
  };

  // No file attached yet
  if (!book.file_url) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.epub"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="w-4 h-4" /> Attach PDF or EPUB</>
          )}
        </button>
      </div>
    );
  }

  // File is attached
  return (
    <div className="space-y-3">
      {/* File info row */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{book.file_name || 'Attached file'}</p>
          <p className="text-xs text-muted-foreground uppercase">{book.file_type}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => window.open(book.file_url, '_blank')}
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={handleRemove}
            title="Remove file"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Toggle embedded viewer (PDF only) */}
      {book.file_type === 'pdf' && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setViewerOpen(v => !v)}
          >
            <BookOpen className="w-4 h-4" />
            {viewerOpen ? 'Close Reader' : 'Read in App'}
          </Button>

          {viewerOpen && (
            <div className="rounded-xl overflow-hidden border border-border shadow-md">
              <iframe
                src={`${book.file_url}#toolbar=1&view=FitH`}
                title={book.file_name || 'PDF Viewer'}
                className="w-full"
                style={{ height: '70vh', minHeight: 400 }}
              />
            </div>
          )}
        </>
      )}

      {/* EPUB: can't embed, just offer external open */}
      {book.file_type === 'epub' && (
        <p className="text-xs text-muted-foreground text-center">
          EPUB files can be opened in an external reader via the link above.
        </p>
      )}
    </div>
  );
}