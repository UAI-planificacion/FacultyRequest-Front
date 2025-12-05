'use client'

import {
    sessionColors,
    sessionColorsHover,
    sessionLabels
}                   from "@/components/section/section.config";
import { Badge }    from "@/components/ui/badge";

import { Session } from "@/types/section.model";


interface Props {
    session : Session;
}


export function SessionType({ session }: Props ) {
    return (
        <Badge
            className   = {`text-sm font-medium text-white py-0 ${sessionColors[session]} ${sessionColorsHover[session]}`}
            title       = { sessionLabels[session] }
        >
            {sessionLabels[session]}
        </Badge>
    );
}
