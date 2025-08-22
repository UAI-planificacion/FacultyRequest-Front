'use client'

import { JSX } from "react";

import { GripHorizontal } from "lucide-react";

import { Badge }    from "@/components/ui/badge";
import { cn }       from "@/lib/utils";


export function Consecutive(
    {
        isConsecutive,
        className
    }: {
        isConsecutive: boolean;
        className?: string;
    }
): JSX.Element {
    return (
        <Badge className={cn(
            'items-center inline-flex gap-1.5 text-white text-xs px-2 py-0.5 w-fit', className,
            isConsecutive ? "bg-sky-500 hover:bg-sky-500/90" : "bg-rose-500 hover:bg-rose-500/90"
        )}>
            <GripHorizontal className="h-3 w-3" />

            <span className="whitespace-nowrap">
                {isConsecutive ? "Consecutivo" : "No consecutivo"}
            </span>
        </Badge>
    );
}
