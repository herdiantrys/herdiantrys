import path from "path";

import {
    DeleteObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const PRESIGNED_UPLOAD_TTL_SECONDS = 15 * 60;

type MissingR2Config = {
    configured: false;
    missing: string[];
};

type ReadyR2Config = {
    configured: true;
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicBaseUrl: string;
};

type R2Config = MissingR2Config | ReadyR2Config;

const normalizeEnvValue = (value?: string) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

const normalizeFolder = (folder: string) => {
    const normalized = folder.replace(/\\/g, "/").trim().replace(/^\/+|\/+$/g, "");

    if (!normalized) {
        throw new Error("Upload folder is required.");
    }

    if (normalized.includes("..")) {
        throw new Error("Invalid upload folder.");
    }

    if (!/^[a-zA-Z0-9/_-]+$/.test(normalized)) {
        throw new Error("Upload folder contains invalid characters.");
    }

    return normalized;
};

const normalizePublicBaseUrl = (value: string) => {
    const trimmed = value.trim().replace(/\/+$/g, "");

    if (!/^https?:\/\//i.test(trimmed)) {
        throw new Error("R2_PUBLIC_BASE_URL must start with http:// or https://");
    }

    return trimmed;
};

const normalizeContentType = (contentType?: string | null) => {
    const trimmed = contentType?.trim();
    return trimmed || "application/octet-stream";
};

const getSafeExtension = (fileName: string) => {
    const extension = path.posix.extname(fileName.trim().replace(/\\/g, "/")).toLowerCase();

    if (!extension) {
        return "";
    }

    return /^\.[a-z0-9]{1,16}$/.test(extension) ? extension : "";
};

const encodeObjectKey = (objectKey: string) =>
    objectKey
        .split("/")
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join("/");

const getR2Config = (): R2Config => {
    const accountId = normalizeEnvValue(process.env.R2_ACCOUNT_ID);
    const accessKeyId = normalizeEnvValue(process.env.R2_ACCESS_KEY_ID);
    const secretAccessKey = normalizeEnvValue(process.env.R2_SECRET_ACCESS_KEY);
    const bucketName = normalizeEnvValue(process.env.R2_BUCKET_NAME);
    const publicBaseUrl = normalizeEnvValue(process.env.R2_PUBLIC_BASE_URL);

    const missing = [
        !accountId ? "R2_ACCOUNT_ID" : null,
        !accessKeyId ? "R2_ACCESS_KEY_ID" : null,
        !secretAccessKey ? "R2_SECRET_ACCESS_KEY" : null,
        !bucketName ? "R2_BUCKET_NAME" : null,
        !publicBaseUrl ? "R2_PUBLIC_BASE_URL" : null,
    ].filter(Boolean) as string[];

    if (missing.length > 0) {
        return {
            configured: false as const,
            missing,
        };
    }

    return {
        configured: true as const,
        accountId: accountId!,
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
        bucketName: bucketName!,
        publicBaseUrl: normalizePublicBaseUrl(publicBaseUrl!),
    };
};

const requireR2Config = (): ReadyR2Config => {
    const config = getR2Config();

    if (!config.configured) {
        throw new Error(`R2 is not configured. Missing: ${config.missing.join(", ")}`);
    }

    return config;
};

const createR2Client = () => {
    const config = requireR2Config();

    return new S3Client({
        region: "auto",
        endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
        forcePathStyle: true,
    });
};

export type DirectUploadPurpose = "media" | "project-image" | "project-file";

export type PresignedR2Upload = {
    provider: "r2";
    uploadUrl: string;
    publicUrl: string;
    objectKey: string;
    folder: string;
    filename: string;
    contentType: string;
};

export const isR2Configured = () => getR2Config().configured;

export const getR2MissingConfig = () => {
    const config = getR2Config();
    return config.configured ? [] : config.missing;
};

export const buildR2ObjectKey = (folder: string, originalName: string) => {
    const normalizedFolder = normalizeFolder(folder);
    const extension = getSafeExtension(originalName);
    const filename = `${uuidv4()}${extension}`;

    return {
        folder: normalizedFolder,
        filename,
        objectKey: `${normalizedFolder}/${filename}`,
    };
};

export const buildR2PublicUrl = (objectKey: string) => {
    const config = requireR2Config();

    return `${config.publicBaseUrl}/${encodeObjectKey(objectKey)}`;
};

export const isR2PublicUrl = (url: string) => {
    const config = getR2Config();

    if (!config.configured) {
        return false;
    }

    const publicBaseUrl = config.publicBaseUrl.toLowerCase();
    return url.trim().toLowerCase().startsWith(`${publicBaseUrl}/`);
};

export const createPresignedR2Upload = async (input: {
    folder: string;
    originalName: string;
    contentType?: string | null;
}) => {
    const config = requireR2Config();

    const client = createR2Client();
    const { folder, filename, objectKey } = buildR2ObjectKey(input.folder, input.originalName);
    const contentType = normalizeContentType(input.contentType);

    const uploadUrl = await getSignedUrl(
        client,
        new PutObjectCommand({
            Bucket: config.bucketName,
            Key: objectKey,
            ContentType: contentType,
        }),
        { expiresIn: PRESIGNED_UPLOAD_TTL_SECONDS },
    );

    return {
        provider: "r2" as const,
        uploadUrl,
        publicUrl: buildR2PublicUrl(objectKey),
        objectKey,
        folder,
        filename,
        contentType,
    };
};

export const headR2Object = async (objectKey: string) => {
    const config = requireR2Config();

    const client = createR2Client();

    return client.send(
        new HeadObjectCommand({
            Bucket: config.bucketName,
            Key: objectKey,
        }),
    );
};

export const deleteR2Object = async (objectKey: string) => {
    const config = requireR2Config();

    const client = createR2Client();

    await client.send(
        new DeleteObjectCommand({
            Bucket: config.bucketName,
            Key: objectKey,
        }),
    );
};
