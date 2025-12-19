'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }	from "@/components/shared/Combobox";
import { Label }				from "@/components/ui/label";
import { Input }				from "@/components/ui/input";
import { Props }				from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }	from "@/consts/key-queries";
import { fetchApi }		from "@/services/fetch";
import { Grade }		from "@/types/grade";


export function GradeSelect({
	defaultValues,
	onSelectionChange,
	label,
	multiple	= true,
	placeholder	= 'Seleccionar Grados',
	enabled		= true
} : Props ): JSX.Element {
	const {
		data,
		isLoading,
		isError,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.GRADES ],
		queryFn		: () => fetchApi<Grade[]>({ url: 'grades' }),
		enabled
	});


	const memoizeGrades = useMemo(() => {
		return data?.map( grade => ({
			id		: grade.id.toString(),
			label	: grade.name,
			value	: grade.id.toString()
		}) ) ?? [];
	}, [data]);


	return (
		<div className="space-y-2">
			{ label && <Label htmlFor="grade">{ label }</Label> }

			{ isError ? (
				<div className="space-y-1">
					<Input
						placeholder	= "ID del grado"
						onChange	= {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined }
						className	= "h-8"
					/>

					<span className="text-xs text-muted-foreground">
						Error al cargar los grados. Ingrese el ID manualmente.
					</span>
				</div>
			) : (
				<MultiSelectCombobox
					options				= { memoizeGrades }
					defaultValues		= { defaultValues }
					onSelectionChange	= { onSelectionChange }
					placeholder			= { placeholder }
					disabled			= { isLoading }
					multiple			= { multiple }
				/>
			)}
		</div>
	);
}