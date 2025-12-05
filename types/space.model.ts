export type Skill = {
    floor       : number | null;
    capacity    : number;
    aforo       : number | null;
    mts2        : string | null;
    foto        : string | null;
    num_enchufe : number | null;
    type        : string;
    size        : string;
    min?        : number | null;
    max?        : number | null;
    building    : string;
}


export type LovVal = {
    idlovvals   : number;
    description : string;
    active      : boolean;
    skill       : Skill;
    created_at  : string;
    comment     : string | null
}


export type Space = {
    idlov       : number,
    description : string;
    lov_vals    : LovVal[]  | null;
    created_at  : string    | null;
    skill       : any       | null;
    active      : boolean;
}
