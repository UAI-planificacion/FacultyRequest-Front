'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { SizeResponse } from "@/types/request";


export function SizeSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Tamaños',
    enabled     = true,
    disabled    = false
} : Props ): JSX.Element {
    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SIZE ],
        queryFn     : () => fetchApi<SizeResponse[]>({ url: 'sizes' }),
        enabled
    });


    const memoizedSizes = useMemo(() => {
        return data?.map( size => ({
            id      : size.id,
            label   : `${size.id} ${size.detail}`,
            value   : size.id
        }) ) ?? [];
    }, [data]);


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="size">{ label }</Label> }

            { isError ? (
                <div className="space-y-1">
                    <Input
                        placeholder = "ID del tamaño"
                        onChange    = {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined}
                        className   = "h-8"
                    />

                    <span className="text-xs text-muted-foreground">
                        Error al cargar los tamaños. Ingrese el ID manualmente.
                    </span>
                </div>
            ) : (
                <MultiSelectCombobox
                    options             = { memoizedSizes }
                    defaultValues       = { defaultValues }
                    onSelectionChange   = { onSelectionChange }
                    placeholder         = { placeholder }
                    disabled            = { isLoading || disabled }
                    multiple            = { multiple }
                />
            )}
        </div>
    );
}
