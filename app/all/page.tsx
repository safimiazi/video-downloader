'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VideoData {
  title: string;
  author: string;
  platform: string;
  formats?: Array<{
    quality: string;
    downloadUrl?: string;
  }>;
}

export default function UniversalDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');

  const detectPlatform = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com') || url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) return 'TikTok';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
    return 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoData(null);

    const platform = detectPlatform(url);
    setDetectedPlatform(platform);

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
        setVideoData({
          ...data.data,
          platform
        });
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

  const handleDownload = (format: { downloadUrl?: string }) => {
    if (format.downloadUrl) {
      window.open(format.downloadUrl, '_blank');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YouTube': return '🎬';
      case 'TikTok': return '🎵';
      case 'Facebook': return '📘';
      case 'Instagram': return '📸';
      case 'Twitter/X': return '🐦';
      default: return '🌐';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'YouTube': return 'from-red-500 to-red-600';
      case 'TikTok': return 'from-pink-500 to-rose-600';
      case 'Facebook': return 'from-blue-500 to-blue-600';
      case 'Instagram': return 'from-purple-500 to-pink-600';
      case 'Twitter/X': return 'from-sky-500 to-blue-600';
      default: return 'from-violet-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-900/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 mb-4 inline-flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Universal Downloader
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            One tool for all platforms - YouTube, TikTok, Facebook & more
          </p>
        </header>

        {/* Main Form */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video URL (Any Platform)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (e.target.value) {
                      setDetectedPlatform(detectPlatform(e.target.value));
                    } else {
                      setDetectedPlatform('');
                    }
                  }}
                  placeholder="Paste any video URL here..."
                  className="w-full px-4 py-3 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white transition-all backdrop-blur-sm"
                  required
                />
                {detectedPlatform && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getPlatformColor(detectedPlatform)}`}>
                      {getPlatformIcon(detectedPlatform)} {detectedPlatform}
                    </div>
                  </div>
                )}
              </div>
              {detectedPlatform && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Platform detected: {detectedPlatform}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : 'Download Video'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Video Info & Download Options */}
        {videoData && (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${getPlatformColor(videoData.platform)}`}>
                  {getPlatformIcon(videoData.platform)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {videoData.title}
                    </h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getPlatformColor(videoData.platform)}`}>
                      {videoData.platform}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    By {videoData.author}
                  </p>
                </div>
              </div>

              {videoData.formats && videoData.formats.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span className="text-xl">📺</span>
                    Available Formats:
                  </h3>
                  {videoData.formats.map((format, index) => (
                    <button
                      key={index}
                      onClick={() => handleDownload(format)}
                      className={`w-full p-4 rounded-lg border-2 transition-all transform hover:scale-105 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <div className="text-left">
                            <div className="font-semibold text-gray-800 dark:text-white">{format.quality}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{videoData.platform} Video</div>
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Video Detected!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We found your {videoData.platform} video. Processing download options...
                  </p>
                  <div className="animate-pulse flex justify-center">
                    <div className="h-2 bg-violet-200 dark:bg-violet-800 rounded-full w-32"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Supported Platforms */}
        <div className="mt-8 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-6">
          <h3 className="font-semibold text-violet-800 dark:text-violet-200 mb-4 flex items-center gap-2">
            <span className="text-xl">🌐</span>
            Supported Platforms:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'YouTube', icon: '🎬', status: 'Full Support' },
              { name: 'TikTok', icon: '🎵', status: 'Full Support' },
              { name: 'Facebook', icon: '📘', status: 'Full Support' },
              { name: 'Instagram', icon: '📸', status: 'Coming Soon' },
              { name: 'Twitter/X', icon: '🐦', status: 'Coming Soon' },
              { name: 'More...', icon: '➕', status: 'In Development' },
            ].map((platform, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{platform.icon}</span>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{platform.name}</div>
                  <div className={`text-xs ${platform.status === 'Full Support' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {platform.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
            <span className="text-xl">📖</span>
            How to Use:
          </h3>
          <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside">
            <li>Copy any video URL from supported platforms</li>
            <li>Paste the URL in the input field above</li>
            <li>The platform will be automatically detected</li>
            <li>Click &quot;Download Video&quot; and choose your preferred format</li>
          </ol>
        </div>

        {/* Note */}
        <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            Important Notes:
          </h3>
          <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
            <li>Auto-detection works for most popular video platforms</li>
            <li>Download quality depends on the original video quality</li>
            <li>Some platforms may have restrictions on certain videos</li>
            <li>Always respect copyright and terms of service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}