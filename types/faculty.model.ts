
interface Total {
    totalSubjects   : number;
    totalStaff      : number;
    totalRequests   : number;
    totalOffers     : number;
}


export interface FacultyResponse extends Total {
    faculties : Faculty[];
}


export interface Faculty extends Total {
    id              : string;
    name            : string;
    description?    : string;
    isActive        : boolean;
    createdAt       : string;
    updatedAt       : string;
}


export interface CreateFacultyInput {
    name            : string;
    description?    : string;
}


export interface UpdateFacultyInput {
    id              : string;
    name?           : string;
    description?    : string;
    isActive?       : boolean;
}
