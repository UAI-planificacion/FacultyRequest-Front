
export interface FacultyResponse {
    totalSubjects   : number;
    totalPersonnel  : number;
    totalRequests   : number;
    faculties       : Faculty[];
}


export interface Faculty {
    id              : string;
    name            : string;
    description?    : string;
    isActive        : boolean;
    totalSubjects   : number;
    totalPersonnel  : number;
    totalRequests   : number;
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
