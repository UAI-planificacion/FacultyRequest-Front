'use client'

import { JSX } from "react";


import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { useCostCenter } from "@/hooks/use-cost-center";


export function CostCenterSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Centro de Costos',
    className   = ''
} : Props ): JSX.Element {
    const {
        costCenter,
        isLoading,
        isError
    } = useCostCenter({ enabled: true });


    return (
        <div className={ `space-y-2 ${ className }` }>
            { label && <Label htmlFor="cost-center">{ label }</Label> }

            { isError ? (
                <div className="space-y-1">
                    <Input
                        placeholder = "ID del centro de costo"
                        onChange    = {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined}
                        className   = "h-8"
                    />

                    <span className="text-xs text-muted-foreground">
                        Error al cargar los centros de costos. Ingrese el ID manualmente.
                    </span>
                </div>
            ) : (
                <MultiSelectCombobox
                    options             = { costCenter }
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
