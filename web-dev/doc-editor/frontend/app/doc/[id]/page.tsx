'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params in Next.js 15+
  const resolvedParams = use(params);
  const docID = resolvedParams.id;
  
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Connecting...');
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();

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

    socket.onopen = () => setStatus('Saved');
    socket.onclose = () => setStatus('Disconnected');

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

  // 4. Handle Typing (Read-Your-Writes)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    
    // Immediate local update (Read-Your-Writes)
    setContent(newContent);
    setStatus('Saving...');

    // Send to Backend
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ content: newContent }));
      // Artificial delay to show "Saving..." state briefly
      setTimeout(() => setStatus('Saved'), 500);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FBFD]">
      {/* Toolbar / Header */}
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-blue-600">
            ← Back
          </button>
          <h1 className="text-lg font-medium text-gray-800 capitalize">
            {docID.replace('-', ' ')}
          </h1>
          <span className="text-xs text-gray-400 px-2 py-1 rounded bg-gray-100">
            {status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            YOU
          </div>
        </div>
      </nav>

      {/* The "Paper" Editor */}
      <main className="flex-1 overflow-y-auto py-8">
        <div className="mx-auto min-h-[1100px] w-[850px] bg-white shadow-lg border border-gray-200 p-12 sm:w-[90%] md:w-[800px] lg:w-[850px]">
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Start typing your document..."
            className="h-full w-full resize-none border-none bg-transparent text-base leading-relaxed text-gray-800 outline-none placeholder:text-gray-300 font-serif"
            spellCheck={false}
          />
        </div>
      </main>
    </div>
  );
}