import { Building, Size, SpaceType } from "@/types/request-detail.model";


interface Id {
    id: string;
}


interface SubjectOffer {
    id      : string;
    name    : string;
}


interface PeriodOffer {
    id      : string;
    name    : string;
}


interface SizeOffer {
    id      : Size;
    detail  : string;
}


export interface BasicOffer {
    startDate       : Date[];
    endDate         : Date[];
    building        : Building  | null;
    isEnglish       : boolean;
    workshop        : number;
    lecture         : number;
    tutoringSession : number;
    laboratory      : number;
    spaceType       : SpaceType | null;
    costCenterId    : string;
}


export interface Offer extends Id, BasicOffer {
    subject     : SubjectOffer;
    period      : PeriodOffer;
    spaceSize   : SizeOffer | null;
}


interface SaveOffer {
    periodId    : string;
    spaceSizeId : Size | null;
    subjectId   : string;
}


export interface CreateOffer extends BasicOffer, SaveOffer {}


export interface UpdateOffer extends Partial<BasicOffer>, SaveOffer {
    id: string;
}
