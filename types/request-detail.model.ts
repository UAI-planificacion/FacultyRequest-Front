import { Grade }        from "@/types/grade";
import { StaffRequest } from "@/types/request";


export enum SpaceType {
    ROOM                = "ROOM",
    AUDITORIO           = "AUDITORIO",
    LAB                 = "LAB",
    LABPC               = "LABPC",
    DIS                 = "DIS",
    CORE                = "CORE",
    STUDY_ROOM          = "STUDY_ROOM",
    MEETING_ROOM        = "MEETING_ROOM",
    POSTGRADUATE_ROOM   = "POSTGRADUATE_ROOM",
    MULTIPURPOSE        = "MULTIPURPOSE"
}



export enum Building {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
}


export enum BuildingEnum {
    PREGRADO_A    = 'PREGRADO_A',
    PREGRADO_B    = 'PREGRADO_B',
    POSTGRADO_C   = 'POSTGRADO_C',
    TALLERES_D    = 'TALLERES_D',
    TALLERES_E    = 'TALLERES_E',
    PREGRADO_F    = 'PREGRADO_F',
    ERRAZURIZ     = 'ERRAZURIZ',
    VITACURA      = 'VITACURA',
    VINA_A        = 'VINA_A',
    VINA_B        = 'VINA_B',
    VINA_C        = 'VINA_C',
    VINA_D        = 'VINA_D',
    VINA_E        = 'VINA_E',
    VINA_F        = 'VINA_F',
    Z             = 'Z'
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


export interface ModuleDay {
    id?         : string;
    day         : string;
    moduleId    : string;
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
    grade?          : Grade | null;
    professorId?    : string | null;
    moduleDays      : ModuleDay[];
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
    staffCreateId   : string;
    gradeId?        : string | null;
}


export interface UpdateRequestDetail extends Omit<BaseRequestDetail, 'comment'> {
    id              : string;
    staffUpdateId   : string;
}
