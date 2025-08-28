'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

const EXAMPLE_QUERIES = [
  '3-day Tokyo food tour',
  'Week-long European adventure',
  'Beach vacation in Southeast Asia',
  'Mountain hiking in the Alps',
] as const;

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent empty submission
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create itinerary: ${response.status}`);
      }

      const data = await response.json() as { id: string };
      
      // Reset loading state before redirect
      setIsLoading(false);
      
      // Redirect to the plan detail page
      router.push(`/plan/${data.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChipClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            AI-Powered Travel Planning
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Describe your dream trip in one sentence, and let AI create the perfect itinerary for you
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <label htmlFor="travel-query" className="sr-only">
                Describe your trip
              </label>
              <textarea
                id="travel-query"
                data-testid="home-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., A romantic weekend in Paris with great food and museums"
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
                aria-label="Travel query input"
                disabled={isLoading}
              />
            </div>

            {/* Example Chips */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Try these examples:
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleChipClick(example)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    disabled={isLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            <div 
              role="status"
              aria-live="polite"
              className={`mb-4 text-red-600 dark:text-red-400 text-sm ${error ? 'block' : 'invisible'}`}
            >
              {error || '\u00A0'}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              data-testid="home-submit"
              disabled={isLoading || !query.trim()}
              aria-busy={isLoading ? 'true' : 'false'}
              className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition-all transform hover:scale-105 ${
                isLoading || !query.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating your itinerary...
                </span>
              ) : (
                'Create My Itinerary'
              )}
            </button>
          </div>
        </form>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Generation</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get a complete travel itinerary in seconds, not hours
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Recommendations</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI understands your preferences and creates personalized plans
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Save & Share</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Keep your itineraries forever and share them with friends
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
