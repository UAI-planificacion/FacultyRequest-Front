"use client"

import { JSX }              from "react";
import { UseFormReturn }    from "react-hook-form";

import {
	Calendar as CalendarIcon,
	Plus,
	Trash
} from "lucide-react";

import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage
}                           from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger
}                           from "@/components/ui/popover";
import { Button }           from "@/components/ui/button";
import { Calendar }         from "@/components/ui/calendar";
import { ScrollArea }       from "@/components/ui/scroll-area";
import { OfferFormValues }  from "@/components/offer/offer-form";
import { cn }               from "@/lib/utils";


interface OfferDatesProps {
	form: UseFormReturn<OfferFormValues>;
}


export function OfferDates( { form }: OfferDatesProps ): JSX.Element {
	const { watch, setValue }   = form;
	const dates                 = watch( 'startDate' )  || [];
	const endDates              = watch( 'endDate' )    || [];


	/**
	 * Add a new date pair
	 */
	function addDatePair(): void {
		const newStartDates = [ ...dates, new Date() ];
		const newEndDates   = [ ...endDates, new Date() ];

		setValue( 'startDate', newStartDates );
		setValue( 'endDate', newEndDates );
	}


	/**
	 * Remove a date pair
	 */
	function removeDatePair( index: number ): void {
		const newStartDates = dates.filter( ( _, i ) => i !== index );
		const newEndDates   = endDates.filter( ( _, i ) => i !== index );

		setValue( 'startDate', newStartDates );
		setValue( 'endDate', newEndDates );
	}


	/**
	 * Update start date at specific index
	 */
	function updateStartDate( index: number, date: Date | undefined ): void {
		if ( !date ) return;

		const newDates = [ ...dates ];
		newDates[ index ] = date;
		setValue( 'startDate', newDates );
	}


	/**
	 * Update end date at specific index
	 */
	function updateEndDate( index: number, date: Date | undefined ): void {
		if ( !date ) return;

		const newDates = [ ...endDates ];
		newDates[ index ] = date;
		setValue( 'endDate', newDates );
	}


	return (
		<FormItem>
            <div className="flex justify-between items-center gap-4 mb-4">
			    <FormLabel>Fechas de Inicio y Fin *</FormLabel>

                {/* <Button
					type = "button"
					onClick = { addDatePair }
				>
					<Plus className="h-4 w-4 mr-2" />
					Agregar Fecha
				</Button> */}
            </div>

			<FormControl>
                <div className="space-y-4">
                    {dates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay fechas configuradas. Haz clic en "Agregar Fecha" para comenzar.
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            {/* Cabecera flotante fija */}
                            <div className="bg-muted/50 border-b">
                                <div className="flex items-center gap-4 p-3 justify-between">
                                    <div className="flex items-center gap-4 ml-1">
                                        <div className="font-medium text-sm w-52">Fecha de Inicio</div>

                                        <div className="font-medium text-sm w-52">Fecha de Fin</div>
                                    </div>

                                    <div className="font-medium text-sm text-end w-[50px] mr-8">Acciones</div>
                                </div>
                            </div>

                            {/* Contenido con scroll */}
                            <ScrollArea className={ cn( dates.length < 5 ? 'h-auto' : "h-72" )}>
                                <div className="divide-y">
                                    {dates.map( ( dateItem, index ) => (
                                        <div key={index} className="flex items-center justify-between gap-4 p-3 py-2 hover:bg-muted/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-52">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant = "outline"
                                                                className = "w-full justify-start text-left font-normal gap-2"
                                                            >
                                                                <CalendarIcon className="h-4 w-4" />

                                                                { dateItem
                                                                    ? ( dateItem instanceof Date
                                                                        ? dateItem.toLocaleDateString()
                                                                        : new Date( dateItem ).toLocaleDateString()
                                                                    ) : "Seleccionar fecha"
                                                                }
                                                            </Button>
                                                        </PopoverTrigger>

                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode = "single"
                                                                selected = { dateItem instanceof Date ? dateItem : new Date(dateItem) }
                                                                onSelect = {( selectedDate ) => updateStartDate( index, selectedDate )}
                                                                disabled = {( date ) => date < new Date() }
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="w-52">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant = "outline"
                                                                className = "w-full justify-start text-left font-normal gap-2"
                                                            >
                                                                <CalendarIcon className="h-4 w-4" />

                                                                { endDates[index]
                                                                    ? ( endDates[index] instanceof Date
                                                                        ? endDates[index].toLocaleDateString()
                                                                        : new Date(endDates[index]).toLocaleDateString() )
                                                                    : "Seleccionar fecha"
                                                                }
                                                            </Button>
                                                        </PopoverTrigger>

                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode        = "single"
                                                                selected    = { endDates[index] instanceof Date ? endDates[index] : new Date(endDates[index]) }
                                                                onSelect    = {( selectedDate ) => updateEndDate( index, selectedDate )}
                                                                disabled    = {( date ) => {
                                                                    const startDate = dateItem instanceof Date
                                                                        ? dateItem
                                                                        : new Date( dateItem );

                                                                    return date < startDate || date < new Date();
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>

                                            <Button
                                                type        = "button"
                                                variant     = "destructive"
                                                size        = "sm"
                                                onClick     = {() => removeDatePair( index )}
                                                className   = "mr-5 p-2"
                                            >
                                                <Trash className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
			</FormControl>

			<FormMessage />
		</FormItem>
	);
}
