import { ConfigService } from '@nestjs/config';
export declare enum StorageFolder {
    AVATARS = "avatars",
    PHOTOS = "photos",
    ALBUMS = "albums"
}
export declare class StorageService {
    private configService;
    private readonly logger;
    private s3Client;
    private bucketName;
    private region;
    private useLocalStorage;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder: StorageFolder): Promise<string>;
    private uploadToS3;
    private uploadToLocal;
    deleteFile(fileUrl: string): Promise<void>;
    private extractKeyFromUrl;
    isUsingS3(): boolean;
    getStorageType(): string;
}
