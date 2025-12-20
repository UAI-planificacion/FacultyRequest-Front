import {
    BuildingEnum,
    Size,
    SpaceType
}                                   from "@/types/request-detail.model";
import { OfferSectionProffesor }    from '@/types/offer-section.model';
import { Status }                   from "@/types/request";
import { Session }                  from "@/types/section.model";
import { SizeId }                   from "@/types/size.model";
import { Staff }                    from "@/types/staff.model";


interface StaffPlanningChange extends Staff {
    id      : string;
    name    : string
}


interface PlanningChangeSession {
    id              : string;
    name            : string;
    spaceId         : string;
    date            : Date;
    isEnglish       : boolean;
    professor       : OfferSectionProffesor;
    section         : PlanningChangeSection;
    dayModule       : {
        id          : number;
        dayId       : number;
        module      : {
            id          : number;
            startHour   : string;
            endHour     : string;
            difference  : number;
            code        : string;
        };
    };
}


interface Subject {
    id      : string;
    name    : string;
}


interface Period {
    id      : string;
    name    : string;
}


interface PlanningChangeSection {
    id              : string;
    code            : string;
    isCloased       : boolean;
    groupId         : string;
    startDate       : Date;
    endDate         : Date;
    spaceType       : SpaceType             | null;
    spaceSize       : Size                  | null;
    professor       : OfferSectionProffesor | null;
    subject         : Subject;
    period          : Period;
    workshop        : number;
    lecture         : number;
    tutoringSession : number;
    laboratory      : number;
}


export interface PlanningChangeAll {
    id              : string;
    title           : string;
    status          : Status;
    sessionName     : Session               | null;
    building        : BuildingEnum          | null;
    spaceId         : string                | null;
    isEnglish       : boolean;
    isConsecutive   : boolean;
    description     : string                | null;
    spaceType       : SpaceType             | null;
    inAfternoon     : boolean;
    professor       : OfferSectionProffesor | null;
    spaceSize       : Size                  | null;
    createdAt       : Date;
    updatedAt       : Date;
    staffCreate     : StaffPlanningChange;
    staffUpdate     : StaffPlanningChange   | null;
    dayModulesId    : number[];

    session         : PlanningChangeSession | null;
    section         : PlanningChangeSection | null;
}


export interface PlanningChange {
    id              : string;
    title           : string;
    status          : Status;
    sessionName     : Session               | null;
    building        : BuildingEnum          | null;
    spaceId         : string                | null;
    isEnglish       : boolean;
    isConsecutive   : boolean;
    description     : string                | null;
    spaceType       : SpaceType             | null;
    inAfternoon     : boolean;
    professor       : OfferSectionProffesor | null;
    spaceSize       : Size                  | null;
    sessionId       : string                | null;
    sectionId       : string                | null;
    createdAt       : Date;
    updatedAt       : Date;
    staffCreate     : StaffPlanningChange;
    staffUpdate     : StaffPlanningChange   | null;
    dayModulesId    : number[];
    sessionDayModules?: { dayModuleId: number }[];
}


interface PlanningChangeSave {
    title           : string;
    sessionName     : Session       | null;
    professorId     : string        | null;
    spaceSizeId     : SizeId        | null;
    spaceType       : SpaceType     | null;
    spaceId         : string        | null;
    isEnglish       : boolean       | null;
    isConsecutive   : boolean       | null;
    inAfternoon     : boolean       | null;
    description     : string        | null;
    building        : BuildingEnum  | null;
    status          : Status        | null;
    dayModulesId    : number[];
}


export interface PlanningChangeCreate extends PlanningChangeSave {
    staffCreateId   : string;
    sessionId       : string        | null;
    sectionId       : string | null;
}


export interface PlanningChangeUpdate extends PlanningChangeSave {
    staffUpdateId: string;
}
