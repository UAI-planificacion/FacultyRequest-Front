'use client'

import React from 'react';

import { Control } from 'react-hook-form';

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
}								from '@/components/ui/form';
import { Input }				from '@/components/ui/input';
import { SessionTypeSelector }  from '@/components/shared/session-type-selector';
import { cn }                   from '@/lib/utils';


interface SessionFormFieldsProps {
	control				: Control<any>;
	sessionRequired?	: boolean;
	onSessionChange?	: () => void;
	showSessionType?	: boolean;
}


export function SessionFormFields({
	control,
	sessionRequired = false,
	onSessionChange,
	showSessionType = true
}: SessionFormFieldsProps ) {
	return (
		<>
			{/* Session Name Field */}
			{ showSessionType && (
				<FormField
					control = { control }
					name    = "name"
					render  = {({ field }) => (
						<FormItem>
							<FormLabel>Tipo de Sesión</FormLabel>

							<FormControl>
								<SessionTypeSelector
									multiple        = { false }
									value           = { field.value || null }
									isShort         = { false }
									onValueChange   = {( value ) => {
										field.onChange( value );
										onSessionChange?.();
									}}
									allowDeselect   = { true }
								/>
							</FormControl>

							{ sessionRequired && <span className='text-red-700'>Debe seleccionar un tipo de sesión</span> }
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Corrected Registrants Field */}
				<FormField
					control = { control }
					name    = "correctedRegistrants"
					render  = {({ field }) => (
						<FormItem>
							<FormLabel>Inscritos Corregidos</FormLabel>

							<FormControl>
								<Input
									type        = "number"
									placeholder = "Número de inscritos corregidos"
									{...field}
									value       = { field.value || '' }
									onChange    = {( e ) => field.onChange( e.target.value ? parseInt( e.target.value ) : null )}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Real Registrants Field */}
				<FormField
					control = { control }
					name    = "realRegistrants"
					render  = {({ field }) => (
						<FormItem>
							<FormLabel>Inscritos Reales</FormLabel>

							<FormControl>
								<Input
									type        = "number"
									placeholder = "Número de inscritos reales"
									{...field}
									value       = { field.value || '' }
									onChange    = {( e ) => field.onChange( e.target.value ? parseInt( e.target.value ) : null )}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Planned Building Field */}
				<FormField
					control = { control }
					name    = "plannedBuilding"
					render  = {({ field }) => (
						<FormItem>
							<FormLabel>Edificio Planificado</FormLabel>

							<FormControl>
								<Input
									placeholder = "Edificio planificado"
									{...field}
									value       = { field.value || '' }
									onChange    = {( e ) => field.onChange( e.target.value || null )}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Chairs Available Field */}
				<FormField
					control = { control }
					name    = "chairsAvailable"
					render  = {({ field }) => {
						const isNegative = field.value !== null && field.value !== undefined && field.value < 0;

						return (
							<FormItem>
								<FormLabel className={ cn( isNegative && "text-destructive" ) }>
									Sillas Disponibles
								</FormLabel>

								<FormControl>
									<Input
										type        = "number"
										placeholder = "Número de sillas disponibles"
										{...field}
										value       = { field.value || '' }
										onChange    = {( e ) => field.onChange( e.target.value ? parseInt( e.target.value ) : null )}
										className   = { cn( isNegative && "border-destructive focus-visible:ring-destructive" ) }
									/>
								</FormControl>

								{ isNegative && (
									<p className="text-sm text-destructive">
										El número de sillas no puede ser negativo
									</p>
								)}

								<FormMessage />
							</FormItem>
						);
					}}
				/>
			</div>
		</>
	);
}
