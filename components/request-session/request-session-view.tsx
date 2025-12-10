"use client"

import { JSX, useState, useMemo, useCallback } from "react";

import { Edit } from "lucide-react";

import {
	useMutation,
	useQuery,
	useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import { Button }					from "@/components/ui/button";
import { RequestSessionEditForm }	from "@/components/request-session/request-session-edit-form";
import { RequestSessionList }		from "@/components/request-session/request-session-list";
import { RequestSessionErrorCard }	from "@/components/request-session/request-session-card-skeleton";
import { RequestSessionTable }		from "@/components/request-session/request-session-table";
import { ViewMode }					from "@/components/shared/view-mode";
import { SessionDayModuleSelector }	from "@/components/session/session-day-module-selector";
import { Card, CardContent }		from "@/components/ui/card";
import { ScrollArea }               from "@/components/ui/scroll-area";

import {
	errorToast,
	successToast
}								from "@/config/toast/toast.config";
import { useViewMode }			from "@/hooks/use-view-mode";
import type { Request }			from "@/types/request";
import type { RequestSession }  from "@/types/request-session.model";
import type { DayModule }		from "@/types/request";
import { Session }				from "@/types/section.model";
import { KEY_QUERYS }			from "@/consts/key-queries";
import { Method, fetchApi }		from "@/services/fetch";


interface Props {
	request	: Request;
	onBack	: () => void;
}


interface SessionDayModule {
	session			: Session;
	dayModuleId		: number;
	dayId			: number;
	moduleId		: number;
}


interface RequestSessionDayModuleUpdate {
	requestSessionId	: string;
	dayModulesId	: number[];
}


export function RequestSessionView({
	request,
	onBack,
}: Props ): JSX.Element {
	const queryClient									            = useQueryClient();
	const [selectedSession, setSelectedSession]		                = useState<RequestSession | undefined>( undefined );
	const [isOpenEdit, setIsOpenEdit]				                = useState( false );
	const [isEditingModules, setIsEditingModules]                   = useState( false );
	const [currentSessionForModules, setCurrentSessionForModules]   = useState<Session | null>( null );
	const { viewMode, onViewChange }				                = useViewMode({ queryName: 'viewSession' });


	const {
		data,
		isLoading,
		isError,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.REQUEST_SESSION, request.id ],
		queryFn		: () => fetchApi<RequestSession[]>({ url: `request-sessions/request/${request.id}` }),
	});

	// Load dayModules to convert IDs
	const {
		data		: dayModules = [],
		isLoading	: isLoadingDayModules,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.MODULES, 'dayModules' ],
		queryFn		: () => fetchApi<DayModule[]>({ url: 'modules/dayModule' }),
	});

	// Convert sessionDayModules to SessionDayModule format for the selector
	const allSessionDayModules = useMemo(() => {
		if ( !data || dayModules.length === 0 ) return [];

		const modules: SessionDayModule[] = [];

		data.forEach( requestSession => {
			requestSession.sessionDayModules.forEach( dayModuleId => {
				// Find the dayModule to get dayId and moduleId
				const dayModule = dayModules.find( dm => dm.id === dayModuleId );

				if ( dayModule ) {
					modules.push({
						session		: requestSession.session,
						dayModuleId	: dayModuleId,
						dayId		: dayModule.dayId,
						moduleId	: dayModule.moduleId,
					});
				}
			});
		});

		return modules;
	}, [ data, dayModules ]);

	// State for managing module selection during edit
	const [editingSessionDayModules, setEditingSessionDayModules] = useState<Record<string, number[]>>({});

	// Initialize editing state when edit mode is enabled
	const handleStartEditingModules = useCallback(() => {
		if ( !data ) return;

		const initialModules: Record<string, number[]> = {};

		data.forEach( requestSession => {
			initialModules[requestSession.id] = [...requestSession.sessionDayModules];
		});

		setEditingSessionDayModules( initialModules );
		setIsEditingModules( true );
	}, [ data ]);

	// Handle toggle of day module
	const handleToggleDayModule = useCallback(( session: Session, dayId: number, moduleId: number, dayModuleId: number ) => {
		if ( !data ) return;

		// Find the request session with this session type
		const requestSession = data.find( rs => rs.session === session );

		if ( !requestSession ) return;

		setEditingSessionDayModules( prev => {
			const currentModules = prev[requestSession.id] || [];
			const existingIndex = currentModules.findIndex( id => id === dayModuleId );

			if ( existingIndex >= 0 ) {
				// Remove
				return {
					...prev,
					[requestSession.id]: currentModules.filter(( _, index ) => index !== existingIndex ),
				};
			} else {
				// Validar que no se repita el mismo tipo de sesión en el mismo día/módulo
				const sessionsOfThisType = data.filter( rs => rs.session === session );
				const isDayModuleUsedByThisSessionType = sessionsOfThisType.some( rs => {
					const modules = prev[rs.id] || [];
					return modules.includes( dayModuleId );
				});

				if ( isDayModuleUsedByThisSessionType ) {
					toast(
						`Este horario ya está siendo usado por otra ${session}`,
						{
							...errorToast,
							description: 'No puedes seleccionar el mismo horario para el mismo tipo de sesión'
						}
					);
					return prev;
				}

				// Add (permitir múltiples sesiones en el mismo día/módulo de diferentes tipos)
				return {
					...prev,
					[requestSession.id]: [...currentModules, dayModuleId],
				};
			}
		});
	}, [ data ]);

	// Save module changes
	const updateModulesMutation = useMutation({
		mutationFn: async ( updates: RequestSessionDayModuleUpdate[] ) => {
			return fetchApi({
				url		: `request-sessions/day-modules`,
				method	: Method.PATCH,
				body	: updates,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUEST_SESSION, request.id ]});
			toast( 'Módulos actualizados exitosamente', successToast );
			setIsEditingModules( false );
			setCurrentSessionForModules( null );
		},
		onError: ( error: Error ) => {
			toast( `Error al actualizar módulos: ${error.message}`, errorToast );
		},
	});


	const handleSaveModules = () => {
		const updates: RequestSessionDayModuleUpdate[] = Object
            .entries( editingSessionDayModules )
            .map(([ requestSessionId, dayModulesId ]) => ({
                requestSessionId,
                dayModulesId,
            }));

        console.log('🚀 ~ file: request-session-view.tsx:211 ~ updates:', updates)
		updateModulesMutation.mutate( updates );
	};


	const handleCancelEditModules = () => {
		setIsEditingModules( false );
		setCurrentSessionForModules( null );
		setEditingSessionDayModules({});
	};


	function onEditRequestSession( requestSession: RequestSession ) {
		setIsOpenEdit( true );
		setSelectedSession( requestSession );
	}


	const onSuccess = (): void => {
		setIsOpenEdit( false );
		setSelectedSession( undefined );
	};

	// Get available sessions from data
	const availableSessions = useMemo(() => {
		if ( !data ) return [];

		return data.map( rs => rs.session );
	}, [ data ]);


	// Convert editing modules to SessionDayModule format
	const selectedSessionDayModules = useMemo(() => {
		// When not editing, show the original modules from data
		if ( !isEditingModules ) return allSessionDayModules;

		// When editing, show the modules being edited
		if ( !data || dayModules.length === 0 ) return [];

		const modules: SessionDayModule[] = [];

		Object.entries( editingSessionDayModules ).forEach(([ requestSessionId, dayModuleIds ]) => {
			const requestSession = data.find( rs => rs.id === requestSessionId );

			if ( requestSession ) {
				dayModuleIds.forEach( dayModuleId => {
					// Find the dayModule to get dayId and moduleId
					const dayModule = dayModules.find( dm => dm.id === dayModuleId );

					if ( dayModule ) {
						modules.push({
							session		: requestSession.session,
							dayModuleId	: dayModuleId,
							dayId		: dayModule.dayId,
							moduleId	: dayModule.moduleId,
						});
					}
				});
			}
		});

		return modules;
	}, [ isEditingModules, editingSessionDayModules, data, dayModules, allSessionDayModules ]);


	return (
		<div className="space-y-4">
			{/* Request Info */}
			{/* <RequestInfoCard
				request	= { request }
				onBack	= { onBack }
			/> */}

			{/* Request Sessions */}
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-2">
					<h2 className="text-xl font-semibold">Detalles de la Solicitud ({ data?.length ?? 0 })</h2>

					<ViewMode
						viewMode		= { viewMode }
						onViewChange	= { onViewChange }
					/>
				</div>

                <ScrollArea className="h-[calc(100vh-580px)]"> 
                    {isError ? (
                        <RequestSessionErrorCard />
                    ) : (
                        <>
                            { viewMode === 'cards' ? (
                                <RequestSessionList
                                    data		= { data }
                                    isLoading	= { isLoading }
                                    onEdit		= { onEditRequestSession }
                                />
                            ) : (
                                <RequestSessionTable
                                    data		= { data }
                                    isLoading	= { isLoading }
                                    onEdit		= { onEditRequestSession }
                                />
                            )}
                        </>
                    )}

                    {/* Unified SessionDayModuleSelector */}
                    { !isLoading && !isError && data && data.length > 0 && (
                        <Card className="mt-4">
                            <CardContent className="space-y-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Horarios de Sesiones</h3>

                                    {!isEditingModules ? (
                                        <Button
                                            variant	= "outline"
                                            size	= "sm"
                                            onClick	= { handleStartEditingModules }
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar Horarios
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                variant		= "outline"
                                                size		= "sm"
                                                onClick		= { handleCancelEditModules }
                                                disabled	= { updateModulesMutation.isPending }
                                            >
                                                Cancelar
                                            </Button>

                                            <Button
                                                size		= "sm"
                                                onClick		= { handleSaveModules }
                                                disabled	= { updateModulesMutation.isPending }
                                            >
                                                { updateModulesMutation.isPending ? 'Guardando...' : 'Guardar Cambios' }
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <SessionDayModuleSelector
                                selectedSessions        = { selectedSessionDayModules }
                                onToggleDayModule       = { handleToggleDayModule }
                                currentSession          = { currentSessionForModules }
                                availableSessions       = { availableSessions }
                                enabled                 = { isEditingModules }
                                multiple                = { true }
                                onCurrentSessionChange  = { setCurrentSessionForModules }
                            />    
                            </CardContent>
                        </Card>
                    )}

                    <RequestSessionEditForm
                        requestSession	= { selectedSession }
                        onSuccess		= { onSuccess }
                        onCancel		= { () => setIsOpenEdit( false )}
                        isOpen			= { isOpenEdit }
                        onClose			= { () => setIsOpenEdit( false )}
                        requestId		= { request.id }
                    />
                </ScrollArea>
			</div>
		</div>
	);
}
