'use client'

import { JSX, useMemo } from "react";

import { Label }                from "@/components/ui/label";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Props }                from "@/components/shared/item-select/select-props";

import { SpaceType }    from "@/types/request-detail.model";
import { getSpaceType } from "@/lib/utils";
import { useSpace }     from "@/hooks/use-space";


interface SpaceTypeSelectProps extends Props {
	buildingFilter? : string;
}


export function SpaceTypeSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple        = false,
    placeholder     = 'Selecciona un tipo de espacio',
    disabled        = false,
    className,
    buildingFilter
} : SpaceTypeSelectProps ): JSX.Element {
	// Obtener spaces data para filtrar por building
	const {
		spacesData,
		isLoading
	} = useSpace({ enabled: !!buildingFilter });


    const spaceTypeOptions = useMemo(() => {
		// Si hay filtro por building, filtrar types disponibles en ese building
		if ( buildingFilter ) {
			const availableTypes = new Set(
				spacesData
					.filter( space => space.building === buildingFilter )
					.map( space => space.type )
			);

			const filteredOptions = Object.values( SpaceType )
				.filter( spaceType => availableTypes.has( spaceType ))
				.map(( spaceType ) => ({
					id      : spaceType,
					label   : getSpaceType( spaceType ),
					value   : spaceType
				}));

			return [
				{ id: 'none', label: 'Sin especificar', value: 'none' },
				...filteredOptions
			];
		}

		// Sin filtro, retornar todos
        const options = Object.values( SpaceType ).map(( spaceType ) => ({
            id      : spaceType,
            label   : getSpaceType( spaceType ),
            value   : spaceType
        }));
        
        return [
            { id: 'none', label: 'Sin especificar', value: 'none' },
            ...options
        ];
    }, [ buildingFilter, spacesData ]);


    return (
        <div className={`space-y-2 ${className}`}>
            { label && <Label htmlFor="spaceType">{ label }</Label> }

            <MultiSelectCombobox
                options             = { spaceTypeOptions }
                defaultValues       = { defaultValues }
                onSelectionChange   = { onSelectionChange }
                placeholder         = { placeholder }
                disabled            = { isLoading || disabled }
                multiple            = { multiple }
            />
        </div>
    );
}
