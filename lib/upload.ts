import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { registerUploadedMediaAsset } from "@/lib/media-library";

type UploadLocalFileOptions = {
    uploadedById?: string | null;
};

export async function uploadLocalFile(file: File, folder: string, options: UploadLocalFileOptions = {}): Promise<string> {
    try {
        const buffer = await file.arrayBuffer();

        // Ensure folder exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        await fs.mkdir(uploadDir, { recursive: true });

        // Generate a unique filename while preserving extension
        const ext = file.name.split('.').pop() || 'tmp';
        const filename = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        // Save the file
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Return the public URL
        const publicUrl = `/uploads/${folder}/${filename}`;

        await registerUploadedMediaAsset({
            url: publicUrl,
            folder,
            fileName: filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedById: options.uploadedById || null,
        });

        return publicUrl;
    } catch (error) {
        console.error("Local file upload error:", error);
        throw new Error("Failed to upload local file");
    }
}
