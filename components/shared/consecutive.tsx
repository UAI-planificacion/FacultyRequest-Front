'use client'

import { GripHorizontal } from "lucide-react"
import { Badge } from "../ui/badge"

export function Consecutive(
    {
        isConsecutive,
        className
    }: {
        isConsecutive: boolean;
        className?: string;
    }
) {
    return (
        <Badge className={`items-center flex gap-2 ${isConsecutive ? "bg-sky-500" : "bg-rose-500"} text-white mr-5 ${className}`}>
            <GripHorizontal className="h-4 w-4" />
            {isConsecutive ? "Consecutivo" : "No consecutivo"}
        </Badge>
    )
}