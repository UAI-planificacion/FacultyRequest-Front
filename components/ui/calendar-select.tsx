'use client'

import { Calendar as CalendarIcon } from "lucide-react";

import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";


interface CalendarSelectProps {
	value        : Date | string | null | undefined;
	onSelect     : ( date: Date | undefined ) => void;
	placeholder ?: string;
	disabled    ?: ( date: Date ) => boolean;
	className   ?: string;
    disabledButton?: boolean;
}


/**
 * Componente reutilizable para seleccionar fechas con calendario
 */
export function CalendarSelect( {
	value,
	onSelect,
	placeholder = "Seleccionar fecha",
	disabled,
    disabledButton = false,
	className = "w-full"
}: CalendarSelectProps ) {

	/**
	 * Convierte el valor a Date si es necesario
	 */
	const getDateValue = (): Date | undefined => {
		if ( !value ) return undefined;
		if ( value instanceof Date ) return value;
		return new Date( value );
	};


	/**
	 * Formatea la fecha para mostrar en el botón
	 */
	const getDisplayValue = (): string => {
		if ( !value ) return placeholder;
		
		const dateValue = getDateValue();
		if ( !dateValue ) return placeholder;
		
		return dateValue.toLocaleDateString( 'es-ES' );
	};


	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant   = "outline"
					className = { `${className} justify-start text-left font-normal gap-2` }
					disabled  = { disabledButton }
				>
					<CalendarIcon className="h-4 w-4" />
					{ getDisplayValue() }
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-auto p-0">
				<Calendar
					mode     = "single"
					selected = { getDateValue() }
					onSelect = { onSelect }
					disabled = { disabled }
				/>
			</PopoverContent>
		</Popover>
	);
}
