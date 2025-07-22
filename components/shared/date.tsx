'use client'

import { Calendar } from "lucide-react"

import { tempoFormat } from "@/lib/utils";

export function ShowDate(
    {
        date
    }: {
        date: Date | string | undefined;
    }
) {
    return (
        <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{tempoFormat( date )}</span>
        </div>
    )
}
