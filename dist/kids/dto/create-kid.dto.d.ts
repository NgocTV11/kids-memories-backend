export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare class CreateKidDto {
    name: string;
    date_of_birth: string;
    gender: Gender;
    bio?: string;
    profile_picture?: string;
    family_id?: string;
}
