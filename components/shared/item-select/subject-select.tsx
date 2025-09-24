'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Props }                from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Subject }      from "@/types/subject.model";


export function SubjectSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar asignaturas',
    enabled     = true,
    queryKey    = [ KEY_QUERYS.SUBJECTS ],
    url
} : Props ): JSX.Element {
    const {
        data,
        isLoading,
        isError
    } = useQuery<Subject[]>({
        queryKey,
        queryFn : () => fetchApi({
            url: url ? `subjects/all/${url}` : 'subjects'
        }),
        enabled
    });


    const memoizedSubjects = useMemo(() => {
        return data?.map( subject => ({
            id      : subject.id,
            label   : `${subject.id} ${subject.name}`,
            value   : subject.id
        }) ) ?? [];
    }, [data]);


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="subject-filter">{ label }</Label> }

            <MultiSelectCombobox
                options             = { memoizedSubjects }
                defaultValues       = { defaultValues }
                onSelectionChange   = { onSelectionChange }
                placeholder         = { placeholder }
                disabled            = { isLoading }
                multiple            = {  multiple }
            />

            { isError && 
                <span className="text-sm text-red-500">Error al cargar asignaturas</span>
            }
        </div>
    );
}
