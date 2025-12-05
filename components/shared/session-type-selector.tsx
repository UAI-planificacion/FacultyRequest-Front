'use client'

import { JSX, useMemo, useCallback } from "react";

import {
    ToggleGroup,
    ToggleGroupItem
}                           from "@/components/ui/toggle-group";
import { Session }			from "@/types/section.model";
import { sessionLabels }	from "@/components/section/section.config";


interface Props {
	multiple		: boolean;
	value			: Session[] | Session | null;
	onValueChange	: ( value: Session[] | Session | null ) => void;
	defaultValue?	: Session[] | Session | null;
	allowDeselect?	: boolean;
	className?		: string;
    isShort?        : boolean;

}


// interface MultiSelectProps {
// 	multiple		: true;
// 	value			: Session[];
// 	onValueChange	: ( value: Session[] ) => void;
// 	defaultValue?	: Session[];
// 	allowDeselect?	: boolean;
// 	className?		: string;
//     isShort?        : boolean;
// }


// type Props = SingleSelectProps | MultiSelectProps;


/**
 * SessionTypeSelector Component
 * 
 * Reusable session type selector with toggle group.
 * Displays session initials (C, A, T, L) with full names in tooltips.
 * Uses session-specific colors from section.config.ts
 * 
 * @param multiple - If true, allows multiple selection. Default: false
 * @param allowDeselect - If true, allows deselecting items. Default: true
 */
export function SessionTypeSelector({
		multiple = false,
		value,
		onValueChange,
		defaultValue,
		allowDeselect = true,
		className = "w-full",
		isShort = true
}: Props ): JSX.Element {
	// const {
	// 	multiple = false,
	// 	value,
	// 	onValueChange,
	// 	defaultValue,
	// 	allowDeselect = true,
	// 	className = "w-full",
	// 	isShort = false
	// } = props;

	// Memoizar el valor del toggle group
	const toggleValue = useMemo(() => {
		if ( multiple ) {
			return value as string[];
		}
		return ( value as Session | null ) || '';
	}, [ multiple, value ]);

	// Memoizar el defaultValue del toggle group
	const toggleDefaultValue = useMemo(() => {
		if ( multiple ) {
			return defaultValue as string[] | undefined;
		}
		return ( defaultValue as Session | null ) || undefined;
	}, [ multiple, defaultValue ]);

	// Handler para cambios de valor
	const handleValueChange = useCallback(( val: string | string[] ) => {
		if ( multiple ) {
			const arrayVal = val as string[];
			// Si allowDeselect es false y se intenta deseleccionar el último, no hacer nada
			if ( !allowDeselect && arrayVal.length === 0 ) {
				return;
			}
			( onValueChange as ( value: Session[] ) => void )( arrayVal as Session[] );
		} else {
			const stringVal = val as string;
			// Si allowDeselect es false y el valor es vacío, no hacer nada
			if ( !allowDeselect && ( stringVal === '' || !stringVal )) {
				return;
			}

			if ( stringVal === '' || !stringVal ) {
				( onValueChange as ( value: Session | null ) => void )( null );
			} else {
				( onValueChange as ( value: Session | null ) => void )( stringVal as Session );
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
				value		= { Session.C }
				aria-label	= { sessionLabels[Session.C] }
				className	= "flex-1 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none border-t border-l border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-blue-500 data-[state=on]:dark:bg-blue-600 data-[state=on]:text-white data-[state=on]:hover:bg-blue-600 data-[state=on]:dark:hover:bg-blue-700"
				title		= { sessionLabels[Session.C] }
			>
				{ isShort ? 'C' : 'Cátedra' }
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= { Session.A }
				aria-label	= { sessionLabels[Session.A] }
				className	= "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-green-500 data-[state=on]:dark:bg-green-600 data-[state=on]:text-white data-[state=on]:hover:bg-green-600 data-[state=on]:dark:hover:bg-green-700"
				title		= { sessionLabels[Session.A] }
			>
				{ isShort ? 'A' : 'Ayudantía' }
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= { Session.T }
				aria-label	= { sessionLabels[Session.T] }
				className	= "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-orange-500 data-[state=on]:dark:bg-orange-600 data-[state=on]:text-white data-[state=on]:hover:bg-orange-600 data-[state=on]:dark:hover:bg-orange-700"
				title		= { sessionLabels[Session.T] }
			>
				{ isShort ? 'T' : 'Taller' }
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= { Session.L }
				aria-label	= { sessionLabels[Session.L] }
				className	= "flex-1 rounded-tl-none rounded-bl-none rounded-tr-lg rounded-br-lg border-t border-r border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-purple-500 data-[state=on]:dark:bg-purple-600 data-[state=on]:text-white data-[state=on]:hover:bg-purple-600 data-[state=on]:dark:hover:bg-purple-700"
				title		= { sessionLabels[Session.L] }
			>
				{ isShort ? 'L' : 'Laboratorio' }
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
