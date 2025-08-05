export type Skill = {
    id : string;
    floor: string;
    min?: number;
    max?: number
}


export type LovVal = {
    id          : string;
    description : string;
    active      : boolean;
    skill       : Skill;
}


export type Space = {
    id          : string,
    description : string;
    lov_vals    : LovVal[];
}
