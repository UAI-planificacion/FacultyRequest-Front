'use client'

import { useTheme }             from "next-themes";
import { Sun, Moon, Computer }  from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
}                   from "@/components/ui/dropdown-menu";
import { Button }   from "@/components/ui/button";


export function Theme() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white">
                    { theme === 'light' && 
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    }

                    { theme === 'dark' &&
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    }

                    { theme === 'system' &&
                        <Computer className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    }

                    <span className="sr-only">Cambiar tema</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-black text-white border-zinc-700">
                <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center justify-between">
                    Claro

                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center justify-between">
                    Oscuro

                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center justify-between">
                    Sistema

                    <Computer className="h-[1.2rem] w-[1.2rem]" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
