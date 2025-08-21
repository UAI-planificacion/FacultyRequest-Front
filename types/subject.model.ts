interface BaseSubject {
    id              : string;
    name            : string;
    startDate       : Date[];
    endDate         : Date[];
    students        : number;
    costCenterId    : string;
    isEnglish       : boolean;
}


export interface Subject extends BaseSubject {
    facultyId       : string;
    isActive        : boolean;
    createdAt       : Date;
    updatedAt       : Date;
}


export interface CreateSubject extends BaseSubject {
    facultyId       : string;
}


export interface UpdateSubject extends Partial<BaseSubject> {}
