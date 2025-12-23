import {
    BuildingEnum,
    Size,
    SpaceType
}                           from "@/types/request-detail.model";
import { Module, Status }   from "@/types/request";
import { Session }          from "@/types/section.model";
import { Role }             from "@/types/staff.model";


export interface OfferSectionProffesor {
    id  : string;
    name: string;
}


export interface OfferSectionSubject {
    id  : string;
    name: string;
}


export interface OfferSectionPeriod {
    id          : string;
    name        : string;
    startDate   : Date;
    endDate     : Date;
    openingDate : Date | null;
    closingDate : Date | null;
}


export interface OfferModule {
    id          : string;
    code        : string;
    name        : string;
    startHour   : string;
    endHour     : string;
    difference   : 'A' | 'B' | null;
}


export interface OfferDay {
    id  : string;
    name: string;
}


export interface OfferSession {
    id                      : string;
    name                    : Session;
    spaceId                 : string;
    isEnglish               : boolean;
    chairsAvailable         : number;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    professor               : OfferSectionProffesor | null;
    module                  : OfferModule;
    date                    : Date;
    dayId                   : number;
    dayModuleId             : number;
    requestSession?         : RequestSession;
    planningChangeId        : string | null;
    section                 : SectionSeccionPlanningChange;
}


interface SectionSeccionPlanningChange {
    id          : string;
    code        : number,
    startDate   : Date;
    endDate     : Date;
    subject     : OfferSectionSubject
    building    : BuildingEnum | null;
}


interface Staff {
    id          : string;
    name        : string;
    email       : string;
    role        : Role;
    facultyId   : string;
}


interface SpaceSize {
    id          : string;
    detail      : string;
}


interface SessionDayModule {
    id      : string;
    dayId   : number;
    module  : Module;
}


interface RequestSessionDetail {
    id                  : string;
    session             : Session;
    building            : BuildingEnum;
    spaceId             : string;
    isEnglish           : boolean;
    isConsecutive       : boolean;
    isAfternoon         : boolean;
    description         : string | null;
    professor           : OfferSectionProffesor | null;
    spaceSize           : SpaceSize | null;
    spaceType           : SpaceType | null;
    staffUpdate         : Staff;
    sessionDayModules   : SessionDayModule[];
    createdAt           : Date;
    updatedAt           : Date;
}


export interface RequestSession {
    id              : string;
    title           : string;
    status          : Status;
    staffCreate     : Staff;
    staffUpdated    : Staff;
    createdAt       : Date;
    updatedAt       : Date;
    requestSessions : RequestSessionDetail[];
}


export interface SectionSession {
    ids             : string[];
    spaceIds        : string[];
    dayIds          : number[];
    moduleIds       : number[];
    professorIds    : string[];
}


export interface OfferSection {
    id              : string;
    code            : number;
    isClosed        : boolean;
    groupId         : string;
    startDate       : Date;
    building        : BuildingEnum | null;
    endDate         : Date;
    spaceSizeId     : Size | null;
    spaceType       : SpaceType | null;
    workshop        : number;
    lecture         : number;
    tutoringSession : number;
    laboratory      : number;
    professor       : OfferSectionProffesor | null;
    subject         : OfferSectionSubject;
    period          : OfferSectionPeriod;
    sessionsCount   : number;
    haveRequest     : boolean;
    quota           : number;
    registered      : number;
    // sessions        : SectionSession[];
    sessions        : SectionSession;
}
