"use client"

import { JSX } from "react";

import { Button }   from "@/components/ui/button";
import { cn }       from "@/lib/utils";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface DaySelectorProps {
    days        : number[];
    value?      : number[];
    onChange?   : (selectedDays: number[]) => void;
    className?  : string;
}


export function DaySelector({
    days,
    value = [],
    onChange,
    className
}: DaySelectorProps ): JSX.Element {
    const handleDayToggle = ( dayIndex: number ) => {
        const newSelectedDays = value.includes( dayIndex )
            ? value.filter(( day ) => day !== dayIndex )
            : [...value, dayIndex].sort();

        onChange?.( newSelectedDays );
    }


    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {days.map((dayIndex) => {
                const isSelected    = value.includes( dayIndex + 1 );
                const dayName       = DAYS[dayIndex];

                return (
                    <Button
                        type        = "button"
                        key         = { dayIndex + 1 }
                        variant     = "outline"
                        size        = "sm"
                        onClick     = {() => handleDayToggle( dayIndex + 1)}
                        className   = {cn(
                            "transition-all duration-200",
                            isSelected
                            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
                            : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                    >
                        { dayName }
                    </Button>
                );
            })}
        </div>
    );
}
