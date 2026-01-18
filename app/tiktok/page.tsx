'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TikTokDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleGetInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      if (!isTikTokUrl(url)) {
        throw new Error('Please enter a valid TikTok URL');
      }

      // For demo purposes, we'll create mock video info
      // In a real app, you'd call your API to get video info
      setVideoInfo({
        title: 'TikTok Video',
        author: 'TikTok User',
        thumbnail: '/placeholder-video.jpg',
        url: url
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadStatus('🎵 Downloading TikTok video...');
    setError('');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'tiktok-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadStatus('✅ TikTok video download started!');
      setTimeout(() => setDownloadStatus(''), 5000);

    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('');
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const isTikTokUrl = (url: string): boolean => {
    const tiktokPatterns = [
      /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w-]+/,
      /^https?:\/\/vm\.tiktok\.com\/[\w-]+/,
      /^https?:\/\/vt\.tiktok\.com\/[\w-]+/,
    ];
    
    return tiktokPatterns.some(pattern => pattern.test(url));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            TikTok Downloader
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Download TikTok videos without watermark in original quality
          </p>
        </header>

        {/* Main Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleGetInfo} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                TikTok Video URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@username/video/..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Loading...' : 'Get Video'}
            </button>
          </form>
        </div>

        {/* Download Status */}
        {downloadStatus && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-blue-600 dark:text-blue-400 font-medium">{downloadStatus}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Video Info & Download Options */}
        {videoInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-32 h-24 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    TikTok Video Ready
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Video detected and ready for download
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-500 rounded-lg hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-900/40 dark:hover:to-rose-900/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-white">Download TikTok Video</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">No watermark • Original quality</div>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">📖 How to Use:</h3>
          <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside">
            <li>Copy the TikTok video URL from the app or website</li>
            <li>Paste the URL in the input field above</li>
            <li>Click "Get Video" button</li>
            <li>Click the download button to save the video</li>
          </ol>
        </div>

        {/* Supported URLs */}
        <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">🔗 Supported URL Formats:</h3>
          <ul className="space-y-1 text-sm text-green-700 dark:text-green-300 list-disc list-inside">
            <li>https://www.tiktok.com/@username/video/1234567890</li>
            <li>https://vm.tiktok.com/ABC123</li>
            <li>https://vt.tiktok.com/ABC123</li>
            <li>https://www.tiktok.com/t/ABC123</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Notes:</h3>
          <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
            <li>Downloads are processed on our server - no app installation needed</li>
            <li>Videos are downloaded without TikTok watermark</li>
            <li>Original quality is preserved</li>
            <li>Only public videos can be downloaded</li>
          </ul>
        </div>
      </div>
    </div>
  );
}