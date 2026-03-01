import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function uploadLocalFile(file: File, folder: string): Promise<string> {
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
        return `/uploads/${folder}/${filename}`;
    } catch (error) {
        console.error("Local file upload error:", error);
        throw new Error("Failed to upload local file");
    }
}
