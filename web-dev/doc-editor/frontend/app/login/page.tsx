'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      // Simulate brief loading for smooth transition
      await new Promise(resolve => setTimeout(resolve, 400));
      localStorage.setItem('username', username);
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-md animate-slide-in">
        {/* Logo/Brand */}
        <div className="mb-8 flex items-center justify-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white transition-transform hover:scale-105">
            <FileText className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-semibold tracking-tight">DocEditor</span>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 shadow-2xl transition-smooth hover:border-[var(--border-secondary)]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Enter your name to continue to your workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Username
              </label>
              <input
                type="text"
                required
                autoFocus
                className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm transition-smooth placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-secondary)] focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="group relative w-full overflow-hidden rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition-all hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>{isLoading ? 'Signing in...' : 'Continue'}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
          A collaborative document editor
        </p>
      </div>
    </div>
  );
}