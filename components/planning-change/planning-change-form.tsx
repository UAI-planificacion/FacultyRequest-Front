'use client'

import { JSX, useEffect, useState, useCallback, useMemo } from "react"

import {
    useMutation,
    useQuery,
    useQueryClient
}                       from "@tanstack/react-query";
import { z }			from "zod";
import { useForm }		from "react-hook-form";
import { zodResolver }	from "@hookform/resolvers/zod";
import { toast }		from "sonner";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
}							                from "@/components/ui/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
}							                from "@/components/ui/tabs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
}							                from "@/components/ui/form";
import { SpaceFilterSelector, FilterMode }  from "@/components/shared/space-filter-selector";
import { Button }			                from "@/components/ui/button";
import { Switch }			                from "@/components/ui/switch";
import { Textarea }			                from "@/components/ui/textarea";
import { Label }			                from "@/components/ui/label";
import { Input }			                from "@/components/ui/input";
import { ProfessorSelect }	                from "@/components/shared/item-select/professor-select";
import { HeadquartersSelect }               from "@/components/shared/item-select/headquarters-select";
import { MultiSelectCombobox }              from "@/components/shared/Combobox";
import { SessionInfoCard }	                from "@/components/planning-change/session-info-card";
import { CommentSection }	                from "@/components/comment/comment-section";
import { sessionLabels }                    from "@/components/section/section.config";
import { ChangeStatus }                     from "@/components/shared/change-status";
import { SessionTypeSelector }              from "@/components/shared/session-type-selector";
import { SessionModuleDays }                from "@/components/session/session-module-days";

import {
    PlanningChange,
    PlanningChangeCreate,
    PlanningChangeUpdate
}                                       from "@/types/planning-change.model";
import { Session }			            from "@/types/section.model";
import { Status }			            from "@/types/request";
import { KEY_QUERYS }		            from "@/consts/key-queries";
import { Method, fetchApi }	            from "@/services/fetch";
import { errorToast, successToast }     from "@/config/toast/toast.config";
import { tempoFormat, cn }              from "@/lib/utils";
import { OfferSection, OfferSession }   from "@/types/offer-section.model";
import { useSession }                   from "@/hooks/use-session";
import { updateFacultyTotal }           from "@/app/faculty/page";


interface Props {
	planningChange? : PlanningChange | null;
	onSuccess		: () => void;
	onCancel		: () => void;
	isOpen			: boolean;
	onClose			: () => void;
    section         : OfferSection | null;
    session?        : OfferSession | null;
	defaultTab?		: Tab;
}

// Base Zod schema for planning change validation
const basePlanningChangeSchema = z.object({
	title			: z.string().min( 1, "Título requerido" ),
	sessionName		: z.nativeEnum( Session ).nullable(),
	sessionId		: z.string().nullable(),
	sectionId		: z.string().nullable(),
	professorId		: z.string().nullable(),
	building		: z.string().nullable(),
	spaceId			: z.string().nullable(),
	spaceType		: z.string().nullable(),
	spaceSizeId		: z.string().nullable(),
	isEnglish		: z.boolean().nullable(),
	isConsecutive	: z.boolean().nullable(),
	inAfternoon		: z.boolean().nullable(),
	description		: z.string().nullable(),
	dayModulesId	: z.array( z.number() ).min( 0 ),
	status			: z.nativeEnum( Status ).optional(),
});

/**
 * Create dynamic schema with session validation
 */
const createPlanningChangeSchema = (
    selectedSession: OfferSession | null,
    filterMode: FilterMode
) => {
	return basePlanningChangeSchema.superRefine(( data: z.infer<typeof basePlanningChangeSchema>, ctx: z.RefinementCtx ) => {
		// Validación cuando se selecciona una SESIÓN EXISTENTE
		if ( data.sessionId && selectedSession ) {
			// Verificar si hay al menos un cambio
			const hasSessionNameChange	= data.sessionName !== null && data.sessionName !== selectedSession.name;
			const hasProfessorChange	= data.professorId !== null && data.professorId !== selectedSession.professor?.id;
			const hasBuildingChange		= data.building !== null;
			const hasIsEnglishChange	= data.isEnglish !== null && data.isEnglish !== selectedSession.isEnglish;
			const hasSpaceIdChange		= data.spaceId !== null && data.spaceId !== selectedSession.spaceId;
			const hasSpaceTypeChange	= data.spaceType !== null;
			const hasSpaceSizeChange	= data.spaceSizeId !== null;
			const hasDayModulesChange	= data.dayModulesId.length > 0 && !data.dayModulesId.includes( selectedSession.dayModuleId );

			const hasAnyChange = hasSessionNameChange 
                || hasProfessorChange
                || hasBuildingChange
                || hasIsEnglishChange
                || hasSpaceIdChange
                || hasSpaceTypeChange
                || hasSpaceSizeChange
                || hasDayModulesChange;

			if ( !hasAnyChange ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "Debe realizar al menos un cambio en la sesión seleccionada",
					path	: ["title"],
				});
			}
		}

		// Validación cuando NO se selecciona una sesión (modo creación)
		if ( !data.sessionId ) {
			// sessionName es requerido
			if ( !data.sessionName ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El tipo de sesión es requerido cuando se crea una nueva sesión",
					path	: ["sessionName"],
				});
			}

			// building es requerido
			if ( !data.building ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El edificio es requerido cuando se crea una nueva sesión",
					path	: ["building"],
				});
			}

			// dayModulesId debe tener al menos 1
			if ( data.dayModulesId.length === 0 ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "Debe seleccionar al menos un módulo cuando se crea una nueva sesión",
					path	: ["dayModulesId"],
				});
			}

			// Espacios: Validar según filterMode
			if ( filterMode === 'space' ) {
				// Modo espacio específico: spaceId es requerido
				if ( !data.spaceId ) {
					ctx.addIssue({
						code	: z.ZodIssueCode.custom,
						message	: "Debe seleccionar un espacio específico",
						path	: ["spaceId"],
					});
				}
			} else {
				// Modo tipo/tamaño: al menos uno debe estar seleccionado
				const hasSpaceTypeOrSize = data.spaceType !== null || data.spaceSizeId !== null;
				if ( !hasSpaceTypeOrSize ) {
					ctx.addIssue({
						code	: z.ZodIssueCode.custom,
						message	: "Debe seleccionar un tipo de espacio y/o tamaño",
						path	: ["spaceType"],
					});
				}
			}
		}
	});
}


type PlanningChangeFormValues = z.infer<typeof basePlanningChangeSchema>;

type Tab = 'form' | 'comments';


export function PlanningChangeForm({
	planningChange,
	onSuccess,
	onCancel,
	isOpen,
	onClose,
    section,
    session,
	defaultTab = 'form'
}: Props ): JSX.Element {
	const {
        staff,
        isLoading: isLoadingStaff
    }                   = useSession();
	const queryClient   = useQueryClient();

	const [ tab, setTab ]                                   = useState<Tab>( defaultTab );
	const [ selectedSessionId, setSelectedSessionId ]       = useState<string | null>( null );
	const [ filterMode, setFilterMode ]                     = useState<FilterMode>( 'space' );
	const [ isEditMode, setIsEditMode ]                     = useState<boolean>( !!planningChange );

	// Fetch sessions from section
	const {
		data		: sectionSessions,
		isLoading	: isLoadingSessions,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.SECTIONS, 'sessions', section?.id ],
		queryFn		: () => fetchApi<OfferSession[]>({ url: `sessions/section/${ section?.id }` }),
		enabled		: isOpen && !!section?.id,
		staleTime	: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	// Fetch PlanningChange from session.planningChangeId
	const {
		data		: fetchedPlanningChange,
		isLoading	: isLoadingPlanningChange,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.PLANNING_CHANGE, session?.planningChangeId ],
		queryFn		: () => fetchApi<PlanningChange>({ url: `planning-change/${ session?.planningChangeId }` }),
		enabled		: isOpen && !!session && !planningChange && !!session.planningChangeId,
		staleTime	: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});


    const {
		data		: fetchedSession,
		isLoading	: isLoadingFetchedSession,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.SECTIONS, 'session', selectedSessionId ],
		queryFn		: () => fetchApi<OfferSession>({ url: `sessions/${ selectedSessionId }` }),
		enabled		: isOpen && !!selectedSessionId && !section?.id,
		staleTime	: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	// Get selected session data
	const selectedSession = useMemo(() => {
		if ( sectionSessions && selectedSessionId ) {
			return sectionSessions.find( s => s.id === selectedSessionId ) || null;
		}

		if ( fetchedSession ) {
			return fetchedSession;
		}

		return null;
	}, [ sectionSessions, selectedSessionId, fetchedSession ]);

	// Create dynamic schema with session validation
	const planningChangeSchema = useMemo(
		() => createPlanningChangeSchema( selectedSession, filterMode ),
		[ selectedSession, filterMode ]
	);

	// Prepare session options for Combobox
	const sectionSessionOptions = useMemo(() => {
		if ( !sectionSessions ) return [];

		return sectionSessions.map( session => {
			const formattedDate = tempoFormat( session.date );
			const moduleInfo = `${ session.module.startHour }-${ session.module.endHour }`;

			return {
				id		: session.id,
				value	: session.id,
				label	: `${ sessionLabels[session.name] } - ${ formattedDate } - ${ moduleInfo }`,
			};
		});
	}, [ sectionSessions ]);

	const form = useForm<PlanningChangeFormValues>({
		resolver		: zodResolver( planningChangeSchema ),
		defaultValues	: {
			title			: '',
			sessionName		: null,
			sessionId		: null,
			sectionId		: null,
			professorId		: null,
			building		: null,
			spaceId			: null,
			spaceType		: null,
			spaceSizeId		: null,
			isEnglish		: false,
			isConsecutive	: false,
			inAfternoon		: false,
			description		: null,
			dayModulesId	: [],
			status			: Status.PENDING,
		},
	});

	// Update form when planningChange changes
	useEffect(() => {
		const currentPlanningChange = planningChange || fetchedPlanningChange;

		if ( currentPlanningChange ) {
			// Set edit mode to true
			setIsEditMode( true );

			// Determine filter mode and set state
			const determinedFilterMode: FilterMode = currentPlanningChange.spaceId ? 'space' : 'type-size';
			setFilterMode( determinedFilterMode );

			setSelectedSessionId( null );
            setTab( 'form' );

			form.reset({
				title			: currentPlanningChange.title,
				sessionName		: currentPlanningChange.sessionName,
				sessionId		: currentPlanningChange.sessionId,
				sectionId		: currentPlanningChange.sectionId,
				professorId		: currentPlanningChange.professor?.id || null,
				building		: currentPlanningChange.building || null,
				spaceId			: currentPlanningChange.spaceId,
				spaceType		: currentPlanningChange.spaceType,
				spaceSizeId		: ( currentPlanningChange.spaceSize as any ) || null,
				isEnglish		: currentPlanningChange.isEnglish,
				isConsecutive	: currentPlanningChange.isConsecutive,
				inAfternoon		: currentPlanningChange.inAfternoon,
				description		: currentPlanningChange.description,
				dayModulesId	: currentPlanningChange.dayModulesId,
				status			: currentPlanningChange.status,
			});
		} else {
			setIsEditMode( false );
			setSelectedSessionId( null );
			setFilterMode( 'space' );
			form.reset({
				title			: '',
				sessionName		: null,
				sessionId		: null,
				sectionId		: null,
				professorId		: null,
				building		: null,
				spaceId			: null,
				spaceType		: null,
				spaceSizeId		: null,
				isEnglish		: false,
				isConsecutive	: false,
				inAfternoon		: false,
				description		: null,
				dayModulesId	: [],
				status			: Status.PENDING,
			});
		}
	}, [ planningChange, fetchedPlanningChange, form, isOpen ]);

	// Set session when it comes from props
	useEffect(() => {
		if ( !isOpen ) return;

		const currentPlanningChange = planningChange    || fetchedPlanningChange;
		const newSessionId          = session?.id       || currentPlanningChange?.sessionId;

		if ( newSessionId && selectedSessionId !== newSessionId ) {
			setSelectedSessionId( newSessionId );
			form.setValue( 'sessionId', newSessionId );
		}
	}, [ session, isOpen, planningChange, fetchedPlanningChange, selectedSessionId, form ]);

	// Auto-fill form when session is selected
	useEffect(() => {
		// Si ya estamos en modo edición, no auto-rellenar
		if ( isEditMode ) return;

		// Si no hay sesión seleccionada, limpiar campos
		if ( !selectedSessionId ) {
			form.setValue( 'sessionName', null );
			form.setValue( 'professorId', null );
			form.setValue( 'building', null );
			form.setValue( 'spaceId', null );
			form.setValue( 'spaceType', null );
			form.setValue( 'spaceSizeId', null );
			form.setValue( 'isEnglish', false );
			form.setValue( 'dayModulesId', [] );
			setFilterMode( 'space' );
			return;
		}

		// Esperar a que se cargue la sesión
		if ( !selectedSession ) return;

		// Auto-rellenar campos del formulario
		form.setValue( 'sessionName', selectedSession.name );
		form.setValue( 'professorId', selectedSession.professor?.id || null );
		form.setValue( 'building', selectedSession.section.building );
		form.setValue( 'spaceId', selectedSession.spaceId );
		form.setValue( 'isEnglish', selectedSession.isEnglish );

		// Limpiar campos de tipo y tamaño porque usamos spaceId específico
		form.setValue( 'spaceType', null );
		form.setValue( 'spaceSizeId', null );

		// Setear filterMode a 'space' porque tenemos spaceId
		setFilterMode( 'space' );

		// Auto-marcar el módulo y día en la tabla usando el dayModuleId de la sesión
		form.setValue( 'dayModulesId', [ selectedSession.dayModuleId ] );
	}, [ selectedSessionId, selectedSession, isEditMode, form ]);

	// Create mutation
	const createPlanningChangeMutation = useMutation({
		mutationFn: async ( values: PlanningChangeFormValues ) => {
			const body: PlanningChangeCreate = {
				title			: values.title,
				sessionName		: values.sessionName,
				sessionId		: values.sessionId,
				sectionId		: values.sessionId ? null : section?.id || null,
				professorId		: values.professorId,
				spaceSizeId		: values.spaceSizeId as any,
				spaceType		: values.spaceType as any,
				spaceId			: values.spaceId,
				isEnglish		: values.isEnglish,
				isConsecutive	: values.isConsecutive,
				inAfternoon		: values.inAfternoon,
				description		: values.description,
				building		: values.building as any,
				status			: null,
				dayModulesId	: values.dayModulesId,
				staffCreateId	: staff!.id,
			};

			return fetchApi({
				url		: 'planning-change',
				method	: Method.POST,
				body,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE ] });
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SECTIONS ] });

			updateFacultyTotal( queryClient, staff!.facultyId!, true, 'totalPlanningChanges' );

			toast( 'Cambio de planificación creado exitosamente', successToast );
			onSuccess();
		},
		onError: ( error: Error ) => {
			toast( `Error al crear cambio de planificación: ${error.message}`, errorToast );
		},
	});

	// Update mutation
	const updatePlanningChangeMutation = useMutation({
		mutationFn: async ( values: PlanningChangeFormValues ) => {
            const planningId = planningChange?.id || session?.planningChangeId || fetchedPlanningChange?.id;

            if ( !planningId ) {
                toast( 'No se encontró el ID del cambio de planificación', errorToast );
                return;
            }

			const body: PlanningChangeUpdate = {
				title			: values.title,
				sessionName		: values.sessionName,
				professorId		: values.professorId,
				spaceSizeId		: values.spaceSizeId as any,
				spaceType		: values.spaceType as any,
				spaceId			: values.spaceId,
				isEnglish		: values.isEnglish,
				isConsecutive	: values.isConsecutive,
				inAfternoon		: values.inAfternoon,
				description		: values.description,
				building		: values.building as any,
				dayModulesId	: values.dayModulesId,
				status			: values.status || null,
				staffUpdateId	: staff!.id,
			};

			return fetchApi({
				url		: `planning-change/${planningId}`,
				method	: Method.PATCH,
				body,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE ] });
			toast( 'Cambio de planificación actualizado exitosamente', successToast );
			onSuccess();
		},
		onError: ( error: Error ) => {
			toast( `Error al actualizar cambio de planificación: ${error.message}`, errorToast );
		},
	});


	const onSubmit = ( values: PlanningChangeFormValues ) => {
        if ( isLoadingStaff ) {
			toast( 'Cargando información del usuario...', { description: 'Por favor espere' });
			return;
		}

        if ( !staff ) {
			toast( 'Por favor, inicie sesión para crear una solicitud', errorToast );
			return;
		}

        console.log('🚀 ~ PlanningChangeForm ~ onSubmit ~ values:', values);
		
		if ( isEditMode ) {
			updatePlanningChangeMutation.mutate( values );
		} else {
			createPlanningChangeMutation.mutate( values );
		}
	};


	const handleBuildingChange = ( buildingId: string | null ) => {
		form.setValue( 'building', buildingId );

		// Clear space filters when building changes
		form.setValue( 'spaceType', null );
		form.setValue( 'spaceSizeId', null );
		form.setValue( 'spaceId', null );
	};



	const handleDayModuleIdsChange = useCallback(( dayModuleIds: number[] ) => {
		form.setValue( 'dayModulesId', dayModuleIds );
	}, [ form ]);


	return (
		<Dialog open={ isOpen } onOpenChange={ onClose }>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{ isEditMode ? 'Editar Cambio de Planificación' : 'Crear Cambio de Planificación' }
					</DialogTitle>

					<DialogDescription>
						{ isEditMode 
							? 'Modifica los datos del cambio de planificación'
							: 'Crea un nuevo cambio de planificación para modificar una sesión existente o crear una nueva'
						}
					</DialogDescription>
				</DialogHeader>

				<Tabs
					defaultValue	= { tab }
					onValueChange	= {( value ) => setTab( value as Tab )}
					className		= "w-full"
				>
					{ isEditMode && (
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="form">Información</TabsTrigger>

							<TabsTrigger value="comments">
								Comentarios
							</TabsTrigger>
						</TabsList>
					)}

					<TabsContent value="form" className={ cn( "space-y-4", isEditMode ? 'mt-4' : '' ) }>
						<Form {...form}>
							<form onSubmit={ form.handleSubmit( onSubmit ) } className="space-y-4">
						{/* Título */}
						<FormField
							control	= { form.control }
							name	= "title"
							render	= {({ field }) => (
								<FormItem>
									<FormLabel>Título *</FormLabel>

									<FormControl>
										<Input
											placeholder	= "Título del cambio de planificación"
											disabled	= { !!session?.planningChangeId && isLoadingPlanningChange }
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

                        {/* Status (solo en modo edición) */}
                        {/* { isEditMode && (
                            <FormField
                                control	= { form.control }
                                name	= "status"
                                render	= {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>

                                        <FormControl>
                                            <ChangeStatus
												multiple		= { false }
                                                value           = { field.value || Status.PENDING }
                                                onValueChange   = { field.onChange }
                                                defaultValue    = { field.value }
                                                className		= { !!session?.planningChangeId && isLoadingPlanningChange ? 'opacity-50 pointer-events-none' : '' }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )} */}

						{/* Selección de Sesión (solo en modo creación) */}
						{( !isEditMode && !session ) && (
							<FormField
								control	= { form.control }
								name	= "sessionId"
								render	= {({ field }) => (
									<FormItem>
										<Label>Sesión (opcional - seleccionar solo para modificar)</Label>

										<MultiSelectCombobox
											options				= { sectionSessionOptions }
											defaultValues		= { field.value || undefined }
											onSelectionChange	= {( value ) => {
												const sessionId = typeof value === 'string' ? value : undefined;
												field.onChange( sessionId || null );
												setSelectedSessionId( sessionId || null );
											}}
											placeholder			= "Seleccionar sesión existente (dejar vacío para crear nueva)"
											disabled			= { isLoadingSessions }
											isLoading			= { isLoadingSessions }
											multiple			= { false }
											required			= { false }
										/>

										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Mostrar información de la sesión seleccionada */}
						{ selectedSessionId && (
                            <SessionInfoCard 
                                sessionData	= { selectedSession }
                                isLoading	= { isLoadingSessions || isLoadingFetchedSession }
                            />
						)}

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Tipo de Sesión */}
							<FormField
								control	= { form.control }
								name	= "sessionName"
								render	= {({ field }) => (
									<FormItem>
										<FormLabel>Tipo de Sesión</FormLabel>

										<FormControl>
											<SessionTypeSelector
												multiple		= { false }
												value			= { field.value }
												onValueChange	= { field.onChange }
												defaultValue	= { field.value }
												allowDeselect	= { true }
												className		= { !!session?.planningChangeId && isLoadingPlanningChange ? 'opacity-50 pointer-events-none' : 'w-full' }
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Profesor */}
							<FormField
								control	= { form.control }
								name	= "professorId"
								render	= {({ field }) => (
									<FormItem>
										<FormLabel>Profesor</FormLabel>

										<FormControl>
											<ProfessorSelect
												multiple			= { false }
												placeholder			= "Seleccionar profesor"
												defaultValues		= { field.value || undefined }
												disabled			= { !!session?.planningChangeId && isLoadingPlanningChange }
												onSelectionChange	= {( value ) => {
													const professorId = typeof value === 'string' ? value : null;
													field.onChange( professorId );
												}}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Edificio */}
							<FormField
								control	= { form.control }
								name	= "building"
								render	= {({ field }) => (
									<FormItem>
										<FormLabel>Edificio</FormLabel>

										<FormControl>
											<HeadquartersSelect
												multiple			= { false }
												placeholder			= "Seleccionar edificio"
												defaultValues		= { field.value || undefined }
												disabled			= { !!session?.planningChangeId && isLoadingPlanningChange }
												onSelectionChange	= {( value ) => {
													const buildingId = typeof value === 'string' ? value : null;
													field.onChange( buildingId );
													handleBuildingChange( buildingId );
												}}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Selector de filtros de espacio */}
						{ form.watch( 'building' ) && (
							<div className="space-y-2">
								<div className={ !!session?.planningChangeId && isLoadingPlanningChange ? 'opacity-50 pointer-events-none' : '' }>

								<SpaceFilterSelector
									buildingId			= { form.watch( 'building' ) }
									filterMode			= { filterMode }
									spaceId				= { form.watch( 'spaceId' ) }
									spaceType			= { form.watch( 'spaceType' ) }
									spaceSizeId			= { form.watch( 'spaceSizeId' ) }
									onFilterModeChange	= {( mode ) => setFilterMode( mode )}
									onSpaceIdChange		= {( spaceId ) => form.setValue( 'spaceId', typeof spaceId === 'string' ? spaceId : null )}
									onSpaceTypeChange	= {( spaceType ) => form.setValue( 'spaceType', spaceType )}
									onSpaceSizeIdChange	= {( spaceSizeId ) => form.setValue( 'spaceSizeId', spaceSizeId )}
								/>
							</div>
								
								{/* Mostrar errores de espacios */}
								{ ( form.formState.errors.spaceId || form.formState.errors.spaceType ) && (
									<p className="text-sm font-medium text-destructive">
										{ String( form.formState.errors.spaceId?.message || form.formState.errors.spaceType?.message || '' ) }
									</p>
								)}
							</div>
						)}

						{/* Switches */}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							<FormField
								control	= { form.control }
								name	= "isEnglish"
								render	= {({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<Label htmlFor="isEnglish" className="cursor-pointer">
												En inglés
											</Label>

											<FormControl>
												<Switch
													id				= "isEnglish"
													checked			= { field.value || false }
													onCheckedChange	= { field.onChange }
													disabled		= { !!session?.planningChangeId && isLoadingPlanningChange }
												/>
											</FormControl>
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control	= { form.control }
								name	= "isConsecutive"
								render	= {({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<Label htmlFor="isConsecutive" className="cursor-pointer">
												Consecutivo
											</Label>

											<FormControl>
												<Switch
													id				= "isConsecutive"
													checked			= { field.value || false }
													onCheckedChange	= { field.onChange }
													disabled		= { !!session?.planningChangeId && isLoadingPlanningChange }
												/>
											</FormControl>
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control	= { form.control }
								name	= "inAfternoon"
								render	= {({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<Label htmlFor="inAfternoon" className="cursor-pointer">
												En la tarde
											</Label>

											<FormControl>
												<Switch
													id				= "inAfternoon"
													checked			= { field.value || false }
													onCheckedChange	= { field.onChange }
													disabled		= { !!session?.planningChangeId && isLoadingPlanningChange }
												/>
											</FormControl>
										</div>
									</FormItem>
								)}
							/>
						</div>

						{/* Descripción */}
						<FormField
							control	= { form.control }
							name	= "description"
							render	= {({ field }) => (
								<FormItem>
									<FormLabel>Descripción</FormLabel>

									<FormControl>
										<Textarea
											placeholder	= "Descripción opcional del cambio"
											value		= { field.value || '' }
											onChange	= { field.onChange }
											disabled	= { !!session?.planningChangeId && isLoadingPlanningChange }
                                            className   = "max-h-36"
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Módulos y Días */}
						<div className="space-y-2">
							<Label>Módulos y Días *</Label>

							<div className={ !!session?.planningChangeId && isLoadingPlanningChange ? 'opacity-50 pointer-events-none' : '' }>
								<SessionModuleDays
					dayModuleIds		= { form.watch( 'dayModulesId' ) }
					onDayModuleIdsChange= { handleDayModuleIdsChange }
					enabled				= { true }
					multiple			= { true }
				/>
							</div>

							{ form.formState.errors.dayModulesId && (
								<p className="text-sm font-medium text-destructive">
									{ String( form.formState.errors.dayModulesId.message || '' ) }
								</p>
							)}
						</div>

								<DialogFooter className="flex justify-between border-t pt-4">
									<Button
										type		= "button"
										variant		= "outline"
										onClick		= { onCancel }
										disabled	= { createPlanningChangeMutation.isPending || updatePlanningChangeMutation.isPending }
									>
										Cancelar
									</Button>

									<Button
										type		= "submit"
										disabled	= { createPlanningChangeMutation.isPending || updatePlanningChangeMutation.isPending }
									>
										{ ( createPlanningChangeMutation.isPending || updatePlanningChangeMutation.isPending ) 
											? 'Guardando...' 
											: isEditMode ? 'Actualizar' : 'Crear'
										}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</TabsContent>

					{ isEditMode && (
						<TabsContent value="comments" className="mt-4">
							<CommentSection
								planningChangeId	= { planningChange?.id || fetchedPlanningChange?.id }
								enabled				= { tab === 'comments' }
								size				= { 'h-[450px]' }
							/>
						</TabsContent>
					)}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
