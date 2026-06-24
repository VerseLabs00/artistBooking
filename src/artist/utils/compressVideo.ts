// Convert videos to MP4 on the client before upload.
// iPhones record videos in MOV format which can have MIME type issues.
// This utility converts videos to MP4 using the browser's MediaRecorder API.

const MAX_VIDEO_DURATION = 300; // 5 minutes in seconds
const TARGET_BITRATE = 2500000; // 2.5 Mbps for good quality/size balance

export async function compressVideo(file: File): Promise<File> {
    // If already MP4 and reasonable size, return as-is
    if (file.type === 'video/mp4' && file.size < 50 * 1024 * 1024) {
        return file;
    }

    // Check if browser supports MediaRecorder
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported('video/mp4')) {
        // Fallback: return original if conversion not supported
        console.warn('Video conversion not supported in this browser, using original file');
        return file;
    }

    try {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.muted = true;
        videoElement.playsInline = true;

        const objectUrl = URL.createObjectURL(file);
        
        await new Promise<void>((resolve, reject) => {
            videoElement.src = objectUrl;
            videoElement.onloadedmetadata = () => resolve();
            videoElement.onerror = () => reject(new Error('Could not load video'));
        });

        // Check duration
        const duration = videoElement.duration;
        if (duration > MAX_VIDEO_DURATION) {
            URL.revokeObjectURL(objectUrl);
            throw new Error(`Video is too long (${Math.round(duration)}s). Maximum is ${MAX_VIDEO_DURATION}s.`);
        }

        // Set up canvas and recording
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth || 1280;
        canvas.height = videoElement.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            return file;
        }

        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/mp4',
            videoBitsPerSecond: TARGET_BITRATE
        });

        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        const recordingPromise = new Promise<Blob>((resolve, reject) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/mp4' });
                resolve(blob);
            };
            mediaRecorder.onerror = () => reject(new Error('Recording failed'));
        });

        // Start recording and play video
        mediaRecorder.start();
        videoElement.currentTime = 0;
        await videoElement.play();

        const drawFrame = () => {
            if (videoElement.paused || videoElement.ended) {
                return;
            }
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
        };
        drawFrame();

        // Wait for video to finish
        await new Promise<void>((resolve) => {
            videoElement.onended = () => {
                mediaRecorder.stop();
                resolve();
            };
        });

        const blob = await recordingPromise;
        URL.revokeObjectURL(objectUrl);

        // If conversion failed or produced larger file, return original
        if (!blob || blob.size >= file.size) {
            return file;
        }

        const newName = file.name.replace(/\.[^.]+$/, "") + ".mp4";
        return new File([blob], newName, {
            type: 'video/mp4',
            lastModified: Date.now(),
        });
    } catch (error) {
        console.warn('Video conversion failed:', error);
        // Return original file if conversion fails
        return file;
    }
}
