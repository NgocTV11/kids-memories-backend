export declare enum PrivacyLevel {
    PRIVATE = "private",
    FAMILY = "family",
    PUBLIC = "public"
}
export declare class CreateAlbumDto {
    title: string;
    description?: string;
    kid_id?: string;
    privacy_level: PrivacyLevel;
    cover_photo_url?: string;
    tags?: string[];
    family_id?: string;
}
