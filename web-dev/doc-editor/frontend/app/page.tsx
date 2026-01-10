'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, LogOut, Search, Clock, ChevronRight, Plus, Trash2, X } from 'lucide-react';

export default function Dashboard() {
  const [docs, setDocs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchDocuments = () => {
    fetch('http://localhost:8080/documents')
      .then((res) => res.json())
      .then((data) => {
        setDocs(data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load docs', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // 1. Auth Check
    const storedUser = localStorage.getItem('username');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(storedUser);

    // 2. Fetch Docs
    fetchDocuments();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    router.push('/login');
  };

  const handleCreateDocument = async () => {
    if (!newDocName.trim()) return;
    
    setIsCreating(true);
    try {
      const docId = newDocName.toLowerCase().replace(/\s+/g, '-');
      const response = await fetch('http://localhost:8080/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId }),
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setNewDocName('');
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to create document', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Delete "${docId.replace('-', ' ')}"?`)) return;
    
    try {
      const response = await fetch(`http://localhost:8080/documents/${docId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  const filteredDocs = docs.filter((docId) =>
    docId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <FileText className="h-4 w-4 text-black" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">DocEditor</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] px-3 py-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-medium text-black">
                  {user.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Search Bar and Create Button */}
        <div className="mb-8 flex items-center gap-4 animate-slide-in">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] py-3 pl-11 pr-4 text-sm transition-smooth placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-secondary)] focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 rounded-xl border border-[var(--border-primary)] bg-white px-4 py-3 text-sm font-medium text-black transition-all hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        </div>

        {/* Documents Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Your Documents
          </h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]"
                />
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] py-16 text-center">
              <FileText className="mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((docId, index) => (
                <Link
                  key={docId}
                  href={`/doc/${docId}`}
                  className="group block animate-slide-in rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 transition-smooth hover:border-[var(--border-secondary)] hover:bg-[var(--bg-hover)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-transform group-hover:scale-110">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium capitalize transition-colors group-hover:text-white">
                          {docId.replace(/-/g, ' ')}
                        </p>
                        <div className="mt-1 flex items-center space-x-1 text-xs text-[var(--text-tertiary)]">
                          <Clock className="h-3 w-3" />
                          <span>Last edited recently</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleDeleteDocument(docId, e)}
                        className="rounded-lg p-2 text-[var(--text-tertiary)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)] transition-all group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-md animate-slide-in rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Document</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Document Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isCreating) {
                      handleCreateDocument();
                    }
                  }}
                  placeholder="Enter document name"
                  className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm transition-smooth placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-secondary)] focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="flex-1 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDocument}
                  disabled={isCreating || !newDocName.trim()}
                  className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}