export enum EnumAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}


export enum Type {
    REQUEST = 'request',
    DETAIL  = 'detail'
}


export interface EmitEvent<T = any> {
    message : T;
    action  : EnumAction;
    type    : Type;
    origin? : string | undefined;
}
