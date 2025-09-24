'use client'

import {
    sessionColors,
    sessionColorsHover,
    sessionLabels
}                   from "@/components/section/section.config";
import { Badge }    from "@/components/ui/badge";
import { Session }  from "@/types/section.model";


interface Props {
    session     : Session;
    isShort?    : boolean;
    count?      : number;
}


export function SessionName({
    session,
    isShort,
    count
}:Props ) {
    return (
        <Badge
            variant     = "secondary"
            className   = { `${sessionColors[session]} ${sessionColorsHover[session]} text-white` }
            title       = { isShort ?  `${ count } ${sessionLabels[session]}` : undefined }
        >
            { isShort ?
                `${ count }${session}` :
                sessionLabels[session]
            }
        </Badge>
    );
}
