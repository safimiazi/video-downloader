import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { unlink, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const quality = searchParams.get('quality') || '720';
    const audioOnly = searchParams.get('audioOnly') === 'true';
    const progress = searchParams.get('progress') === 'true';

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('Download request:', { url, quality, audioOnly, progress });

    // If progress is requested, return Server-Sent Events
    if (progress) {
      return handleProgressiveDownload(url, quality, audioOnly);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const tempFile = join(tmpdir(), `video_${timestamp}`);

    try {
      let command = '';
      
      if (audioOnly) {
        // Download audio only as MP3
        command = `yt-dlp --no-check-certificate --js-runtimes node -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 0 -o "${tempFile}.%(ext)s" "${url}"`;
      } else {
        // Download video with audio in specified quality
        // This format ensures we get video+audio merged
        command = `yt-dlp --no-check-certificate --js-runtimes node -f "bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}]" --merge-output-format mp4 -o "${tempFile}.%(ext)s" "${url}"`;
      }

      console.log('Executing:', command);

      // Execute download
      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000 // 2 minutes timeout
      });

      console.log('Download completed');
      console.log('stdout:', stdout);
      if (stderr) console.log('stderr:', stderr);

      // Find the downloaded file
      const ext = audioOnly ? 'mp3' : 'mp4';
      const downloadedFile = `${tempFile}.${ext}`;

      // Read the file
      if (!existsSync(downloadedFile)) {
        throw new Error('Downloaded file not found');
      }

      const fileBuffer = await readFile(downloadedFile);
      
      // Clean up
      try {
        await unlink(downloadedFile);
      } catch (cleanupError) {
        console.log('Cleanup error:', cleanupError);
      }

      // Return the file
      const headers = new Headers({
        'Content-Type': audioOnly ? 'audio/mpeg' : 'video/mp4',
        'Content-Disposition': `attachment; filename="download_${quality}${audioOnly ? 'p_audio' : 'p'}.${ext}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      });

      return new Response(fileBuffer, { headers });

    } catch (downloadError) {
      console.error('Download error:', downloadError);
      
      // Fallback: Return download URL instead
      try {
        let format = '';
        if (audioOnly) {
          format = 'bestaudio';
        } else {
          format = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`;
        }

        const { stdout } = await execAsync(`yt-dlp --no-check-certificate --js-runtimes node --get-url -f "${format}" "${url}"`);
        const urls = stdout.trim().split('\n');

        return NextResponse.json({
          success: true,
          directDownload: false,
          urls: urls,
          message: 'Direct download not available, use these URLs',
          instruction: audioOnly ? 'Audio URL' : 'Video URLs (may need merging)'
        });

      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw downloadError; // Throw original error
      }
    }

  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      error: 'Download failed',
      details: errorMessage,
      suggestion: 'Try a different quality or check if yt-dlp is installed'
    }, { status: 500 });
  }
}

// Handle progressive download with real-time progress
async function handleProgressiveDownload(url: string, quality: string, audioOnly: boolean) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const timestamp = Date.now();
      const tempFile = join(tmpdir(), `video_${timestamp}`);
      
      let command = '';
      if (audioOnly) {
        command = `yt-dlp --no-check-certificate --js-runtimes node -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 0 --progress --newline -o "${tempFile}.%(ext)s" "${url}"`;
      } else {
        command = `yt-dlp --no-check-certificate --js-runtimes node -f "bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}]" --merge-output-format mp4 --progress --newline -o "${tempFile}.%(ext)s" "${url}"`;
      }

      console.log('Starting progressive download:', command);

      const child = exec(command, { timeout: 300000 }); // 5 minutes timeout

      let downloadStarted = false;
      let totalSize = 0;
      let downloadedSize = 0;
      let controllerClosed = false;

      // Helper function to safely send data
      const safeEnqueue = (data: string) => {
        if (!controllerClosed) {
          try {
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            console.log('Controller already closed, ignoring message');
            controllerClosed = true;
          }
        }
      };

      // Send initial message
      safeEnqueue(`data: ${JSON.stringify({
        type: 'start',
        message: 'Starting download...',
        progress: 0
      })}\n\n`);

      child.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('yt-dlp output:', output);

        // Parse yt-dlp progress output
        const lines = output.split('\n');
        for (const line of lines) {
          // Look for download progress patterns
          if (line.includes('[download]') && line.includes('%')) {
            const progressMatch = line.match(/(\d+\.?\d*)%/);
            const sizeMatch = line.match(/(\d+\.?\d*[KMGT]?iB)/g);
            
            if (progressMatch) {
              const progress = parseFloat(progressMatch[1]);
              
              if (sizeMatch && sizeMatch.length >= 2) {
                downloadedSize = parseSize(sizeMatch[0]);
                totalSize = parseSize(sizeMatch[1]);
              }

              safeEnqueue(`data: ${JSON.stringify({
                type: 'progress',
                progress: Math.min(progress, 100),
                downloadedSize,
                totalSize,
                message: `Downloading... ${progress.toFixed(1)}%`
              })}\n\n`);

              downloadStarted = true;
            }
          }
          
          // Check for merge/post-processing
          if (line.includes('[ffmpeg]') || line.includes('Merging')) {
            safeEnqueue(`data: ${JSON.stringify({
              type: 'processing',
              progress: 95,
              message: 'Processing video...'
            })}\n\n`);
          }
        }
      });

      child.stderr?.on('data', (data) => {
        const errorOutput = data.toString();
        console.error('yt-dlp error:', errorOutput);
        
        // Only send error if it's a real error, not just warnings
        if (!downloadStarted && errorOutput.toLowerCase().includes('error')) {
          safeEnqueue(`data: ${JSON.stringify({
            type: 'error',
            message: 'Download failed: ' + errorOutput.substring(0, 100)
          })}\n\n`);
        }
      });

      child.on('close', async (code) => {
        if (code === 0) {
          // Download completed successfully
          const ext = audioOnly ? 'mp3' : 'mp4';
          const downloadedFile = `${tempFile}.${ext}`;
          
          try {
            if (existsSync(downloadedFile)) {
              const stats = await stat(downloadedFile);
              const fileSize = stats.size;
              
              safeEnqueue(`data: ${JSON.stringify({
                type: 'complete',
                progress: 100,
                fileSize,
                downloadUrl: `/api/youtube-download?url=${encodeURIComponent(url)}&quality=${quality}&audioOnly=${audioOnly}`,
                message: 'Download completed!'
              })}\n\n`);
            } else {
              throw new Error('Downloaded file not found');
            }
          } catch (fileError) {
            console.error('File processing error:', fileError);
            safeEnqueue(`data: ${JSON.stringify({
              type: 'error',
              message: 'File processing failed'
            })}\n\n`);
          }
        } else {
          safeEnqueue(`data: ${JSON.stringify({
            type: 'error',
            message: `Download failed with code ${code}`
          })}\n\n`);
        }
        
        if (!controllerClosed) {
          try {
            controller.close();
            controllerClosed = true;
          } catch (error) {
            console.log('Controller already closed');
          }
        }
      });

      child.on('error', (processError) => {
        console.error('Process error:', processError);
        safeEnqueue(`data: ${JSON.stringify({
          type: 'error',
          message: 'Process failed: ' + processError.message
        })}\n\n`);
        
        if (!controllerClosed) {
          try {
            controller.close();
            controllerClosed = true;
          } catch (closeError) {
            console.log('Controller already closed during error handling');
          }
        }
      });
    }
  });

  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Helper function to parse file sizes
function parseSize(sizeStr: string): number {
  const match = sizeStr.match(/(\d+\.?\d*)([KMGT]?i?B)/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  const multipliers: { [key: string]: number } = {
    'B': 1,
    'KiB': 1024,
    'MiB': 1024 * 1024,
    'GiB': 1024 * 1024 * 1024,
    'TiB': 1024 * 1024 * 1024 * 1024,
    'KB': 1000,
    'MB': 1000 * 1000,
    'GB': 1000 * 1000 * 1000,
    'TB': 1000 * 1000 * 1000 * 1000,
  };
  
  return value * (multipliers[unit] || 1);
}

// Increase timeout for this route
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';