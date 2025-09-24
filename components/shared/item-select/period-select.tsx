'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { format }   from "@formkit/tempo";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Period }       from "@/types/periods.model";


function formatDate( period : Period ): string {
    if ( !period.startDate || !period.endDate ) return '';

    return ` (${format( period.startDate, 'short' )} - ${format( period.endDate, 'short' )})`;
}


export function PeriodSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Periodos',
    enabled     = true
} : Props ): JSX.Element {
    const {
        data,
        isLoading,
        isError
    } = useQuery<Period[]>({
        queryKey: [KEY_QUERYS.PERIODS],
        queryFn : () => fetchApi<Period[]>({ url: 'periods' }),
        enabled
    });


    const memoizePeriods = useMemo(() => {
        return data?.map( period => ({
            id      : period.id,
            label   : `${period.id} - ${ period.name }${ formatDate( period )}`,
            value   : period.id
        }) ) ?? [];
    }, [data]);


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="period">{ label }</Label> }

            { isError ? (
                <div className="space-y-1">
                    <Input
                        placeholder = "ID del período"
                        onChange    = {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined}
                        className   = "h-8"
                    />

                    <span className="text-xs text-muted-foreground">
                        Error al cargar los períodos. Ingrese el ID manualmente.
                    </span>
                </div>
            ) : (
                <MultiSelectCombobox
                    options             = { memoizePeriods }
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
