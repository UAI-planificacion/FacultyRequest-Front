import { clsx, type ClassValue }    from 'clsx';
import { twMerge }                  from 'tailwind-merge';
import { format }                   from "@formkit/tempo"

import {
    BuildingEnum,
    SpaceType
}                   from '@/types/request-detail.model';
import { Status }   from '@/types/request';


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export function dateToString( dateInput?: Date | string | undefined ): string {
    if ( !dateInput ) return "-";

    return dateInput instanceof Date ? dateInput.toISOString().split('T')[0] : dateInput;
}


export function tempoFormat( dateInput: Date | string | undefined ) {
    if ( !dateInput ) return "-";

    return format( dateInput, "ddd DD MMM YYYY" );
}


export const getStatusName = ( status: Status ) : string => ({
    [Status.PENDING]    : "Pendiente",
    [Status.APPROVED]   : "Aprobado",
    [Status.REJECTED]   : "Rechazado",
    [Status.REVIEWING]  : "Revisando",
})[status] || "Pendiente";


export const getSpaceType = ( spaceType: SpaceType ) => ({
    [SpaceType.ROOM]                : "Sala",
    [SpaceType.LABPC]               : "Laboratorio de Computación",
    [SpaceType.AUDITORIO]           : "Auditorio",
    [SpaceType.STUDY_ROOM]          : "Sala Estudio",
    [SpaceType.MEETING_ROOM]        : "Sala Reuniones",
    [SpaceType.DIS]                 : "Sala Diseño",
    [SpaceType.LAB]                 : "Laboratorio Investigación",
    [SpaceType.CORE]                : "Sala Core",
    [SpaceType.POSTGRADUATE_ROOM]   : "Sala Postgrado",
    [SpaceType.MULTIPURPOSE]        : "Multiuso",
})[spaceType];


export const getBuildingName = ( building: BuildingEnum ) => ({
    [BuildingEnum.PREGRADO_A]    : "Edificio Pregrado A",
    [BuildingEnum.PREGRADO_B]    : "Edificio Pregrado B",
    [BuildingEnum.POSTGRADO_C]   : "Edificio Postgrado C",
    [BuildingEnum.TALLERES_D]    : "Edificio Talleres D",
    [BuildingEnum.TALLERES_E]    : "Edificio Talleres E",
    [BuildingEnum.PREGRADO_F]    : "Edificio Pregrado F",
    [BuildingEnum.ERRAZURIZ]     : "Edificio Errazuriz",
    [BuildingEnum.VITACURA]      : "Edificio Vitacura",
    [BuildingEnum.VINA_A]        : "Edificio A",
    [BuildingEnum.VINA_B]        : "Edificio B",
    [BuildingEnum.VINA_C]        : "Edificio C",
    [BuildingEnum.VINA_D]        : "Edificio D",
    [BuildingEnum.VINA_E]        : "Edificio E",
    [BuildingEnum.VINA_F]        : "Edificio F",
    [BuildingEnum.Z]             : "Z",
})[building];


// Whitelist of space types that allow size filtering
export const SPACE_TYPES_WITH_SIZE_FILTER: SpaceType[] = [
	SpaceType.ROOM,
	SpaceType.DIS,
	// SpaceType.LABPC,
	// SpaceType.LAB,
];
