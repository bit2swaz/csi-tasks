'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, WifiOff, Users } from 'lucide-react';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const docID = resolvedParams.id;
  
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'connecting' | 'saved' | 'saving' | 'disconnected'>('connecting');
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 1. Auth Check
    const user = localStorage.getItem('username');
    if (!user) {
      router.push('/login');
      return;
    }

    // 2. Initialize WebSocket
    const socket = new WebSocket(`ws://localhost:8080/ws?docID=${docID}`);
    ws.current = socket;

    socket.onopen = () => setStatus('saved');
    socket.onclose = () => setStatus('disconnected');

    // 3. Handle Incoming Messages
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // 'init' sets the full doc on load
      // 'update' is a change from someone else
      if (data.type === 'init' || data.type === 'update') {
        setContent(data.content);
      }
    };

    return () => {
      socket.close();
    };
  }, [docID, router]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // 4. Handle Typing (Read-Your-Writes)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    
    // Immediate local update (Read-Your-Writes)
    setContent(newContent);
    setStatus('saving');

    // Send to Backend
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ content: newContent }));
      // Artificial delay to show "Saving..." state briefly
      setTimeout(() => setStatus('saved'), 300);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return { icon: Loader2, text: 'Connecting...', className: 'text-[var(--text-tertiary)]', animate: true };
      case 'saving':
        return { icon: Loader2, text: 'Saving...', className: 'text-[var(--text-secondary)]', animate: true };
      case 'saved':
        return { icon: CheckCircle2, text: 'Saved', className: 'text-[var(--success)]', animate: false };
      case 'disconnected':
        return { icon: WifiOff, text: 'Offline', className: 'text-red-400', animate: false };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      {/* Toolbar / Header */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/')} 
              className="group flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-[var(--border-primary)]" />
            <h1 className="text-sm font-medium capitalize">
              {docID.replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium ${statusConfig.className}`}>
              <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.animate ? 'animate-spin' : ''}`} />
              <span>{statusConfig.text}</span>
            </div>
            
            {/* Collaborators indicator */}
            <div className="flex items-center space-x-1 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] px-3 py-1.5">
              <Users className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">1</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Editor */}
      <main className="flex-1 overflow-y-auto py-8">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 transition-smooth hover:border-[var(--border-secondary)] md:p-12">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              placeholder="Start writing..."
              className="min-h-[calc(100vh-300px)] w-full resize-none border-none bg-transparent text-base leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>
      </main>
    </div>
  );
}