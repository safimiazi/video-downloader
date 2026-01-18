import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          About Video Downloader
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">What is this?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Video Downloader is a free, fast, and easy-to-use tool for downloading videos from popular social media platforms. 
            Simply paste a video URL, and we&apos;ll help you download it in your preferred quality.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                Is this service free?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! This service is completely free to use with no hidden charges or subscriptions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                Which platforms are supported?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We currently support YouTube (full download), TikTok, Facebook, Instagram, and Twitter (metadata extraction). 
                YouTube videos can be downloaded in multiple quality options.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                Do I need to create an account?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No account needed! Just paste the URL and download.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                Is it legal to download videos?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You should only download videos that you have permission to download or that are in the public domain. 
                Always respect copyright laws and the terms of service of the platforms.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                What quality options are available?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                For YouTube, we offer multiple quality options from 360p to 4K (if available). 
                You can choose the quality that best suits your needs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                Why can&apos;t I download from some platforms?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Some platforms have strict anti-scraping measures. Currently, full download support is available for YouTube. 
                Other platforms show metadata and require additional API integrations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                Is my data safe?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We don&apos;t store any of your data. Video downloads are processed in real-time and we don&apos;t keep any records 
                of the URLs you submit or the videos you download.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Disclaimer</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This tool is provided for personal use only. Users are responsible for ensuring they have the right to download 
            and use any content. We do not condone copyright infringement and encourage users to respect intellectual property rights.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            By using this service, you agree to use it responsibly and in accordance with all applicable laws and platform terms of service.
          </p>
        </div>

        <div className="text-center">
          <Link 
            href="/"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
