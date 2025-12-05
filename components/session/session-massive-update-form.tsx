'use client'

import React, { useEffect, useState } from 'react';

import { useForm }      from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import * as z           from 'zod';

import {
	useMutation,
	useQueryClient
}                   from '@tanstack/react-query';
import { toast }    from 'sonner';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
}                                   from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel
}                                   from '@/components/ui/form';
import {
	Card,
	CardContent
}                                   from '@/components/ui/card';
import { Button }                   from '@/components/ui/button';
import { Switch }                   from '@/components/ui/switch';
import { SessionFormFields }        from '@/components/session/session-form-fields';
import { SpaceSelect }              from '@/components/shared/item-select/space-select';
import { ProfessorSelect }          from '@/components/shared/item-select/professor-select';

import { UpdateMassiveSessionRequest }  from '@/types/session-request.model';
import { fetchApi, Method }             from '@/services/fetch';
import { KEY_QUERYS }                   from '@/consts/key-queries';
import { errorToast, successToast }     from '@/config/toast/toast.config';
import { Session }                      from '@/types/section.model';


interface Props {
	isOpen      : boolean;
	onClose     : () => void;
	ids         : string[];
	onSuccess?  : () => void;
}


const formSchema = z.object({
	name                    : z.nativeEnum( Session ).nullable().optional(),
	isEnglish               : z.boolean().nullable().optional(),
	correctedRegistrants    : z.number().nullable().optional(),
	realRegistrants         : z.number().nullable().optional(),
	plannedBuilding         : z.string().nullable().optional(),
	chairsAvailable         : z.number().nullable().optional(),
	professorId             : z.string().nullable().optional(),
	spaceId                 : z.string().nullable().optional(),
});


type FormData = z.infer<typeof formSchema>;


export function SessionMassiveUpdateForm({
	isOpen,
	onClose,
	ids,
	onSuccess
}: Props ) {
	const queryClient                                       = useQueryClient();
	const [ sessionRequired, setSessionRequired ]           = useState<boolean>( false );
	const [ englishForAll, setEnglishForAll ]               = useState<boolean>( false );
	const [ enableSpaceProfessor, setEnableSpaceProfessor ] = useState<boolean>( false );


	const form = useForm<FormData>({
		resolver    : zodResolver( formSchema ),
		defaultValues: {
			name                    : null,
			isEnglish               : false,
			correctedRegistrants    : null,
			realRegistrants         : null,
			plannedBuilding         : null,
			chairsAvailable         : null,
			professorId             : null,
			spaceId                 : null,
		}
	});


	useEffect(() => {
		if ( isOpen ) {
			form.reset({
				name                    : null,
				isEnglish               : false,
				correctedRegistrants    : null,
				realRegistrants         : null,
				plannedBuilding         : null,
				chairsAvailable         : null,
				professorId             : null,
				spaceId                 : null,
			});
			setSessionRequired( false );
			setEnglishForAll( false );
			setEnableSpaceProfessor( false );
		}
	}, [ isOpen, form ]);


	const updateSessionApi = async ( updatedSession: UpdateMassiveSessionRequest ): Promise<void> =>
		fetchApi({
			url     : 'sessions/update/massive',
			method  : Method.PATCH,
			body    : updatedSession
		});


	const updateSessionMutation = useMutation({
		mutationFn: updateSessionApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });

			onClose();
			toast( 'Sesiones actualizadas exitosamente', successToast );
			onSuccess?.();
		},
		onError: ( mutationError: any ) => {
			toast( `Error al actualizar las sesiones: ${mutationError.message}`, errorToast );
		}
	});


	function onSubmit( data: FormData ): void {
		const {
			name,
			isEnglish,
			correctedRegistrants,
			realRegistrants,
			plannedBuilding,
			chairsAvailable,
			professorId,
			spaceId
		} = data;

		const updateMassiveSession : UpdateMassiveSessionRequest = {
			...(correctedRegistrants && { correctedRegistrants }),
			...(realRegistrants && { realRegistrants }),
			...(plannedBuilding && { plannedBuilding }),
			...(chairsAvailable && { chairsAvailable }),
			...(professorId && { professorId }),
			...(spaceId && { spaceId }),
			...(name && { name }),
			...( englishForAll && { isEnglish } ),
			ids
		};

		console.log("🚀 ~ updateMassiveSession:", updateMassiveSession);

		if ( Object.keys( updateMassiveSession ).length === 1 && "ids" in updateMassiveSession ) {
			toast( 'Debe seleccionar al menos un valor para actualizar', errorToast );
			return;
		}

		updateSessionMutation.mutate( updateMassiveSession );
	};


	function handleClose(): void {
		form.reset();
		onClose();
	};


	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-2xl max-h-[100vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Editar Sesiones</DialogTitle>

					<DialogDescription>
						Modifica los datos de todas las sesiones seleccionadas, modifica un valor y se aplicará para todas.
					</DialogDescription>

					<Card>
						<CardContent className="mt-5">
							<div className="flex items-center gap-2">
								<span className="font-medium w-48">Sesiones seleccionadas:</span>
								<span className="">{ids.length}</span>
							</div>
						</CardContent>
					</Card>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit( onSubmit )} className="space-y-4">
						{/* <SessionFormFields
							control         = { form.control }
							sessionRequired = { sessionRequired }
							onSessionChange = {() => setSessionRequired( false )}
							showSessionType = { true }
						/> */}

						{/* Is English Field */}
						<FormField
							control = { form.control }
							name    = "isEnglish"
							render  = {({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<FormLabel
										className="text-base items-center flex gap-2"
										title="Si se selecciona, se aplicará o se quitará el inglés para todas las sesiones seleccionadas"
									>
										Aplicar para todos
									</FormLabel>

									<Switch
										checked         = { englishForAll || false }
										onCheckedChange = { setEnglishForAll }
									/>

									<FormLabel className="text-base items-center flex gap-2">
										En inglés
									</FormLabel>

									<FormControl>
										<Switch
											checked         = { field.value || false }
											onCheckedChange = { field.onChange }
											disabled        = { !englishForAll }
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Space and Professor Card */}
						<Card className="border-primary/20">
							<CardContent className="pt-6 space-y-4">
								{/* Enable Switch */}
								<div className="flex flex-row items-center justify-between rounded-lg border p-4">
									<FormLabel className="text-base items-center flex gap-2">
										Habilitar la actualización de Espacio y/o Profesor
									</FormLabel>

									<Switch
										checked         = { enableSpaceProfessor }
										onCheckedChange = {( checked ) => {
											setEnableSpaceProfessor( checked );
											if ( !checked ) {
												form.setValue( 'spaceId', null );
												form.setValue( 'professorId', null );
											}
										}}
									/>
								</div>

								{/* Info Message */}
                                <aside className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                    <ul className="space-y-2">
                                        <li className="flex items-start">
                                            <span className="mr-2" aria-hidden="true">✅</span>

                                            <div>
                                                <strong className="font-bold">Cambio exitoso:</strong>
                                                <p className="inline"> La sesión se actualizará con el nuevo espacio/profesor si está disponible en el horario que ya está reservada.</p>
                                            </div>
                                        </li>

                                        <li className="flex items-start">
                                            <span className="mr-2" aria-hidden="true">❌</span>

                                            <div>
                                                <strong className="font-bold">Sin cambios:</strong>
                                                <p className="inline"> Si no hay disponibilidad, la sesión conservará el espacio/profesor que ya tenía.</p>
                                            </div>
                                        </li>

                                        <li className="flex items-start">
                                            <span className="mr-2" aria-hidden="true">❌</span>

                                            <div>
                                                <strong className="font-bold">Sin cambios:</strong>
                                                <p className="inline"> Si es el espacio no tiene la capacidad necesaria con los cupos o registrados.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </aside>

								{/* Space and Professor Fields */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{/* Space Field */}
									<FormField
										control = { form.control }
										name    = "spaceId"
										render  = {({ field }) => (
											<FormItem>
												<FormControl>
													<SpaceSelect
														label               = "Espacio"
														defaultValues       = { field.value ? [field.value] : [] }
														onSelectionChange   = {( values ) => field.onChange( values as string || null )}
														multiple            = { false }
														disabled            = { !enableSpaceProfessor }
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									{/* Professor Field */}
									<FormField
										control = { form.control }
										name    = "professorId"
										render  = {({ field }) => (
											<FormItem>
												<FormControl>
													<ProfessorSelect
														label               = "Profesor"
														defaultValues       = { field.value ? [field.value] : [] }
														onSelectionChange   = {( values ) => field.onChange( values as string || null )}
														multiple            = { false }
														disabled            = { !enableSpaceProfessor }
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<DialogFooter className="flex items-center justify-between border-t pt-4">
							<Button
								type        = "button"
								variant     = "outline"
								onClick     = { handleClose }
								disabled    = { updateSessionMutation.isPending }
							>
								Cancelar
							</Button>

							<Button
								type        = "submit"
								disabled    = { updateSessionMutation.isPending }
							>
								{ updateSessionMutation.isPending
									? 'Actualizando...'
									: 'Actualizar Sesiones'
								}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
