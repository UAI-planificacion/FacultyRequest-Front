export enum HeadquartersEnum {
    ERRAZURIZ   = "ERRAZURIZ",
    PENALOLEN   = "PENALOLEN",
    VINADELMAR  = "VINADELMAR",
    VITACURA    = "VITACURA",
}


export interface Grade {
    id              : string;
    name            : string;
    headquartersId  : HeadquartersEnum;
    createdAt       : Date;
    updatedAt       : Date;
}


export interface GradeFormData {
    name            : string;
    headquartersId  : HeadquartersEnum;
}
