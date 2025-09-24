'use client'

import { JSX } from "react";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Props }                from "@/components/shared/item-select/select-props";

import { Session } from "@/types/section.model";


const sessionOptions =  [
    { label: 'Cátedra',     value: Session.C },
    { label: 'Ayudantía',   value: Session.A },
    { label: 'Taller',      value: Session.T },
    { label: 'Laboratorio', value: Session.L }
];


export function SessionSelect({
    defaultValues,
    onSelectionChange,
    multiple    = true,
    label,
    placeholder = 'Seleccionar Sesiones'
} : Props ): JSX.Element {
    return (
        <div className="space-y-2">
            { label && <Label htmlFor="session-select">{ label }</Label> }

            <MultiSelectCombobox
                options             = { sessionOptions }
                defaultValues       = { defaultValues }
                onSelectionChange   = { onSelectionChange }
                placeholder         = { placeholder }
                multiple            = {  multiple }
            />
        </div>
    );
}
