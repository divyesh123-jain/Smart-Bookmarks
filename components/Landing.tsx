'use client'

import Link from 'next/link'

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden relative">
      <div className="absolute inset-0 grid grid-cols-8 gap-px opacity-[0.03]" aria-hidden>
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-sm animate-pulse-soft"
            style={{ animationDelay: `${i * 0.02}s` }}
          />
        ))}
      </div>

      <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-white/5 rounded-full animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 border border-white/5 rounded-full animate-float" style={{ animationDelay: '1s' }} />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-white/50 text-sm tracking-[0.3em] uppercase mb-6 animate-fade-in-up stagger-1">
          Save what matters
        </p>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-6 animate-fade-in-up stagger-2 max-w-3xl">
          Smart Bookmarks
        </h1>
        <p className="text-white/60 text-lg md:text-xl max-w-md mb-12 animate-fade-in-up stagger-3">
          One place for your links. Fast, simple, always in sync.
        </p>
        <div className="animate-fade-in-up stagger-4">
          <Link
            href="/login"
            className="inline-block bg-white text-[#0a0a0a] px-10 py-4 text-sm font-medium tracking-wide hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
        <p className="mt-16 text-white/30 text-xs animate-fade-in stagger-5">
          Sign in with Google — no password needed
        </p>
      </section>
    </main>
  )
}
