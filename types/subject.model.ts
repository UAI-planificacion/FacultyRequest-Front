export interface Subject {
    id              : string;
    facultyId       : string;
    name            : string;
    isActive        : boolean;
    students        : number;
    startDate?      : Date;
    endDate?        : Date;
    createdAt       : Date;
    updatedAt       : Date;
    costCenterId    : string;
}
