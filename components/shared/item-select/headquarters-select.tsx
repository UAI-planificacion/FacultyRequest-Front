'use client'

import { JSX } from "react";

import {
    MultiSelectCombobox,
    GroupOption }
                    from "@/components/shared/Combobox";
import { Label }    from "@/components/ui/label";
import { Props }    from "@/components/shared/item-select/select-props";


const HEADQUARTERS_DATA: GroupOption[] = [
	{
		id      : 'penalolen',
		name    : 'Peñalolén',
		options : [
			{ value : 'PREGRADO_A', label : 'Edificio Pregrado A' },
			{ value : 'PREGRADO_B', label : 'Edificio Pregrado B' },
			{ value : 'POSTGRADO_C', label : 'Edificio Postgrado C' },
			{ value : 'TALLERES_D', label : 'Edificio Talleres D' },
			{ value : 'TALLERES_E', label : 'Edificio Talleres E' },
			{ value : 'PREGRADO_F', label : 'Edificio Pregrado F' },
		]
	},
	{
		id      : 'errazuriz',
		name    : 'Errázuriz',
		options : [
			{ value : 'ERRAZURIZ', label : 'Edificio Errázuriz' }
		]
	},
	{
		id      : 'vitacura',
		name    : 'Vitacura',
		options : [
			{ value : 'VITACURA', label : 'Edificio Vitacura' }
		]
	},
	{
		id      : 'vina-del-mar',
		name    : 'Viña del Mar',
		options : [
			{ value : 'VINA_A', label : 'Edificio A' },
			{ value : 'VINA_B', label : 'Edificio B' },
			{ value : 'VINA_C', label : 'Edificio C' },
			{ value : 'VINA_D', label : 'Edificio D' },
			{ value : 'VINA_E', label : 'Edificio E' },
			{ value : 'VINA_F', label : 'Edificio F' },
		]
	}
];


export function HeadquartersSelect({
	defaultValues,
	onSelectionChange,
	label,
	multiple    = true,
	placeholder = 'Seleccionar Edificios',
	disabled    = false,
    className   = ''
} : Props ): JSX.Element {
	return (
		<div className={`space-y-2 ${className}`}>
			{ label && <Label htmlFor="headquarters">{ label }</Label> }

			<MultiSelectCombobox
				options             = { HEADQUARTERS_DATA }
				defaultValues       = { defaultValues }
				onSelectionChange   = { onSelectionChange }
				placeholder         = { placeholder }
				disabled            = { disabled }
				multiple            = { multiple }
			/>
		</div>
	);
}
