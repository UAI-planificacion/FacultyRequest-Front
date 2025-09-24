'use client'

import { JSX } from "react";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { useSpace } from "@/hooks/use-space";


export function SpaceSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Espacios',
    enabled     = true,
    disabled    = false
} : Props ): JSX.Element {
    const {
        spaces,
        isLoading,
        isError
    } = useSpace({ enabled });


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="space">{ label }</Label> }

            { isError ? (
                <div className="space-y-1">
                    <Input
                        placeholder = "ID del Espacio"
                        onChange    = {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined}
                        className   = "h-8"
                    />

                    <span className="text-xs text-muted-foreground">
                        Error al cargar los espacios. Ingrese el ID manualmente.
                    </span>
                </div>
            ) : (
                <MultiSelectCombobox
                    options             = { spaces }
                    defaultValues       = { defaultValues }
                    onSelectionChange   = { onSelectionChange }
                    placeholder         = { placeholder }
                    disabled            = { isLoading || disabled }
                    multiple            = {  multiple }
                />
            )}
        </div>
    );
}
