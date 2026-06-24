// Handle iPhone video uploads by ensuring correct MIME type.
// iPhones record videos in MOV format which can have MIME type issues.
// Since the backend already accepts MOV, we just ensure proper MIME type here.

export async function compressVideo(file: File): Promise<File> {
    console.log(`Processing video: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // If already has proper MIME type and reasonable size, return as-is
    if (file.type.startsWith('video/') && file.size < 100 * 1024 * 1024) {
        console.log('Video has proper MIME type, returning original');
        return file;
    }

    // For files without proper MIME type (common with iPhone MOV files)
    if (!file.type.startsWith('video/')) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        console.log(`Video missing MIME type, extension: ${extension}`);
        
        // Set correct MIME type based on extension
        let mimeType = 'video/mp4';
        if (extension === 'mov') mimeType = 'video/quicktime';
        else if (extension === 'avi') mimeType = 'video/x-msvideo';
        else if (extension === 'mkv') mimeType = 'video/x-matroska';
        else if (extension === 'webm') mimeType = 'video/webm';
        
        const correctedFile = new File([file], file.name, {
            type: mimeType,
            lastModified: file.lastModified,
        });
        console.log(`Corrected MIME type to: ${mimeType}`);
        return correctedFile;
    }

    console.log('Returning original video file');
    return file;
}
