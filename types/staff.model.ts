export enum Role {
    ADMIN   = 'ADMIN',
    EDITOR  = 'EDITOR',
    VIEWER  = 'VIEWER',
}


interface BaseStaff {
    name        : string;
    email       : string;
    role        : Role;
}


export interface Staff extends BaseStaff {
    id          : string;
    isActive    : boolean;
    facultyId   : string;
    facultyName : string;
    createdAt   : Date;
    updatedAt   : Date;
}
