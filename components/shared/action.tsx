'use client'

import { JSX } from "react";

import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";


interface Props {
    editItem            : ( obj: any ) => void;
    deleteItem          : ( obj: any ) => void;
    item                : any;
    isDisabledEdit?      : boolean;
    isDisabledDelete?    : boolean;
}


export function ActionButton({
    editItem,
    deleteItem,
    item,
    isDisabledEdit = false,
    isDisabledDelete = false,
}: Props ): JSX.Element {
    return (
        <div className="flex justify-end gap-1.5">
            <Button
                title       = "Editar"
                variant     = "outline"
                size        = "icon"
                disabled    = { isDisabledEdit }
                onClick     = {() => editItem( item )}
            >
                <Edit className="h-4 w-4 text-blue-500" />
            </Button>

            <Button
                title       = "Eliminar"
                variant     = "outline"
                size        = "icon"
                disabled    = { isDisabledDelete }
                onClick     = {() => deleteItem( item )}
            >
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
    );
}
