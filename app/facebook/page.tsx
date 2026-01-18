'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FacebookDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoData(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video');
      }

      if (data.success && data.data) {
        setVideoData(data.data);
      } else {
        setError(data.note || 'Video information retrieved but download not available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: any) => {
    if (format.downloadUrl) {
      window.open(format.downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Facebook Downloader
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Download Facebook videos in high quality
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facebook Video URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.facebook.com/..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processing...' : 'Get Video'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {videoData && videoData.formats && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{videoData.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">By {videoData.author}</p>
            
            <div className="space-y-3">
              {videoData.formats.map((format: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleDownload(format)}
                  className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-white">{format.quality}</span>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">📖 How to Use:</h3>
          <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside">
            <li>Copy the Facebook video URL from your browser</li>
            <li>Paste the URL in the input field above</li>
            <li>Click "Get Video" button</li>
            <li>Choose your preferred quality and click download</li>
          </ol>
        </div>

        {/* Note */}
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Notes:</h3>
          <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
            <li>Only public Facebook videos can be downloaded</li>
            <li>Videos from private profiles or groups are not accessible</li>
            <li>Download time depends on video size and quality</li>
            <li>Respect copyright and terms of service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}