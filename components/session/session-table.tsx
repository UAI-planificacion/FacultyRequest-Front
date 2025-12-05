'use client'

import { useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                           from "@tanstack/react-query";
import { toast }            from "sonner";
import { CalendarClock }    from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table";
import { Checkbox }             from "@/components/ui/checkbox";
import { Skeleton }             from "@/components/ui/skeleton";
import { SessionName }          from "@/components/session/session-name";
import { ActionButton }         from "@/components/shared/action";
import { SessionForm }          from "@/components/session/session-form";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Button }               from "@/components/ui/button";
import { PlanningChangeForm }   from "@/components/planning-change/planning-change-form";

import { OfferSection, OfferSession }   from "@/types/offer-section.model";
import { cn, tempoFormat }              from "@/lib/utils";
import { fetchApi, Method }             from "@/services/fetch";
import { KEY_QUERYS }                   from "@/consts/key-queries";
import { errorToast, successToast }     from "@/config/toast/toast.config";


interface Props {
	section                 : OfferSection;
	selectedSessions        : Set<string>;
	handleSessionSelection  : ( sessionId: string, sectionId: string ) => void;
    isOpen                  : boolean;
}


export function SessionTable({
	section,
	selectedSessions,
	handleSessionSelection,
    isOpen
}: Props ) {
	const queryClient                                       = useQueryClient();
	const [ isEditSection, setIsEditSection ]               = useState<boolean>( false );
	const [ selectedSessionEdit, setSelectedSesionEdit ]    = useState<OfferSession | null>( null );
	const [ isOpenDelete, setIsOpenDelete ]                 = useState( false );
	const [ selectedSession, setSelectedSession ]           = useState<OfferSession | undefined>( undefined );
    const [ isOpenPlanningChange, setIsOpenPlanningChange ] = useState<boolean>( false );
	const [ selectedSectionEdit, setSelectedSectionEdit ]   = useState<OfferSection | null>( null );


    const {
		data		: sectionSessions,
		isLoading	: isLoadingSessions,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.SESSIONS, section.id ],
		queryFn		: () => fetchApi<OfferSession[]>({ url: `sessions/section/${ section.id }` }),
		enabled		: isOpen,
		staleTime	: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	/**
	 * API call to delete session
	 */
	const deleteSessionApi = async ( sessionId: string ): Promise<void> =>
		fetchApi<void>({
			url     : `Sessions/${sessionId}`,
			method  : Method.DELETE
		});

	/**
	 * Mutation to delete session
	 */
	const deleteSessionMutation = useMutation<void, Error, string>({
		mutationFn: deleteSessionApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SESSIONS, section.id] });
			setIsOpenDelete( false );
			setSelectedSession( undefined );
			toast( 'Sesión eliminada exitosamente', successToast );
		},
		onError: ( mutationError ) => toast( `Error al eliminar sesión: ${mutationError.message}`, errorToast )
	});

	/**
	 * Confirm delete session
	 */
	function handleConfirmDeleteSession(): void {
		if ( selectedSession ) {
			deleteSessionMutation.mutate( selectedSession.id );
		}
	}


	return (
		<>
			<TableRow>
				<TableCell colSpan={12} className="p-0">
					<div className="border-l-4 ml-16">
						<Table>
							<TableHeader>
								<TableRow className="">
									<TableHead className="w-10">Seleccionar</TableHead>

									<TableHead className="pl-12">Sesión</TableHead>

									<TableHead>Sala</TableHead>

									<TableHead>Profesor</TableHead>

									<TableHead>Módulo</TableHead>

									<TableHead>Fecha</TableHead>

                                    <TableHead>Idioma</TableHead>

									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
							{ isLoadingSessions ? (
								// Skeleton loading rows
								Array.from({ length: 3 }).map(( _, index ) => (
									<TableRow key={ index } className="border-l-4 border-transparent">
										<TableCell className="w-10">
											<Skeleton className="h-5 w-5 rounded" />
										</TableCell>

										<TableCell className="pl-12">
											<Skeleton className="h-6 w-24 rounded-full" />
										</TableCell>

										<TableCell>
											<Skeleton className="h-4 w-16" />
										</TableCell>

										<TableCell>
											<Skeleton className="h-4 w-32" />
										</TableCell>

										<TableCell>
											<Skeleton className="h-4 w-28" />
										</TableCell>

										<TableCell>
											<Skeleton className="h-4 w-24" />
										</TableCell>

										<TableCell>
											<Skeleton className="h-4 w-16" />
										</TableCell>

										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Skeleton className="h-8 w-8 rounded" />
												<Skeleton className="h-8 w-8 rounded" />
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								// Actual session data
								sectionSessions?.map(( session ) => (
									<TableRow key={session.id} className="border-l-4 border-transparent">
										<TableCell className="w-10">
											<Checkbox
												checked         = { selectedSessions.has( session.id ) }
												onCheckedChange = {() => handleSessionSelection( session.id, section.id )}
												aria-label      = "Seleccionar sesión"
												className       = "w-5 h-5"
												disabled        = { section.isClosed }
											/>
										</TableCell>

										<TableCell className="pl-12">
											<SessionName session={ session.name } />
										</TableCell>

										<TableCell>{ session.spaceId ?? '-' }</TableCell>

										<TableCell title={ `${session.professor?.id} - ${session.professor?.name}` }>
											{ session.professor?.name ?? '-' }
										</TableCell>

										<TableCell>
											{ session.module.name }
										</TableCell>

										<TableCell>{ session.date ? tempoFormat( session.date ) : '-' }</TableCell>

										<TableCell>{ session.isEnglish ? 'Inglés' : 'Español' }</TableCell>

										<TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    title		= { `${session.planningChangeId ? "Ver" : 'Crear' } Cambio de Planificación` }
                                                    size		= "icon"
                                                    variant		= "outline"
                                                    disabled	= { section.isClosed || section.sessionsCount === 0 }
                                                    className	= {cn(
                                                        " dark:text-white",
                                                        session.planningChangeId ? 'text-white bg-blue-500 hover:text-white hover:bg-blue-600': ''
                                                    )}
                                                    onClick		= { () => {
                                                        setSelectedSesionEdit( session );
                                                        setSelectedSectionEdit( section );
                                                        setIsOpenPlanningChange( true );
                                                    }}
                                                >
                                                    <CalendarClock className="w-4 h-4" />
                                                </Button>

                                                <ActionButton
                                                    editItem            = {() => {
                                                        setSelectedSesionEdit( session )
                                                        setIsEditSection( true );
                                                    }}
                                                    deleteItem          = {() => {
                                                        setSelectedSession( session );
                                                        setIsOpenDelete( true );
                                                    }}
                                                    item                = { session }
                                                    isDisabledEdit      = { section.isClosed }
                                                    isDisabledDelete    = { section.isClosed }
                                                />
                                            </div>
										</TableCell>
									</TableRow>
								))
							)}
                            </TableBody>
						</Table>
					</div>
				</TableCell>
			</TableRow>

			<SessionForm
				isOpen  = { isEditSection }
				onClose = { () => setIsEditSection( false )}
				session = { selectedSessionEdit }
				section = { section }
				onSave  = { () => setIsEditSection( false )}
			/>

            <PlanningChangeForm
				planningChange      = { null }
                section             = { selectedSectionEdit }
				isOpen		        = { isOpenPlanningChange }
				onClose		        = { () => setIsOpenPlanningChange( false )}
                session             = { selectedSessionEdit }
				onSuccess	        = { () => {
					setIsOpenPlanningChange( false );
					queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE ] });
				}}
				onCancel		= { () => setIsOpenPlanningChange( false )}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isOpenDelete }
				onClose     = { () => setIsOpenDelete( false )}
				onConfirm   = { handleConfirmDeleteSession }
				name        = { `Día: ${ tempoFormat( selectedSession?.date )}` }
				type        = { "la Sesión" }
			/>
		</>
	);
}
