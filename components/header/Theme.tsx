'use client'

import { useState, useEffect, JSX } from "react";

import { useTheme }             from "next-themes";
import { Sun, Moon, Computer }  from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
}                   from "@/components/ui/dropdown-menu";
import { Button }   from "@/components/ui/button";


const renderIcon = ( theme: string = 'system' ): JSX.Element => ({
    light   : <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />,
    dark    : <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />,
    system  : <Computer className="h-[1.2rem] w-[1.2rem] transition-all" />,
})[theme]!;


export function Theme() {
    const { theme, setTheme }   = useTheme();
    const [mounted, setMounted] = useState( false );


    useEffect(() => {
        setMounted( true );
    }, []);


    if ( !mounted ) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant     = "outline"
                    size        = "icon"
                    className   = "bg-black text-white border-zinc-700"
                    title       = { `Cambiar tema: (${theme})` }
                >
                    { renderIcon( theme )}
                    <span className="sr-only">Cambiar tema</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick   = {() => setTheme("light")}
                    className = "flex items-center justify-between"
                >
                    Claro

                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick   = {() => setTheme("dark")}
                    className = "flex items-center justify-between"
                >
                    Oscuro

                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick   = {() => setTheme("system")}
                    className = "flex items-center justify-between"
                >
                    Sistema

                    <Computer className="h-[1.2rem] w-[1.2rem]" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
