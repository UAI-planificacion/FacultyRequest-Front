'use client'

import { JSX, useMemo, useCallback } from "react";

import { ToggleGroup, ToggleGroupItem }	from "@/components/ui/toggle-group";
import { CircleDashed, Eye, BadgeCheck, OctagonX } from "lucide-react";

import { Status } from "@/types/request";


interface SingleSelectProps {
	multiple		: false;
	value			: Status;
	onValueChange	: ( value: Status ) => void;
	defaultValue?	: Status;
	allowDeselect?	: boolean;
	className?		: string;
}


interface MultiSelectProps {
	multiple		: true;
	value			: Status[];
	onValueChange	: ( value: Status[] ) => void;
	defaultValue?	: Status[];
	allowDeselect?	: boolean;
	className?		: string;
}


type Props = SingleSelectProps | MultiSelectProps;


/**
 * ChangeStatus Component
 * 
 * Reusable status selector with toggle group for Request and PlanningChange forms.
 * Displays 4 status options: PENDING, REVIEWING, APPROVED, REJECTED with icons and colors.
 * 
 * @param multiple - If true, allows multiple selection. Default: false
 * @param allowDeselect - If true, allows deselecting items. Default: true
 */
export function ChangeStatus( props: Props ): JSX.Element {
	const {
		multiple = false,
		value,
		onValueChange,
		defaultValue,
		allowDeselect = true,
		className = "w-full"
	} = props;

	// Memoizar el valor del toggle group
	const toggleValue = useMemo(() => {
		if ( multiple ) {
			return value as string[];
		}
		return ( value as Status ) || '';
	}, [ multiple, value ]);

	// Memoizar el defaultValue del toggle group
	const toggleDefaultValue = useMemo(() => {
		if ( multiple ) {
			return defaultValue as string[] | undefined;
		}
		return ( defaultValue as Status ) || undefined;
	}, [ multiple, defaultValue ]);

	// Handler para cambios de valor
	const handleValueChange = useCallback(( val: string | string[] ) => {
		if ( multiple ) {
			const arrayVal = val as string[];
			// Si allowDeselect es false y se intenta deseleccionar el último, no hacer nada
			if ( !allowDeselect && arrayVal.length === 0 ) {
				return;
			}
			( onValueChange as ( value: Status[] ) => void )( arrayVal as Status[] );
		} else {
			const stringVal = val as string;
			// Si allowDeselect es false y el valor es vacío, no hacer nada
			if ( !allowDeselect && ( stringVal === '' || !stringVal )) {
				return;
			}

			if ( stringVal && stringVal !== '' ) {
				( onValueChange as ( value: Status ) => void )( stringVal as Status );
			}
		}
	}, [ multiple, allowDeselect, onValueChange ]);

	return (
		<ToggleGroup
			type			= { multiple ? "multiple" : "single" }
			value			= { toggleValue as any }
			onValueChange	= { handleValueChange as any }
			className		= { className }
			defaultValue	= { toggleDefaultValue as any }
		>
			<ToggleGroupItem
				value		= "PENDING"
				aria-label	= "Pendiente"
				className	= "flex-1 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none border-t border-l border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-amber-400 data-[state=on]:dark:bg-amber-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-amber-500 data-[state=on]:dark:hover:bg-amber-600"
			>
				<CircleDashed className="mr-2 h-4 w-4"/>
				Pendiente
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= "REVIEWING"
				aria-label	= "Revisando"
				className	= "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-blue-400 data-[state=on]:dark:bg-blue-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-blue-500 data-[state=on]:dark:hover:bg-blue-600"
			>
				<Eye className="mr-2 h-4 w-4"/>
				Revisando
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= "APPROVED"
				aria-label	= "Aprobado"
				className	= "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-green-400 data-[state=on]:dark:bg-green-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-green-500 data-[state=on]:dark:hover:bg-green-600"
			>
				<BadgeCheck className="mr-2 h-4 w-4"/>
				Aprobado
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= "REJECTED"
				aria-label	= "Rechazado"
				className	= "flex-1 rounded-tl-none rounded-bl-none rounded-tr-lg rounded-br-lg border-t border-r border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-red-400 data-[state=on]:dark:bg-red-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-red-500 data-[state=on]:dark:hover:bg-red-600"
			>
				<OctagonX className="mr-2 h-4 w-4"/>
				Rechazado
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
