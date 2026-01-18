'use client';

import Link from 'next/link';

export default function Home() {
  const platforms = [
    {
      name: 'YouTube',
      description: 'Download videos in 4K, 1080p, 720p and more',
      icon: '🎬',
      color: 'from-red-600 to-pink-600',
      bgColor: 'from-red-50 to-pink-50',
      darkBgColor: 'dark:from-red-900/20 dark:to-pink-900/20',
      href: '/youtube-video-downloader',
      features: ['4K & HD Quality', 'Audio Extraction', 'Multiple Formats']
    },
    {
      name: 'TikTok',
      description: 'Download TikTok videos without watermark',
      icon: '🎵',
      color: 'from-pink-600 to-purple-600',
      bgColor: 'from-pink-50 to-purple-50',
      darkBgColor: 'dark:from-pink-900/20 dark:to-purple-900/20',
      href: '/tiktok',
      features: ['No Watermark', 'HD Quality', 'Fast Download']
    },
    {
      name: 'Facebook',
      description: 'Download Facebook videos in high quality',
      icon: '📘',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      darkBgColor: 'dark:from-blue-900/20 dark:to-indigo-900/20',
      href: '/facebook',
      features: ['HD Quality', 'Public Videos', 'Easy Download']
    },
    {
      name: 'Instagram',
      description: 'Download Instagram videos and reels',
      icon: '📸',
      color: 'from-purple-600 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      darkBgColor: 'dark:from-purple-900/20 dark:to-pink-900/20',
      href: '/',
      features: ['Reels & Videos', 'Stories', 'IGTV'],
      comingSoon: true
    },
    {
      name: 'Twitter/X',
      description: 'Download Twitter videos and GIFs',
      icon: '🐦',
      color: 'from-sky-600 to-blue-600',
      bgColor: 'from-sky-50 to-blue-50',
      darkBgColor: 'dark:from-sky-900/20 dark:to-blue-900/20',
      href: '/',
      features: ['Videos & GIFs', 'HD Quality', 'Fast'],
      comingSoon: true
    },
    {
      name: 'All Platforms',
      description: 'Universal downloader for all platforms',
      icon: '🌐',
      color: 'from-gray-600 to-gray-800',
      bgColor: 'from-gray-50 to-gray-100',
      darkBgColor: 'dark:from-gray-800 dark:to-gray-900',
      href: '/all',
      features: ['Multi-Platform', 'Auto-Detect', 'One Tool']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Video Downloader
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl mb-2">
            Download videos from any platform in high quality
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Choose your platform below to get started
          </p>
        </header>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {platforms.map((platform) => (
            <Link
              key={platform.name}
              href={platform.href}
              className={`relative group ${platform.comingSoon ? 'pointer-events-none' : ''}`}
            >
              <div className={`bg-gradient-to-br ${platform.bgColor} ${platform.darkBgColor} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 border border-gray-200 dark:border-gray-700 ${platform.comingSoon ? 'opacity-60' : ''}`}>
                {platform.comingSoon && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
                
                <div className="text-5xl mb-4">{platform.icon}</div>
                
                <h2 className={`text-2xl font-bold bg-gradient-to-r ${platform.color} bg-clip-text text-transparent mb-2`}>
                  {platform.name}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {platform.description}
                </p>
                
                <div className="space-y-2">
                  {platform.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                {!platform.comingSoon && (
                  <div className="mt-4 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
            Why Choose Our Downloader?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download videos in seconds with our optimized servers
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Safe & Secure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No registration required. Your privacy is our priority
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">High Quality</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download videos in original quality up to 4K resolution
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Choose Platform</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select the platform you want to download from
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Paste URL</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copy and paste the video URL into the input field
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Download</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select quality and click download to save the video
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2026 Video Downloader. Please respect copyright and terms of service.</p>
        </footer>
      </div>
    </div>
  );
}