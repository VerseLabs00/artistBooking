// Compress/resize images on the client before upload.
// Phone cameras produce very large photos (and iPhones use HEIC), which causes
// uploads to fail on mobile. We downscale to a sane max dimension and re-encode
// as JPEG. PDFs and non-image files are returned untouched.

const MAX_DIMENSION = 800; // px, longest edge (aggressive compression for mobile)
const JPEG_QUALITY = 0.6; // Lower quality for smaller file sizes

const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not read this image."));
        img.src = src;
    });

export async function compressImage(file: File): Promise<File> {
    console.log(`Compressing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Only process images. Leave PDFs / unknown types as-is.
    const isImage =
        file.type.startsWith("image/") ||
        /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?|avif)$/i.test(file.name);

    if (!isImage) {
        console.log("Not an image, returning original");
        return file;
    }

    // For HEIC files, if the browser doesn't support them natively,
    // we need to ensure the MIME type is correctly set for the backend
    if (/\.(heic|heif)$/i.test(file.name) && !file.type.startsWith("image/")) {
        console.log("HEIC file without proper MIME type, correcting...");
        // Create a new File object with correct MIME type for HEIC
        const correctedFile = new File([file], file.name, {
            type: "image/heic",
            lastModified: file.lastModified,
        });
        // Try to convert, but if it fails, return the corrected file
        const objectUrl = URL.createObjectURL(correctedFile);
        try {
            const img = await loadImage(objectUrl);
            URL.revokeObjectURL(objectUrl);
            return await processImage(img, file);
        } catch (error) {
            console.warn("HEIC conversion failed:", error);
            URL.revokeObjectURL(objectUrl);
            return correctedFile;
        }
    }

    const objectUrl = URL.createObjectURL(file);

    try {
        const img = await loadImage(objectUrl);
        return await processImage(img, file);
    } catch (error) {
        console.warn("Image compression failed:", error);
        // If the browser can't decode the image (e.g. HEIC on some browsers),
        // fall back to the original file and let the server handle it.
        return file;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

async function processImage(img: HTMLImageElement, originalFile: File): Promise<File> {
    let { width, height } = img;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
        } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
        }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return originalFile;
    ctx.drawImage(img, 0, 0, width, height);

    // Try multiple quality levels to get under size limit
    const qualityLevels = [JPEG_QUALITY, 0.5, 0.4, 0.3];
    let blob: Blob | null = null;
    let finalQuality = JPEG_QUALITY;

    for (const quality of qualityLevels) {
        const testBlob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", quality)
        );
        
        if (testBlob && testBlob.size < originalFile.size) {
            blob = testBlob;
            finalQuality = quality;
            // If we got a reasonable size, break
            if (testBlob.size < 2 * 1024 * 1024) break; // Under 2MB
        }
    }

    // If conversion failed or somehow produced a bigger file, keep original.
    if (!blob || blob.size >= originalFile.size) {
        console.warn(`Compression failed: original=${originalFile.size}, compressed=${blob?.size}, returning original`);
        return originalFile;
    }

    console.log(`Compression successful: original=${originalFile.size}, compressed=${blob.size}, quality=${finalQuality}`);
    const newName = originalFile.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, {
        type: "image/jpeg",
        lastModified: Date.now(),
    });
}
