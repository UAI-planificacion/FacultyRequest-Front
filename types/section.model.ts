import { Size } from "@/types/request-detail.model";


interface Day {
    id      : number;
    name    : string;
}


interface Module {
    id          : number;
    code        : string;
    startHour   : string;
    endHour     : string;
    diference   : string | null;
}


interface Professor {
    id      : string;
    name    : string;
}


interface Subject {
    id      : string;
    name    : string;
}


interface Period {
    id      : string;
    name    : string;
}


export interface SectionBase {
    size?                   : Size | null | undefined;
    correctedRegistrants?   : number | null;
    realRegistrants?        : number | null;
    plannedBuilding?        : string | null;
    chairsAvailable?        : number | null;
}


export interface Section extends SectionBase {
    id          : string;
    code        : number;
    period      : Period;
    subject     : Subject;
    room        : string    | null;
    professor   : Professor | null;
    isClosed    : boolean;
    groupId     : string;
    day         : Day       | null;
    module      : Module    | null;
    session     : Session;

}

interface SectionSave {
    roomId?         : string | null;
    professorId?    : string | null;
    dayModuleId?    : number | null;

}


export interface CreateSectionRequest extends SectionBase, SectionSave {
    periodId    : string;
    subjectId   : string;
    code        : number;
    groupId     : string;
    session     : Session;
}


export interface UpdateSectionRequest extends SectionBase, SectionSave {
    id      : string;
    session : Session;

}


export interface UpdateMassiveSectionRequest extends SectionBase, SectionSave {
    session? : Session | null;
}


export enum Session {
    C = 'C', // Cátedra
    A = 'A', // Ayudantía
    T = 'T', // Taller
    L = 'L'  // Laboratorio
}

export interface SectionToCreate {
    periodId    : string;
    session     : Session;
    code        : number;
    groupId     : string;
}

export interface SessionCounts {
    [Session.C]: number;
    [Session.A]: number;
    [Session.T]: number;
    [Session.L]: number;
}

export interface SectionData {
    id              : string;
    period          : string;
    sessionCounts   : SessionCounts;
    sectionNumber   : number;
    isNew           : boolean;
}
