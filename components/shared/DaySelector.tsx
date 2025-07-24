"use client"

import { JSX } from "react";

import { Button }   from "@/components/ui/button";
import { cn }       from "@/lib/utils";
import { daysName } from "@/consts/days-names";


interface DaySelectorProps {
    days        : number[];
    value?      : number[];
    onChange?   : (selectedDays: number[]) => void;
    className?  : string;
    disabled?   : boolean;
}


export function DaySelector({
    days,
    value = [],
    onChange,
    className,
    disabled = false
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
                const dayName       = daysName[dayIndex];

                return (
                    <Button
                        type        = "button"
                        key         = { dayIndex + 1 }
                        variant     = "outline"
                        size        = "sm"
                        onClick     = {() => handleDayToggle( dayIndex + 1)}
                        disabled    = { disabled }
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
