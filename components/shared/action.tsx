'use client'

import { JSX } from "react";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button }           from "@/components/ui/button";
import { useQueryClient }   from "@tanstack/react-query";
import { Role, Staff }      from "@/types/staff.model";
import { KEY_QUERYS }       from "@/consts/key-queries";


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
    const queryClient   = useQueryClient();
    const staff         = queryClient.getQueryData<Staff>([ KEY_QUERYS.STAFF ]);

    return (
        <div className="flex justify-end gap-1.5">
            <Button
                title   = "Editar"
                variant = "outline"
                size    = "icon"
                onClick = {() => editItem( item )}
            >
                { staff?.role === Role.VIEWER
                    ? <Eye className="h-4 w-4 text-blue-500" />
                    : <Pencil className="h-4 w-4 text-blue-500" />
                }
            </Button>

            { staff?.role !== Role.VIEWER &&
                <Button
                    title   = "Eliminar"
                    variant = "outline"
                    size    = "icon"
                    onClick = {() => deleteItem( item )}
                >
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            }
        </div>
    );
}
