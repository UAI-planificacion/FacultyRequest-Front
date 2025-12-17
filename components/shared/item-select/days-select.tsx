'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Day }          from "@/types/request";


export function DaySelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Días',
    enabled     = true
} : Props ): JSX.Element {
    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.DAYS ],
        queryFn     : () => fetchApi<Day[]>({ url: 'days' }),
        enabled
    });


    const memoizeDays = useMemo(() => {
        return data?.map( day => ({
            id      : day.id.toString(),
            label   : day.name,
            value   : day.id.toString()
        }) ) ?? [];
    }, [data]);


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="day">{ label }</Label> }

            { isError ? (
                <div className="space-y-1">
                    <Input
                        placeholder = "ID del día"
                        onChange    = {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined}
                        className   = "h-8"
                    />

                    <span className="text-xs text-muted-foreground">
                        Error al cargar los días. Ingrese el ID manualmente.
                    </span>
                </div>
            ) : (
                <MultiSelectCombobox
                    options             = { memoizeDays }
                    defaultValues       = { defaultValues }
                    onSelectionChange   = { onSelectionChange }
                    placeholder         = { placeholder }
                    disabled            = { isLoading }
                    multiple            = {  multiple }
                />
            )}
        </div>
    );
}
