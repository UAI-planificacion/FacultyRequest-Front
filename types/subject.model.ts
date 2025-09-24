import { Size, SpaceType } from "@/types/request-detail.model";

interface BaseSubject {
    id              : string;
    name            : string;
    costCenterId    : string;
    spaceSizeId     : Size      | null;
    spaceType       : SpaceType | null;
}


export interface Subject extends BaseSubject {
    facultyId   : string;
    isActive    : boolean;
    createdAt   : Date | string;
    updatedAt   : Date | string;
    offersCount : number;
}


export interface CreateSubject extends BaseSubject {
    facultyId: string;
}


export interface UpdateSubject extends Partial<BaseSubject> {}
