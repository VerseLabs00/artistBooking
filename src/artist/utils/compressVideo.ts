// Compress videos on the client before upload.
// iPhones record videos in MOV format which can be large.
// This utility reduces resolution and bitrate to make uploads work.

const MAX_VIDEO_DURATION = 300; // 5 minutes in seconds
const MAX_WIDTH = 720; // Reduced resolution for smaller file size
const MAX_HEIGHT = 1280; // Reduced resolution for smaller file size
const TARGET_BITRATES = [1500000, 1000000, 500000]; // Try multiple bitrates: 1.5Mbps, 1Mbps, 0.5Mbps

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
    
    // If already small enough, return as-is (compression can increase size for small videos)
    if (file.size < 10 * 1024 * 1024) {
        console.log(`Video size ${(file.size / 1024 / 1024).toFixed(2)}MB is under 10MB threshold, returning original without compression to avoid size increase`);
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

        // Try different bitrates to get under size limit
        for (const bitrate of TARGET_BITRATES) {
            try {
                const compressed = await compressWithBitrate(video, width, height, bitrate, file);
                if (compressed.size < file.size) {
                    console.log(`Compression successful: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB at ${bitrate / 1000000}Mbps`);
                    URL.revokeObjectURL(objectUrl);
                    return compressed;
                }
            } catch (error) {
                console.warn(`Compression failed at bitrate ${bitrate}:`, error);
                continue;
            }
        }

        console.warn('All compression attempts failed, returning original');
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

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
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
    
    if (!blob || blob.size >= originalFile.size) {
        throw new Error(`Compression produced larger file: ${blob?.size} vs ${originalFile.size}`);
    }

    const extension = supportedMimeType.includes('mp4') ? 'mp4' : 'webm';
    const newName = originalFile.name.replace(/\.[^.]+$/, "") + `.${extension}`;
    return new File([blob], newName, {
        type: supportedMimeType,
        lastModified: Date.now(),
    });
}
