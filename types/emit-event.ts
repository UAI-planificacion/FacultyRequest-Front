export enum EnumAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}


export enum Type {
    REQUEST         = 'request',
    REQUEST_SESSION = 'request_session',
    PLANNING_CHANGE = 'planning_change',
    COMMENT         = 'comment'
}


export interface EmitEvent<T = any> {
    message : T;
    action  : EnumAction;
    type    : Type;
    origin? : string | undefined;
}
