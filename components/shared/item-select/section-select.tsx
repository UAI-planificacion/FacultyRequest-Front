'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }       from "@/consts/key-queries";
import { fetchApi }         from "@/services/fetch";
import { OfferSection }     from "@/types/offer-section.model";


export function SectionSelect({
	defaultValues,
	onSelectionChange,
	label,
	multiple    = false,
	placeholder = 'Seleccionar Sección',
	enabled     = true,
	disabled    = false,
	queryKey    = [ KEY_QUERYS.SECTIONS, 'not-planning' ],
	url         = 'sections/not-planning'
} : Props ): JSX.Element {
	const {
		data,
		isLoading,
		isError,
	} = useQuery({
		queryKey    : queryKey,
		queryFn     : () => fetchApi<OfferSection[]>({ url }),
		enabled
	});


	const memoizeSections = useMemo(() => {
		return data?.map( section => ({
			id      : section.id,
			label   : `${ section.subject.id } - ${ section.code } : ${ new Date( section.startDate ).toLocaleDateString() }-${ new Date( section.endDate ).toLocaleDateString() }`,
			value   : section.id
		}) ) ?? [];
	}, [data]);


	return (
		<div className="space-y-2">
			{ label && <Label htmlFor="section">{ label }</Label> }

			{ isError ? (
				<div className="space-y-1">
					<Input
						placeholder = "ID de la sección"
						onChange    = {( event ) => onSelectionChange ? onSelectionChange( event.target.value ) : undefined}
						className   = "h-8"
					/>

					<span className="text-xs text-muted-foreground">
						Error al cargar las secciones. Ingrese el ID manualmente.
					</span>
				</div>
			) : (
				<MultiSelectCombobox
					options             = { memoizeSections }
					defaultValues       = { defaultValues }
					onSelectionChange   = { onSelectionChange }
					placeholder         = { placeholder }
					disabled            = { isLoading || disabled }
					multiple            = { multiple }
				/>
			)}
		</div>
	);
}
