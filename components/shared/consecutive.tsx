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
            'items-center flex gap-2 text-white mr-5', className,
            isConsecutive ? "bg-sky-500 hover:bg-sky-500/90" : "bg-rose-500 hover:bg-rose-500/90"
        )}>
            <GripHorizontal className="h-4 w-4" />
            {isConsecutive ? "Consecutivo" : "No consecutivo"}
        </Badge>
    );
}
