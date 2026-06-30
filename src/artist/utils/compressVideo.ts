// Compress videos on the client before upload.
// iPhones record videos in MOV format which can be large.
// This utility reduces resolution and bitrate to make uploads work.

const MAX_VIDEO_DURATION = 300; // 5 minutes in seconds
const MAX_WIDTH = 360; // Reduced resolution for smaller file size
const MAX_HEIGHT = 640; // Reduced resolution for smaller file size
const TARGET_BITRATES = [1500000, 1000000, 500000, 300000, 200000, 150000, 100000]; // Try multiple bitrates: 1.5Mbps, 1Mbps, 0.5Mbps, 0.3Mbps, 0.2Mbps, 0.15Mbps, 0.1Mbps
const TARGET_SIZE_BYTES = 1 * 1024 * 1024; // Target 1MB

const loadVideo = (src: string): Promise<HTMLVideoElement> =>
    new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        video.onloadedmetadata = () => resolve(video);
        video.onerror = () => reject(new Error('Could not load video'));
        video.src = src;
    });

export async function compressVideo(file: File): Promise<File> {
    console.log(`Compressing video: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`);
    
    // If already under 1MB, return as-is
    if (file.size < TARGET_SIZE_BYTES) {
        console.log(`Video size ${(file.size / 1024 / 1024).toFixed(2)}MB is already under 1MB, returning original`);
        return file;
    }

    // Check if browser supports MediaRecorder
    if (typeof MediaRecorder === 'undefined') {
        console.warn('MediaRecorder not supported, returning original');
        return file;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
        const video = await loadVideo(objectUrl);
        
        // Check duration
        const duration = video.duration;
        if (duration > MAX_VIDEO_DURATION) {
            console.warn(`Video too long: ${duration}s, returning original`);
            URL.revokeObjectURL(objectUrl);
            return file;
        }

        // Calculate target dimensions (maintain aspect ratio)
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width >= height) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            } else {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
            }
        }
        
        console.log(`Target dimensions: ${width}x${height}`);

        let bestCompressed: File | null = null;
        let bestSize = file.size;

        // Try different bitrates to get under 1MB target
        for (const bitrate of TARGET_BITRATES) {
            try {
                const compressed = await compressWithBitrate(video, width, height, bitrate, file);
                console.log(`Compression attempt at ${bitrate / 1000000}Mbps: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
                
                // If under 1MB, return immediately
                if (compressed.size < TARGET_SIZE_BYTES) {
                    console.log(`✓ Target achieved: ${(compressed.size / 1024 / 1024).toFixed(2)}MB is under 1MB`);
                    URL.revokeObjectURL(objectUrl);
                    return compressed;
                }
                
                // Otherwise keep track of smallest result
                if (compressed.size < bestSize) {
                    bestCompressed = compressed;
                    bestSize = compressed.size;
                }
            } catch (error) {
                console.warn(`Compression failed at bitrate ${bitrate}:`, error);
                continue;
            }
        }

        // If we got a smaller file (even if not under 1MB), return it
        if (bestCompressed && bestSize < file.size) {
            console.log(`Returning best compressed result: ${(bestSize / 1024 / 1024).toFixed(2)}MB (couldn't reach 1MB target)`);
            URL.revokeObjectURL(objectUrl);
            return bestCompressed;
        }

        console.warn('All compression attempts failed or produced larger files, returning original');
        URL.revokeObjectURL(objectUrl);
        return file;
    } catch (error) {
        console.error('Video compression error:', error);
        URL.revokeObjectURL(objectUrl);
        return file;
    }
}

async function compressWithBitrate(
    video: HTMLVideoElement,
    width: number,
    height: number,
    bitrate: number,
    originalFile: File
): Promise<File> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Find supported MIME type
    const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    let supportedMimeType = '';
    for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            supportedMimeType = mimeType;
            break;
        }
    }
    
    if (!supportedMimeType) {
        throw new Error('No supported video MIME type found');
    }

    console.log(`Using MIME type: ${supportedMimeType} at ${bitrate}bps`);

    // Capture video from canvas
    const canvasStream = canvas.captureStream(30);
    
    // Try to capture audio from the video element
    let audioTrack: MediaStreamTrack | null = null;
    try {
        // Capture audio using captureStream() if the video element supports it
        if ((video as any).captureStream) {
            const videoStream = (video as any).captureStream();
            const audioTracks = videoStream.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTrack = audioTracks[0];
                console.log('Audio track captured from video element');
            }
        }
        
        // Fallback: try Web Audio API
        if (!audioTrack) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaElementSource(video);
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);
            source.connect(audioContext.destination); // Also connect to speakers so we can hear it during playback
            audioTrack = destination.stream.getAudioTracks()[0] || null;
            if (audioTrack) {
                console.log('Audio track captured via Web Audio API');
            }
        }
    } catch (error) {
        console.warn('Could not capture audio track:', error);
    }

    // Combine video and audio tracks
    const tracks = [...canvasStream.getVideoTracks()];
    if (audioTrack) {
        tracks.push(audioTrack);
    }
    const combinedStream = new MediaStream(tracks);

    const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: supportedMimeType,
        videoBitsPerSecond: bitrate
    });

    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    const recordingPromise = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: supportedMimeType });
            resolve(blob);
        };
        mediaRecorder.onerror = () => reject(new Error('Recording failed'));
    });

    // Start recording
    mediaRecorder.start(100); // Collect data every 100ms
    video.currentTime = 0;
    await video.play();

    // Draw frames
    const drawFrame = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, width, height);
        requestAnimationFrame(drawFrame);
    };
    drawFrame();

    // Wait for video to finish
    await new Promise<void>((resolve) => {
        video.onended = () => {
            mediaRecorder.stop();
            resolve();
        };
    });

    const blob = await recordingPromise;
    
    if (!blob) {
        throw new Error('Compression produced no blob');
    }

    const extension = supportedMimeType.includes('mp4') ? 'mp4' : 'webm';
    const newName = originalFile.name.replace(/\.[^.]+$/, "") + `.${extension}`;
    return new File([blob], newName, {
        type: supportedMimeType,
        lastModified: Date.now(),
    });
}