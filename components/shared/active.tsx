'use client'

import { CircleCheckBig, CircleX } from "lucide-react";

import { Badge } from "@/components/ui/badge"

export function ActiveBadge(
    {
        isActive
    }: {
        isActive: boolean;
    }
) {
    return (
        <div className="flex items-center gap-2">
            {isActive ? <CircleCheckBig className="w-4 h-4 text-green-600" /> : <CircleX className="w-4 h-4 text-red-600" />}

            <Badge
                variant={isActive ? 'default' : 'destructive'}
                className={`${isActive ? 'bg-green-600' : 'bg-red-600'} text-white`}
            >
                {isActive ? 'Activo' : 'Inactivo'}
            </Badge>
        </div>
    )
}
