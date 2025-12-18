'use client'

import React, { useState, useCallback } from "react"
import { useRouter } from 'next/navigation';


import {
    BookCopy,
    CalendarClock,
    ChevronDown,
    ChevronRight,
}                   from "lucide-react"
import {
    useMutation,
    useQueryClient
}                   from "@tanstack/react-query"
import { toast }    from "sonner"

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                               from "@/components/ui/table"

// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuTrigger
// }                               from "@/components/ui/dropdown-menu"
import { ActiveBadge }          from "@/components/shared/active"
// import { ActionButton }         from "@/components/shared/action"
// import { ChangeStatusSection }  from "@/components/section/change-status"
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog"
import { SessionShort }         from "@/components/session/session-short"
import { SessionForm }          from "@/components/session/session-form"
import { SessionTable }         from "@/components/session/session-table"
// import { SectionForm }          from "@/components/section/section-form"
import { PlanningChangeForm }   from "@/components/planning-change/planning-change-form"
import { RequestForm }          from "@/components/request/request-form"
import { Skeleton }             from "@/components/ui/skeleton";
import { Button }               from "@/components/ui/button"
// import { Checkbox }             from "@/components/ui/checkbox"

import { OfferSection }             from "@/types/offer-section.model"
import { fetchApi, Method }         from "@/services/fetch"
import { KEY_QUERYS }               from "@/consts/key-queries"
import { errorToast, successToast } from "@/config/toast/toast.config"
import { tempoFormat }              from "@/lib/utils"
import { useSession }               from "@/hooks/use-session"


interface Props {
	sections                    : OfferSection[];
	isLoading                   : boolean;
	isError                     : boolean;
	selectedSessions            : Set<string>;
	onSelectedSessionsChange    : ( selectedSessions: Set<string> ) => void;
	selectedSections            : Set<string>;
	onSelectedSectionsChange    : ( selectedSections: Set<string> ) => void;
}


export function SectionTable({
	sections,
	isLoading,
	isError,
	selectedSessions,
	onSelectedSessionsChange,
	selectedSections,
	onSelectedSectionsChange
}: Props ) {
	const queryClient   = useQueryClient();
    const router        = useRouter();

	const [ expandedSections, setExpandedSections ]     = useState<Set<string>>( new Set() );
	const [ isOpenDelete, setIsOpenDelete ]             = useState<boolean>( false );
	const [ isOpenSessionForm, setIsOpenSessionForm ]   = useState<boolean>( false );
	const [ isOpenSectionForm, setIsOpenSectionForm ]   = useState<boolean>( false );
	const [ isOpenRequestForm, setIsOpenRequestForm ]   = useState<boolean>( false );
	const [ selectedSection, setSelectedSection ]       = useState<OfferSection | null>( null );

	/**
	 * Deseleccionar una sección específica
	 */
	const handleDeselectSection = useCallback(( sectionId: string ): void => {
		const newSelectedSections = new Set( selectedSections );
		newSelectedSections.delete( sectionId );
		onSelectedSectionsChange( newSelectedSections );

		// También deseleccionar todas las sesiones de esa sección
		const section = sections.find( s => s.id === sectionId );
		if ( section ) {
			const sessionIds = section.sessions.ids || [];
			const newSelectedSessions = new Set( selectedSessions );
			sessionIds.forEach( sessionId => newSelectedSessions.delete( sessionId ));
			onSelectedSessionsChange( newSelectedSessions );
		}
	}, [ selectedSections, selectedSessions, sections, onSelectedSectionsChange, onSelectedSessionsChange ]);

	const [ isOpenPlanningChange, setIsOpenPlanningChange ] = useState<boolean>( false );

	// Get staff session for facultyId
	const { staff } = useSession();

	/**
	 * Toggle section expansion
	 */
	const toggleSectionExpansion = useCallback(( sectionId: string ): void => {
		setExpandedSections(( prev ) => {
			const newSet = new Set( prev );

			if ( newSet.has( sectionId ) ) {
				newSet.delete( sectionId );
			} else {
				newSet.add( sectionId );
			}

			return newSet;
		});
	}, []);

	/**
	 * Check if section is fully selected
	 */
	const isSectionFullySelected = useCallback(( section: OfferSection ): boolean => {
		const sessionIds = section.sessions.ids || [];

		// Si no tiene sesiones, verificar si la sección está seleccionada
		if ( sessionIds.length === 0 ) {
			return selectedSections.has( section.id );
		}

		return sessionIds.every( id => selectedSessions.has( id ));
	}, [ selectedSessions, selectedSections ]);

	/**
	 * Handle section selection (parent)
	 */
	const handleSectionSelection = useCallback(( sectionId: string, checked: boolean | 'indeterminate' ): void => {
		const section = sections.find( s => s.id === sectionId );

		if ( !section ) {
			return;
		}

		const sessionIds            = section.sessions.ids || [];
		const newSelectedSessions   = new Set( selectedSessions );
		const newSelectedSections   = new Set( selectedSections );
		const shouldSelect          = checked === true || checked === 'indeterminate';

		sessionIds.forEach( ( sessionId ) => {
			if ( shouldSelect ) {
				newSelectedSessions.add( sessionId );
			} else {
				newSelectedSessions.delete( sessionId );
			}
		});

		// Agregar/remover sectionId de selectedSections
		if ( shouldSelect ) {
			newSelectedSections.add( sectionId );
		} else {
			newSelectedSections.delete( sectionId );
		}

		onSelectedSessionsChange( newSelectedSessions );
		onSelectedSectionsChange( newSelectedSections );
	}, [ sections, selectedSessions, selectedSections, onSelectedSessionsChange, onSelectedSectionsChange ]);

	/**
	 * Check if section is partially selected
	 */
	const isSectionPartiallySelected = useCallback(( section: OfferSection ): boolean => {
		const sessionIds = section.sessions.ids || [];

		// Si no tiene sesiones, no puede estar parcialmente seleccionada
		if ( sessionIds.length === 0 ) return false;

		const selectedSessionIds = sessionIds.filter( id => selectedSessions.has( id ));

		return selectedSessionIds.length > 0 && selectedSessionIds.length < sessionIds.length;
	}, [ selectedSessions ]);

	/**
	 * Handle session selection (child)
	 */
	const handleSessionSelection = useCallback(( sessionId: string, sectionId: string ): void => {
		const isCurrentlySelected   = selectedSessions.has( sessionId );
		const newSelectedSessions   = new Set( selectedSessions );

		if ( isCurrentlySelected ) {
			newSelectedSessions.delete( sessionId );
		} else {
			newSelectedSessions.add( sessionId );
		}

		onSelectedSessionsChange( newSelectedSessions );
	}, [ selectedSessions, onSelectedSessionsChange ]);

	/**
	 * Handle edit section
	 */
	const handleEditSection = useCallback(( section: OfferSection ): void => {
		setSelectedSection( section );
		setIsOpenSectionForm( true );
	}, []);

	/**
	 * Handle delete section
	 */
	const handleDeleteSection = useCallback(( section: OfferSection ): void => {
		setSelectedSection( section );
		setIsOpenDelete( true );
	}, []);

	/**
	 * API call to delete section
	 */
	const deleteSectionApi = async ( sectionId: string ): Promise<void> =>
		fetchApi<void>({
			url     : `Sections/${sectionId}`,
			method  : Method.DELETE
		});

	/**
	 * Mutation to delete section
	 */
	const deleteSectionMutation = useMutation<void, Error, string>({
		mutationFn: deleteSectionApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });
			setIsOpenDelete( false );
			setSelectedSection( null );
			toast( 'Sección eliminada exitosamente', successToast );
		},
		onError: ( mutationError ) => toast( `Error al eliminar sección: ${mutationError.message}`, errorToast )
	});

	/**
	 * Confirm delete section
	 */
	const handleConfirmDeleteSection = useCallback((): void => {
		if ( selectedSection ) {
			deleteSectionMutation.mutate( selectedSection.id );
		}
	}, [ selectedSection, deleteSectionMutation ]);

	/**
	 * Get session counts for SessionShort component
	 */
	const getSessionCounts = useCallback(( section: OfferSection ) => {
		return {
			C: section.lecture,
			A: section.tutoringSession,
			T: section.workshop,
			L: section.laboratory,
		};
	}, []);


	return (
		<>
			<Table className="min-w-full">
				<TableHeader className="dark:hover:bg-black rounded-full">
					<TableRow>
						<TableHead className="w-0 font-semibold"></TableHead>
						{/* <TableHead className="w-10 font-semibold"></TableHead> */}
						<TableHead className="font-semibold">SSEC</TableHead>
						<TableHead className="font-semibold">Período</TableHead>
						<TableHead className="font-semibold">Sesiones</TableHead>
						<TableHead className="font-semibold">Cupos</TableHead>
						<TableHead className="font-semibold">Registrados</TableHead>
						<TableHead className="font-semibold">Fecha Inicio</TableHead>
						<TableHead className="font-semibold">Fecha Fin</TableHead>
						<TableHead className="font-semibold">Estado</TableHead>
						<TableHead className="text-right font-semibold">Acciones</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{isLoading ? (
                        <>
							{Array.from({ length: 15 }).map((_, index) => (
								<TableRow key={index}>
                                    {/* Expand */}
									<TableCell>
										<Skeleton className="h-8 w-8" />
									</TableCell>
                                    {/* Check */}
									{/* <TableCell>
										<Skeleton className="h-4 w-4" />
									</TableCell> */}
                                    {/* SSEC */}
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
                                    {/* Period */}
									<TableCell>
										<Skeleton className="h-4 w-12" />
									</TableCell>
                                    {/*Sessions  */}
									<TableCell>
										<div className="flex gap-1">
                                            <Skeleton className="h-6 w-8" />
                                            <Skeleton className="h-6 w-8" />
                                            <Skeleton className="h-6 w-8" />
                                            <Skeleton className="h-6 w-8" />
                                        </div>
									</TableCell>

                                    {/* "Cupos" */}
                                    <TableCell>
										<Skeleton className="h-4 w-8" />
									</TableCell>

                                    {/* "Registrados" */}
                                    <TableCell>
										<Skeleton className="h-4 w-8" />
									</TableCell>

                                    {/* Start Date */}
									<TableCell>
										<Skeleton className="h-4 w-32" />
									</TableCell>
                                    {/* End Date */}
									<TableCell>
										<Skeleton className="h-4 w-32" />
									</TableCell>
                                    {/* Status */}
									<TableCell>
										<Skeleton className="h-8 w-20" />
									</TableCell>

									<TableCell>
                                        <div className="flex gap-1">
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
									</TableCell>
								</TableRow>
							))}
						</>
					) : isError ? (
						<TableRow>
							<TableCell colSpan={11} className="text-center py-8 text-red-500">
								Error al cargar las secciones
							</TableCell>
						</TableRow>
					) : sections.length === 0 ? (
						<TableRow>
							<TableCell colSpan={11} className="text-center py-8 text-gray-500">
								No hay secciones disponibles
							</TableCell>
						</TableRow>
					) : (
						sections.map(( section ) => (
							<React.Fragment key={section.id}>
								{/* Section Row (Parent) */}
								<TableRow className={ !section.isClosed ? "" : "bg-zinc-100 dark:bg-zinc-900" }>
									<TableCell>
										<Button
											variant     = "outline"
											size        = "sm"
											onClick     = {() => toggleSectionExpansion( section.id )}
											className   = "p-1 h-8 w-8"
                                            disabled    = { section.sessionsCount === 0 }
										>
											{ expandedSections.has( section.id )
												? <ChevronDown className="h-4 w-4" />
												: <ChevronRight className="h-4 w-4" />
											}
										</Button>
									</TableCell>

									{/* <TableCell>
										<Checkbox
											checked         = { 
												isSectionFullySelected( section ) 
													? true 
													: isSectionPartiallySelected( section ) 
														? 'indeterminate' 
														: false 
											}
											onCheckedChange = {( checked ) => handleSectionSelection( section.id, checked )}
											aria-label      = "Seleccionar sección"
											// disabled        = { section.isClosed || section.sessionsCount === 0 }
											disabled        = { section.isClosed }
										/>
									</TableCell> */}

									<TableCell className="font-medium" title={ `${section.subject.id}-${section.subject.name}` }>
                                        { section.subject.id }-{ section.code }
                                    </TableCell>

									<TableCell title={ `${section.period.id}-${section.period.name}` }>
                                        { section.period.id }
                                    </TableCell>

									<TableCell>
										<SessionShort sessionCounts={ getSessionCounts( section )} />
									</TableCell>

                                    <TableCell>
                                        { section.quota }
									</TableCell>

                                    <TableCell>
                                        { section.registered }
									</TableCell>

									<TableCell>{ section.startDate ? tempoFormat( section.startDate ) : "-" }</TableCell>

									<TableCell>{ section.endDate ? tempoFormat( section.endDate ) : "-" }</TableCell>

									<TableCell>
										<ActiveBadge
											isActive        = { !section.isClosed }
											activeText      = "Abierto"
											inactiveText    = "Cerrado"
										/>
									</TableCell>

									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-1.5">
                                            {/* <Button
                                                title       = "Editar Sección"
                                                variant     = "outline"
												disabled    = { section.isClosed || section.sessionsCount === 0 }
                                                size        = "icon"
                                                onClick     = { () =>  handleEditSection( section )}
                                            >
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>  */}
                                            {/* ActionButton (Editar/Eliminar) */}
											{/* <ActionButton
												editItem        = {() => handleEditSection( section )}
												deleteItem      = {() => handleDeleteSection( section )}
												item            = { section }
												isDisabledEdit  = { section.isClosed }
											/> */}

                                            <Button
                                                disabled    = { section.isClosed || section.sessionsCount === 0 }
                                                onClick     = { () => router.push( `faculty?tab=requests&sectionId=${ section.id }` )}
                                                variant     = "outline"
                                                size        = "icon"
                                                title       = "Ver Solicitud"
                                            >
                                                <BookCopy className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                disabled    = { section.isClosed || section.sessionsCount === 0 }
                                                onClick     = { () => {
                                                    setIsOpenRequestForm( true );
                                                    setSelectedSection( section );
                                                }}
                                                variant     = "outline"
                                                size        = "icon"
                                                title       = "Crear Solicitud"
                                            >
                                                <BookCopy className="h-4 w-4 text-blue-500" />
                                            </Button>

                                            <Button
                                                disabled    = { section.isClosed || section.sessionsCount === 0 }
                                                onClick     = { () => router.push( `faculty?tab=planning-change&sectionId=${ section.id }` )}
                                                variant     = "outline"
                                                size        = "icon"
                                                title       = "Cambios de Planificación"
                                            >
                                                <CalendarClock className="w-4 h-4 text-amber-500" />
                                            </Button>

                                            <Button
                                                disabled    = { section.isClosed || section.sessionsCount === 0 }
                                                variant     = "outline"
                                                size        = "icon"
                                                title       = "Crear Cambio de Planificación"
                                                onClick     = { () => {
                                                    setIsOpenPlanningChange( true );
                                                    setSelectedSection( section );
                                                }}
											>
												<CalendarClock className="w-4 h-4 text-blue-500" />
											</Button>

                                            {/* { section.sessionsCount === 0 ? (
                                                <Button
                                                    disabled    = { section.isClosed }
                                                    onClick     = { () => router.push( `sections/${section.id}` )}
                                                    variant     = "outline"
                                                    size        = "icon"
                                                    title       = "Planificar Sesiones"
                                                >
                                                    <Album className="w-4 h-4 text-green-500" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    disabled    = { section.isClosed }
                                                    variant     = "outline"
                                                    size        = "icon"
                                                    title       = "Asignar Nueva Sesión"
                                                    onClick     = { () => {
                                                        setIsOpenSessionForm( true );
                                                        setSelectedSection( section );
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            )} */}

                                            {/* ChangeStatusSection */}
											{/* <ChangeStatusSection 
												section				= { section }
												selectedSections	= { selectedSections }
												onDeselectSection	= { handleDeselectSection }
											/> */}

											{/* Dropdown Menu con acciones */}
											{/* <DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant = "outline"
														size    = "icon"
														title   = "Acciones"
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>

												<DropdownMenuContent align="end">
                                                    <ChangeStatusSection 
                                                        section				= { section }
                                                        selectedSections	= { selectedSections }
                                                        onDeselectSection   = { handleDeselectSection }
                                                    />

                                                    <DropdownMenuItem
														disabled    = { section.isClosed || section.sessionsCount === 0 }
														onClick     = { () => handleDeleteSection( section )}
														className   = "cursor-pointer gap-2"
													>
                                                        <Trash2 className="h-4 w-4 text-red-500" />

														Eliminar Sección
													</DropdownMenuItem>

													<DropdownMenuItem
														disabled    = { section.isClosed || section.sessionsCount === 0 }
														onClick     = { () => router.push( `planning-change?sectionId=${ section.id }` )}
														className   = "cursor-pointer"
													>
														<CalendarClock className="w-4 h-4 mr-2 text-amber-500" />
														Ver Planificaciones
													</DropdownMenuItem>

													<DropdownMenuItem
														disabled    = { section.isClosed || section.sessionsCount === 0 }
														onClick     = { () => {
															setIsOpenPlanningChange( true );
															setSelectedSection( section );
														}}
														className   = "cursor-pointer"
													>
														<CalendarClock className="w-4 h-4 mr-2 text-blue-500" />
														Crear Cambio de Planificación
													</DropdownMenuItem>

													{ section.sessionsCount === 0 ? (
														<DropdownMenuItem
															disabled    = { section.isClosed }
															onClick     = { () => router.push(`sections/${section.id}`)}
															className   = "cursor-pointer"
														>
															<Album className="w-4 h-4 mr-2 text-green-500" />
															Planificar sesiones
														</DropdownMenuItem>
													) : (
														<DropdownMenuItem
															disabled    = { section.isClosed }
															onClick     = { () => {
																setIsOpenSessionForm( true );
																setSelectedSection( section );
															}}
															className   = "cursor-pointer"
														>
															<Plus className="w-4 h-4 mr-2" />
															Asignar Nueva Sesión
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu> */}
										</div>
									</TableCell>
								</TableRow>

								{/* Expanded Sessions (Children) */}
								{ expandedSections.has( section.id ) && (
									<SessionTable
										section                 = { section }
										selectedSessions        = { selectedSessions }
										handleSessionSelection  = { handleSessionSelection }
										isOpen                  = { expandedSections.has( section.id ) }
									/>
								)}
							</React.Fragment>
						))
					)}
				</TableBody>
			</Table>

			{/* Edit Section Dialog */}
			{/* <SectionForm
				isOpen  = { isOpenSectionForm }
				onClose = { () => setIsOpenSectionForm( false )}
				section = { selectedSection }
                sections = { sections }
			/> */}

            <SessionForm
                isOpen  = { isOpenSessionForm }
                onClose = { () => setIsOpenSessionForm( false )}
                session = { null }
                section = { selectedSection }
                onSave  = { () => {} }
            />

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isOpenDelete }
				onClose     = { () => setIsOpenDelete( false )}
				onConfirm   = { handleConfirmDeleteSection }
				name        = { `SSEC ${selectedSection?.subject.id}-${selectedSection?.code}` }
				type        = { "la Sección" }
			/>

			{/* Planning Change Form */}
			<PlanningChangeForm
				planningChange	= { null }
                section         = { selectedSection }
				isOpen			= { isOpenPlanningChange }
				onClose			= { () => setIsOpenPlanningChange( false )}
                onCancel		= { () => setIsOpenPlanningChange( false )}
				onSuccess		= { () => {
					setIsOpenPlanningChange( false );
					queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE ] });
				}}
			/>

			{/* Request Form */}
			<RequestForm
				isOpen		= { isOpenRequestForm }
				onClose		= { () => setIsOpenRequestForm( false )}
				request		= { undefined }
				facultyId	= { staff?.facultyId || '' }
				section		= { selectedSection }
			/>
		</>
	);
}
