'use client'

import { JSX } from "react";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface Props {
    label?          : string;
    placeholder?    : string;
    title           : string;
    setTitle        : ( title: string ) => void;
}


export function SearchInput({
    label,
    placeholder = "Buscar...",
    title,
    setTitle
}: Props ): JSX.Element {
    return (
        <div className="grid space-y-2 w-full">
            {
                label && (
                    <Label htmlFor="search">{ label }</Label>
                )
            }

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                    id			= "search"
                    type		= "search"
                    placeholder	= { placeholder }
                    value		= { title }
                    onChange	= {( e ) => setTitle( e.target.value )}
                    className	= "pl-9"
                />
            </div>
        </div>
    );
}
