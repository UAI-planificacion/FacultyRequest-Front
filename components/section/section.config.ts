import { SectionData, Session } from "@/types/section.model";

export const sessionLabels = {
    [Session.C]: 'Cátedra',
    [Session.A]: 'Ayudantía',
    [Session.T]: 'Taller',
    [Session.L]: 'Laboratorio',
};

export const sessionColors = {
    [Session.C]: 'bg-blue-500',
    [Session.A]: 'bg-green-500',
    [Session.T]: 'bg-orange-500',
    [Session.L]: 'bg-purple-500',
};

export const sessionColorsHover = {
    [Session.C]: 'hover:bg-blue-500/80',
    [Session.A]: 'hover:bg-green-500/80',
    [Session.T]: 'hover:bg-orange-500/80',
    [Session.L]: 'hover:bg-purple-500/80',
};


export const sessionBorders = {
    [Session.C]: 'border border-blue-500/70 dark:border-blue-500/30',
    [Session.A]: 'border border-green-500/70 dark:border-green-500/30',
    [Session.T]: 'border border-orange-500/70 dark:border-orange-500/30',
    [Session.L]: 'border border-purple-500/70 dark:border-purple-500/30',
};


export interface PeriodsSection {
    id      : string;
    label   : string;
    value   : string;
}


export interface Props {
    section                 : SectionData | SectionData[];
    updateSectionNumber     : ( sectionId: string, newNumber: number ) => void;
    removeSection           : ( sectionId: string ) => void;
    removeDisabled          : boolean;
    updateSectionPeriod     : ( sectionId: string, period: string ) => void;
    updateSessionCount      : ( sectionId: string, session: Session, delta: number ) => void
    setSessionCount         : ( sectionId: string, session: Session, value: string ) => void
}
