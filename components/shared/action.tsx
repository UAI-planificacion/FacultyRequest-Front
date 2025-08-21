'use client'

import { JSX } from "react";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";


interface Props {
    editItem    : ( obj: any ) => void;
    deleteItem  : ( obj: any ) => void;
    item        : any;
}


export function ActionButton({
    editItem,
    deleteItem,
    item
}: Props ): JSX.Element {
    return (
        <div className="flex justify-end gap-1.5">
            <Button
                variant = "outline"
                size    = "icon"
                onClick = {() => editItem( item )}
            >
                <Pencil className="h-4 w-4 text-blue-500" />
            </Button>

            <Button
                variant = "outline"
                size    = "icon"
                onClick = {() => deleteItem( item )}
            >
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
    );
}
