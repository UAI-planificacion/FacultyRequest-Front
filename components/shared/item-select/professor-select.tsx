'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Professor }    from "@/types/professor";


export function ProfessorSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Profesores',
    enabled     = true
} : Props ): JSX.Element {
    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.PROFESSORS ],
        queryFn     : () => fetchApi<Professor[]>({ url: 'professors' }),
        enabled
    });


    const memoizeProfessors = useMemo(() => {
        return data?.map( professor => ({
            id      : professor.id.toString(),
            label   : `${professor.id} - ${professor.name}`,
            value   : professor.id.toString()
        }) ) ?? [];
    }, [data]);


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="professors">{ label }</Label> }

            { isError ? (
                <div className="space-y-1">
                    <Input
                        placeholder = "ID del profesor"
                        onChange    = {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined}
                        className   = "h-8"
                    />

                    <span className="text-xs text-muted-foreground">
                        Error al cargar los profesores. Ingrese el ID manualmente.
                    </span>
                </div>
            ) : (
                <MultiSelectCombobox
                    options             = { memoizeProfessors }
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
