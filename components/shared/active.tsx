'use client'

import { CircleCheckBig, CircleX } from "lucide-react";

import { Badge } from "@/components/ui/badge"

interface Props {
    isActive        : boolean;
    activeText?     : string;
    inactiveText?   : string
}


export function ActiveBadge({
    isActive,
    activeText      = 'Activo',
    inactiveText    = 'Inactivo'
}: Props ) {
    return (
        <div className="flex items-center gap-2">
            { isActive
                ? <CircleCheckBig className="w-4 h-4 text-green-600" />
                : <CircleX className="w-4 h-4 text-red-600" />
            }

            <Badge
                variant     = { isActive ? 'default' : 'destructive' }
                className   = { `${isActive ? 'bg-green-600 hover:bg-green-600/80' : 'bg-red-600 hover:bg-red-600/80'} text-white` }
            >
                { isActive ? activeText : inactiveText }
            </Badge>
        </div>
    );
}
