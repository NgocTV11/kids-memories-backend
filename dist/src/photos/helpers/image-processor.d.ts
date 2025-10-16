export interface ImageProcessingResult {
    originalUrl: string;
    thumbnailUrl: string;
    mediumUrl: string;
    originalPath: string;
    thumbnailPath: string;
    mediumPath: string;
}
export declare class ImageProcessor {
    private uploadDir;
    constructor();
    private ensureUploadDirExists;
    processImage(buffer: Buffer, originalFilename: string): Promise<ImageProcessingResult>;
    extractExifData(buffer: Buffer): Promise<Record<string, any>>;
    private parseExifBuffer;
    deletePhotoFiles(originalUrl: string, thumbnailUrl: string, mediumUrl: string): Promise<void>;
}
