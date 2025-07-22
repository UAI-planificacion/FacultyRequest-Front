'use client'

import { Status } from "@/types/request"
import { Badge } from "../ui/badge"
import { cn, getStatusName } from "@/lib/utils"
import { BadgeCheck, CircleDashed, Eye, OctagonX } from "lucide-react";


export const getStatusColor = ( status: Status ): string => ({
    [Status.PENDING]    : "bg-amber-500",
    [Status.APPROVED]   : "bg-green-500",
    [Status.REJECTED]   : "bg-red-500",
    [Status.REVIEWING]  : "bg-blue-500",
})[status] || "bg-gray-100";

export const getStatusIcon = ( status: Status ) => ({
    [Status.PENDING]    : <CircleDashed className="h-4 w-4"/>,
    [Status.APPROVED]   : <BadgeCheck className="h-4 w-4"/>,
    [Status.REJECTED]   : <OctagonX className="h-4 w-4"/>,
    [Status.REVIEWING]  : <Eye className="h-4 w-4"/>,
})[status] || <CircleDashed className="h-4 w-4"/>;


export function ShowStatus( { status }: { status: Status } ) {
    return (
        <Badge className={cn("gap-2 text-white", getStatusColor( status ))}>
            { getStatusIcon( status )}
            { getStatusName( status )}
        </Badge>
    );
}
