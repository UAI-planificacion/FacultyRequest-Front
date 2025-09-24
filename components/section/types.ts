import { Section, Session } from "@/types/section.model";


export interface Option {
    id      : string;
    label   : string;
    value   : string;
}


export interface SessionCount {
    [Session.C] : number;
    [Session.A] : number;
    [Session.T] : number;
    [Session.L] : number;
}


export interface SectionGroup {
    groupId         : string;
    code            : number;
    period          : string;
    subjectId       : string;
    subjectName     : string;
    sessionCounts   : SessionCount;
    schedule        : string;
    isOpen          : boolean;
    sections        : Section[];
}
