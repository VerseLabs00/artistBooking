// Compress/resize images on the client before upload.
// Phone cameras produce very large photos (and iPhones use HEIC), which causes
// uploads to fail on mobile. We downscale to a sane max dimension and re-encode
// as JPEG. PDFs and non-image files are returned untouched.

const MAX_DIMENSION = 1600; // px, longest edge
const JPEG_QUALITY = 0.8;

const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not read this image."));
        img.src = src;
    });

export async function compressImage(file: File): Promise<File> {
    // Only process images. Leave PDFs / unknown types as-is.
    const isImage =
        file.type.startsWith("image/") ||
        /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?|avif)$/i.test(file.name);

    if (!isImage) return file;

    const objectUrl = URL.createObjectURL(file);

    try {
        const img = await loadImage(objectUrl);

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
        if (!ctx) return file;
        ctx.drawImage(img, 0, 0, width, height);

        const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
        );

        // If conversion failed or somehow produced a bigger file, keep original.
        if (!blob || blob.size >= file.size) return file;

        const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], newName, {
            type: "image/jpeg",
            lastModified: Date.now(),
        });
    } catch {
        // If the browser can't decode the image (e.g. HEIC on some Androids),
        // fall back to the original file and let the server handle it.
        return file;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}
