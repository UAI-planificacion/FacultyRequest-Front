import { Role } from "@/types/staff.model";


export interface StaffComment {
    name    : string;
    email   : string;
    role    : Role;
}


export interface Comment {
    id                  : string;
    content             : string;
    staff               : StaffComment;
    requestSessionId    : string    | null;
    planningChangeId    : string    | null;
    createdAt           : Date      | string;
    updatedAt           : Date      | string;
}


export interface CreateComment {
    content             : string;
    requestId?          : string | null | undefined;
    requestDetailId?    : string | null | undefined;
    staffId             : string;
}


export interface UpdateComment {
    id      : string;
    content : string;
}
