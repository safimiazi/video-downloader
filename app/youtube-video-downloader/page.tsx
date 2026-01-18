'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{
    title: string;
    author: string;
    thumbnail: string;
    videoId: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDownload, setCurrentDownload] = useState({ quality: '', audioOnly: false });
  const [downloadStatus, setDownloadStatus] = useState('');
  const [downloadedSize, setDownloadedSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  const qualities = [
    { value: '2160', label: '4K (2160p)', hd: true, icon: '🎬' },
    { value: '1440', label: '2K (1440p)', hd: true, icon: '🎥' },
    { value: '1080', label: 'Full HD (1080p)', hd: true, icon: '✨' },
    { value: '720', label: 'HD (720p)', hd: true, icon: '🔥' },
    { value: '480', label: 'SD (480p)', hd: false, icon: '📺' },
    { value: '360', label: 'Low (360p)', hd: false, icon: '⚡' },
  ];

  // SEO-friendly page title and description
  const pageTitle = "Free YouTube Video Downloader Online - Download 4K, HD Videos & MP3";
  const pageDescription = "Download YouTube videos in 4K, 1080p, 720p or extract MP3 audio for free. Safe, fast, and online YouTube video downloader. No registration required.";
  const keywords = "youtube video downloader, youtube video downloader 4k, free youtube video downloader, youtube video downloader online, youtube video downloader safe, download youtube video, youtube mp3 downloader";

  // Cleanup EventSource on component unmount
  useEffect(() => {
    return () => {
      const windowWithCleanup = window as Window & { currentDownloadCleanup?: () => void };
      if (windowWithCleanup.currentDownloadCleanup) {
        windowWithCleanup.currentDownloadCleanup();
      }
    };
  }, []);

  const handleGetInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video info');
      }

      const data = await response.json();
      setVideoInfo({
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url,
        videoId: videoId
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Real-time download progress using Server-Sent Events
  const handleDownload = async (quality: string, audioOnly: boolean = false) => {
    setIsDownloading(true);
    setCurrentDownload({ quality, audioOnly });
    setDownloadProgress(0);
    setDownloadStatus('Starting download...');
    setDownloadedSize(0);
    setTotalSize(0);
    setError('');

    try {
      // Start SSE connection for real-time progress
      const progressUrl = `/api/youtube-download?url=${encodeURIComponent(url)}&quality=${quality}&audioOnly=${audioOnly}&progress=true`;
      const eventSource = new EventSource(progressUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Progress update:', data);

          switch (data.type) {
            case 'start':
              setDownloadStatus(data.message);
              setDownloadProgress(0);
              break;
            
            case 'progress':
              setDownloadProgress(data.progress);
              setDownloadStatus(data.message);
              if (data.downloadedSize) setDownloadedSize(data.downloadedSize);
              if (data.totalSize) setTotalSize(data.totalSize);
              break;
            
            case 'processing':
              setDownloadStatus(data.message);
              setDownloadProgress(data.progress);
              break;
            
            case 'complete':
              setDownloadProgress(100);
              setDownloadStatus('Download completed!');
              if (eventSource.readyState !== EventSource.CLOSED) {
                eventSource.close();
              }
              
              // Trigger actual file download
              setTimeout(() => {
                const downloadUrl = `/api/youtube-download?url=${encodeURIComponent(url)}&quality=${quality}&audioOnly=${audioOnly}`;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = audioOnly ? 'audio.mp3' : `video_${quality}p.mp4`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Reset state after download
                setTimeout(() => {
                  setIsDownloading(false);
                  setDownloadProgress(0);
                  setDownloadStatus('');
                }, 2000);
              }, 1000);
              break;
            
            case 'error':
              setError(data.message);
              setIsDownloading(false);
              setDownloadProgress(0);
              setDownloadStatus('');
              if (eventSource.readyState !== EventSource.CLOSED) {
                eventSource.close();
              }
              break;
          }
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setError('Connection error. Please try again.');
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus('');
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
      };

      // Cleanup function to close EventSource if component unmounts
      const cleanup = () => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
      };

      // Store cleanup function for potential use
      (window as Window & { currentDownloadCleanup?: () => void }).currentDownloadCleanup = cleanup;

    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://yourdomain.com/youtube-downloader" />
        
        {/* Schema.org markup for Google */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "YouTube Video Downloader",
            "description": "Free online YouTube video downloader for 4K, HD videos and MP3 audio extraction",
            "url": "https://yourdomain.com/youtube-downloader",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web",
            "permissions": "Internet",
            "featureList": [
              "Download YouTube videos in 4K quality",
              "Extract MP3 audio from YouTube videos",
              "Multiple resolution options (360p to 4K)",
              "No registration required",
              "Free online service"
            ],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Breadcrumb for SEO */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="font-medium text-red-600 dark:text-red-400" aria-current="page">
                YouTube Video Downloader
              </li>
            </ol>
          </nav>

          {/* Header with H1 for SEO */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Free Online Tool
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
                YouTube Video Downloader
              </span>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-normal mt-2 text-gray-700 dark:text-gray-300">
                Download Videos in 4K, HD & MP3 Format
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
              <strong>Free YouTube video downloader online</strong> that supports <strong>4K, 1080p, 720p video downloads</strong> and <strong>MP3 audio extraction</strong>. 
              Safe, fast, and <strong>no registration required</strong> - download YouTube videos directly in your browser.
            </p>
          </header>

          {/* Main Card */}
          <main className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
            {/* Progress Bar */}
    {isDownloading && (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-1">
              <div 
                className="h-1 bg-white rounded-full transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          )}

            <div className="p-6 md:p-8">
              {/* URL Input Section */}
              <section className="mb-10" aria-labelledby="url-input-heading">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 id="url-input-heading" className="text-xl font-bold text-gray-800 dark:text-white">
                      YouTube Video Downloader Online
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Supports all YouTube URLs including watch, youtu.be, and embed links
                    </p>
                  </div>
                </div>

                <form onSubmit={handleGetInfo} className="space-y-4">
                  <div className="relative">
                    <label htmlFor="youtube-url" className="sr-only">
                      YouTube Video URL
                    </label>
                    <input
                      type="text"
                      id="youtube-url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste YouTube URL here: https://www.youtube.com/watch?v=..."
                      className="w-full px-5 py-4 pl-14 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg"
                      required
                      aria-label="YouTube video URL input"
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    aria-label={loading ? "Loading video information" : "Get video information"}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                        Processing YouTube Video...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
                        </svg>
                        Get Video Information
                      </>
                    )}
                  </button>
                </form>
              </section>

              {/* Download Progress */}
              {isDownloading && (
                <section className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30" aria-live="polite">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          Downloading {currentDownload.audioOnly ? 'MP3 Audio' : `${currentDownload.quality}p Video`}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {downloadStatus || 'Processing...'}
                        </p>
                        {totalSize > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatFileSize(downloadedSize)} / {formatFileSize(totalSize)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {Math.min(100, Math.round(downloadProgress))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>Initializing</span>
                    <span>Downloading</span>
                    <span>Processing</span>
                    <span>Complete</span>
                  </div>
                </section>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg" role="alert" aria-live="assertive">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-300">Error: {error}</p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Please check the YouTube URL or try again
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Info & Download Options */}
              {videoInfo && !isDownloading && (
                <section aria-labelledby="download-options-heading">
                  {/* Video Preview */}
                  <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="relative flex-shrink-0">
                        <img
                          src={videoInfo.thumbnail}
                          alt={`Thumbnail for video: ${videoInfo.title}`}
                          className="w-48 h-36 object-cover rounded-xl shadow-lg"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">YouTube</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {videoInfo.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">Channel: {videoInfo.author}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                            ✅ Ready to download
                          </span>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                            ⚡ Instant processing
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Options */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Audio Download */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-green-200 dark:border-green-900/30 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Audio Only (MP3)</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Best quality MP3 extraction</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">320 kbps</span>
                      </div>
                      <button
                        onClick={() => handleDownload('0', true)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        aria-label="Download MP3 audio"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download MP3 Audio
                      </button>
                    </div>

                    {/* Video Quality Grid */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                        <div>
                          <h3 id="download-options-heading" className="font-bold text-gray-900 dark:text-white">
                            Video Quality Options
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Choose from 360p to 4K resolution</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {qualities.map((q) => (
                          <button
                            key={q.value}
                            onClick={() => handleDownload(q.value, false)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 ${
                              q.hd
                                ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 hover:from-red-100 hover:to-pink-100 dark:hover:from-gray-700 dark:hover:to-gray-800'
                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            aria-label={`Download video in ${q.label}`}
                          >
                            <div className="text-center">
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{q.icon}</div>
                              <div className={`text-xl font-bold ${q.hd ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-300'}`}>
                                {q.label.split(' ')[0]}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {q.label.split(' ').slice(1).join(' ')}
                              </div>
                              {q.hd && (
                                <div className="mt-2">
                                  <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                                    HD Quality
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* How to Use */}
            <article className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">How to Use This YouTube Downloader</h3>
              </div>
              <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center font-medium flex-shrink-0">1</span>
                  <span><strong>Paste YouTube URL</strong> - Copy and paste any YouTube video link in the input field above</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center font-medium flex-shrink-0">2</span>
                  <span><strong>Click "Get Video Information"</strong> - Our tool will fetch video details automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center font-medium flex-shrink-0">3</span>
                  <span><strong>Choose Download Format</strong> - Select MP3 for audio or choose video quality (360p to 4K)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center font-medium flex-shrink-0">4</span>
                  <span><strong>Download Instantly</strong> - Click download button and your file will save automatically</span>
                </li>
              </ol>
            </article>

            {/* Important Notes */}
            <article className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Important Notes About YouTube Downloader</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0">•</span>
                  <span><strong>Safe & Secure</strong> - Our YouTube video downloader is completely safe with no malware or viruses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0">•</span>
                  <span><strong>No Software Needed</strong> - This is an online YouTube downloader, works directly in your browser</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0">•</span>
                  <span><strong>HD Quality</strong> - Download YouTube videos in 4K, 2K, 1080p, 720p with audio included</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0">•</span>
                  <span><strong>Free Forever</strong> - No registration, no payment, unlimited YouTube video downloads</span>
                </li>
              </ul>
            </article>
          </div>

          {/* FAQ Section for SEO */}
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Frequently Asked Questions About YouTube Video Downloader
            </h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Is this YouTube video downloader free to use?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Yes, completely free!</strong> Our YouTube downloader is 100% free with no hidden charges, 
                  no registration required, and no download limits. You can download as many YouTube videos as you want.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  What video qualities does this YouTube downloader support?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our tool supports <strong>all YouTube video qualities</strong> from 360p to 4K (2160p). 
                  You can download YouTube videos in 4K, 2K, 1080p Full HD, 720p HD, 480p SD, and 360p.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Can I download MP3 audio from YouTube videos?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Yes!</strong> Our YouTube MP3 downloader feature allows you to extract audio from any YouTube video 
                  and save it as high-quality MP3 (320 kbps). Perfect for downloading music, podcasts, or audio content.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Is this YouTube video downloader safe?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Absolutely safe!</strong> Our online YouTube downloader doesn't require any software installation, 
                  doesn't contain malware, and doesn't ask for personal information. All downloads happen securely in your browser.
                </p>
              </div>
            </div>
          </section>

          {/* Footer Note with Keywords */}
          <footer className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>
              <strong>Free YouTube Video Downloader Online</strong> • Download YouTube videos in <strong>4K, HD quality</strong> • 
              Extract <strong>MP3 audio from YouTube</strong> • <strong>Safe YouTube downloader</strong> • 
              No registration • No download limits • Works on all devices
            </p>
            <p className="mt-2 text-xs">
              This tool is for personal use only. Please respect YouTube's terms of service and copyright laws.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}