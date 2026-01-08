'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [docs, setDocs] = useState<string[]>([]);
  const router = useRouter();
  const [user, setUser] = useState('');

  useEffect(() => {
    // 1. Auth Check
    const storedUser = localStorage.getItem('username');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(storedUser);

    // 2. Fetch Docs
    fetch('http://localhost:8080/documents')
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error('Failed to load docs', err));
  }, []); // Empty dependency array

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
          <span className="text-gray-600">Welcome, <b>{user}</b></span>
        </header>

        {/* List View */}
        <div className="grid gap-4">
          {docs.map((docId) => (
            <Link
              key={docId}
              href={`/doc/${docId}`}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-blue-600">
                  📄
                </div>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{docId.replace('-', ' ')}</p>
                  <p className="text-sm text-gray-500">Last edited just now</p>
                </div>
              </div>
              <span className="text-blue-600 text-sm font-medium">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}