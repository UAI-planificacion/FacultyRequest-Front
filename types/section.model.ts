import { Size } from "@/types/request-detail.model";


export interface Section {
    id                      : string,
    code                    : number,
    session                 : string,
    size                    : Size,
    correctedRegistrants    : number,
    realRegistrants         : number,
    plannedBuilding         : string,
    chairsAvailable         : number,
    room                    : string,
    professorName           : string,
    professorId             : string,
    day                     : number,
    moduleId                : string,
    subjectName             : string,
    subjectId               : string,
    period                  : string
}
