import { StaffRequest } from "./request";


export enum SpaceType {
    ROOM        = "ROOM",
    AUDITORIUM  = "AUDITORIUM",
    COMMUNIC    = "COMMUNIC",
    LAB         = "LAB",
    LABPC       = "LABPC",
    DIS         = "DIS",
    GARAGE      = "GARAGE",
    CORE        = "CORE",
}


export enum Building {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
}


export enum Size {
    XS  = "XS",
    XE  = "XE",
    S   = "S",
    SE  = "SE",
    MS  = "MS",
    M   = "M",
    L   = "L",
    XL  = "XL",
    XXL = "XXL",
}


export enum Grade {
    PREGRADO        = "PREGRADO",
    FIRST_GRADE     = "FIRST_GRADE",
    SECOND_GRADE    = "SECOND_GRADE",
}


export interface BaseRequestDetail {
    minimum?        : number | null;
    maximum?        : number | null;
    spaceType?      : SpaceType | null;
    spaceSize?      : Size | null;
    costCenterId?   : string | null;
    inAfternoon?    : boolean;
    building?       : Building | null;
    description?    : string | null;
    moduleId?       : string | null;
    spaceId?        : string | null;
    isPriority?     : boolean;
    grade?          : Grade;
    professorId?    : string | null;
}


export interface RequestDetail extends BaseRequestDetail {
    id          : string;
    requestId   : string;
    inAfternoon : boolean;
    isPriority  : boolean;
    grade       : Grade;
    staffCreate : StaffRequest;
    staffUpdate : StaffRequest | null;
    createdAt   : Date;
    updatedAt   : Date;
}


export interface CreateRequestDetail extends Omit<BaseRequestDetail, 'comment'> {
    requestId       : string;
    inAfternoon     : boolean;
    isPriority      : boolean;
    grade           : Grade;
    staffCreateId   : string;
}


export interface UpdateRequestDetail extends Omit<BaseRequestDetail, 'comment'> {
    id              : string;
    staffUpdateId   : string;
}
