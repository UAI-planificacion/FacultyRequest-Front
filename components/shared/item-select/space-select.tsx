'use client'

import { JSX, useMemo } from "react";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { useSpace } from "@/hooks/use-space";


interface SpaceSelectProps extends Props {
	buildingFilter? : string;
}


export function SpaceSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple        = true,
    placeholder     = 'Seleccionar Espacios',
    enabled         = true,
    disabled        = false,
    buildingFilter
} : SpaceSelectProps ): JSX.Element {
    const {
        spaces,
		spacesData,
        isLoading,
        isError
    } = useSpace({ enabled });


	// Filtrar spaces por building si se proporciona el filtro
	const filteredSpaces = useMemo(() => {
		if ( !buildingFilter ) return spaces;

		const availableSpaceIds = new Set(
			spacesData
				.filter( space => space.building === buildingFilter )
				.map( space => space.id )
		);

		return spaces.filter( space => space.id && availableSpaceIds.has( space.id ));
	}, [ spaces, spacesData, buildingFilter ]);


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
                    options             = { filteredSpaces }
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
