import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 border-b border-gray-700">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          <span className="font-semibold text-lg">AlgoPractice</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link 
            href="/" 
            className="px-3 py-2 rounded hover:bg-gray-800 transition-colors text-sm"
          >
            Problems
          </Link>
          <Link 
            href="/dashboard" 
            className="px-3 py-2 rounded hover:bg-gray-800 transition-colors text-sm"
          >
            Dashboard
          </Link>
          <Link 
            href="/plan" 
            className="px-3 py-2 rounded hover:bg-gray-800 transition-colors text-sm"
          >
            Study Plan
          </Link>
        </nav>
      </div>
    </header>
  );
}
