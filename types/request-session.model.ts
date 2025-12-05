import { OfferSectionProffesor }    from "@/types/offer-section.model";
import { SpaceType }                from "@/types/request-detail.model";
import { Session }                  from "@/types/section.model";


interface SessionSize {
    id              : string;
    detail          : string;
}

export interface RequestSession {
    id                  : string;
    requestId?          : string;
    session             : Session;
    spaceId             : string | null;
    description         : string | null;
    isEnglish           : boolean;
    isConsecutive       : boolean;
    inAfternoon         : boolean;
    spaceSize           : SessionSize | null;
    spaceType           : SpaceType | null;
    professor           : OfferSectionProffesor;
    createdAt           : Date;
    updatedAt           : Date;
    sessionDayModules   : number[];
    building            : string;
}


export interface RequestSessionCreate {
    session         : Session;
    description     : string | null;
    isEnglish       : boolean;
    isConsecutive   : boolean;
    inAfternoon     : boolean;
    spaceSizeId     : string | null;
    spaceType       : SpaceType | null;
    professorId     : string | null;
    spaceId         : string | null;
    building        : string;
    dayModulesId    : number[];
}
