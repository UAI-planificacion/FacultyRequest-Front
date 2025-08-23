export enum Role {
    ADMIN_FACULTY   = 'ADMIN_FACULTY',
    EDITOR          = 'EDITOR',
    VIEWER          = 'VIEWER',
}


interface BaseStaff {
    name    : string;
    email   : string;
    role    : Role;
}


export interface Staff extends BaseStaff {
    id          : string;
    isActive    : boolean;
    facultyId   : string;
    facultyName : string;
    createdAt   : Date;
    updatedAt   : Date;
}


export interface CreateStaff extends BaseStaff {
    facultyId   : string;
    isActive?   : boolean;
}


export interface UpdateStaff extends Partial<BaseStaff> {
    id          : string;
    isActive    : boolean;
}
