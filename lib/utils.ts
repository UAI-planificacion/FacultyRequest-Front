import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Level, SpaceType, Status } from '@/types/request';

import { format } from "@formkit/tempo"



export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export function dateToString( dateInput?: Date | string | undefined ): string {
    if ( !dateInput ) return "-";

    return dateInput instanceof Date ? dateInput.toISOString().split('T')[0] : dateInput;
}


export function tempoFormat( dateInput: Date | string | undefined ) {
    if ( !dateInput ) return "-";

    return format( dateInput, "ddd DD MMMM YYYY" );
}


export const getStatusName = ( status: Status ) : string => ({
    [Status.PENDING]    : "Pendiente",
    [Status.APPROVED]   : "Aprobado",
    [Status.REJECTED]   : "Rechazado",
    [Status.REVIEWING]  : "Revisando",
})[status] || "Pendiente";


export const getSpaceType = ( spaceType: SpaceType ) => ({
    [SpaceType.ROOM]        : "Sala",
    [SpaceType.AUDITORIUM]  : "Auditorio",
    [SpaceType.COMMUNIC]    : "Comunicación",
    [SpaceType.CORE]        : "Core",
    [SpaceType.DIS]         : "Diseño",
    [SpaceType.GARAGE]      : "Garage",
    [SpaceType.LAB]         : "Laboratorio",
    [SpaceType.LABPC]       : "Laboratorio de Computadoras",
})[spaceType];


export const getLevelName = ( level: Level ) => ({
    [Level.FIRST_GRADE]     : "Primer Grado",
    [Level.SECOND_GRADE]    : "Segundo Grado",
    [Level.PREGRADO]        : "Pregrado",
})[level];
