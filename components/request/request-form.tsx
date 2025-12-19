"use client"

import { JSX, useCallback, useEffect, useMemo, useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                       from "@tanstack/react-query";
import { z }            from "zod";
import { toast }        from "sonner";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                               from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                               from "@/components/ui/form";
import { Input }                from "@/components/ui/input";
import { Button }               from "@/components/ui/button";
import { SectionSelect }        from "@/components/shared/item-select/section-select";
import { RequestSectionInfo }   from "@/components/request/request-section-info";
import { ShowStatus }           from "@/components/shared/status";
import { RequestSessionForm }   from "@/components/request/request-session-form";

import {
    CreateRequest,
    Request,
    UpdateRequest,
    Status
}                                   from "@/types/request";
import { Role }                     from "@/types/staff.model";
import { OfferSection }             from "@/types/offer-section.model";
import { Session }                  from "@/types/section.model";
import { RequestSessionCreate }     from "@/types/request-session.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { fetchApi, Method }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { useSession }               from "@/hooks/use-session";
import { updateFacultyTotal }       from "@/app/faculty/page";


interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    request     : Request | undefined;
    section?    : OfferSection | null;
}


interface CreateRequestWithSessions extends CreateRequest {
	facultyId?      : string;
	requestSessions : RequestSessionCreate[];
}


const formSchema = z.object({
    title: z.string({
        required_error: "El título es obligatorio",
        invalid_type_error: "El título debe ser un texto"
    }).min( 1, { message: "El título no puede estar vacío" })
    .max( 100, { message: "El título no puede tener más de 100 caracteres" }),
    sectionId: z.string({
		required_error: "Debe seleccionar una sección",
		invalid_type_error: "La sección debe ser un texto"
	}).min(1, { message: "Debe seleccionar una sección" }),
});


export type RequestFormValues = z.infer<typeof formSchema>;

interface SessionDayModule {
	session     : Session;
	dayModuleId : number;
	dayId       : number;
	moduleId    : number;
}


const defaultRequest = ( data : Request | null | undefined, sectionId? : string, facultyId? : string ) => ({
	facultyId   : data?.facultyId   || facultyId || '',
	title       : data?.title       || '',
	status      : data?.status      || Status.PENDING,
	sectionId   : data?.section?.id || sectionId || '',
});


export function RequestForm({
    isOpen,
    onClose,
    request,
    // facultyId,
    section
    // staff
}: Props ): JSX.Element {
    const queryClient   = useQueryClient();

    const [selectedSectionId, setSelectedSectionId] = useState<string | null>( section?.id || request?.section?.id || null );
	const [currentSession, setCurrentSession]       = useState<Session | null>( null );


    const {
        staff,
        isLoading: isLoadingStaff
    } = useSession();

    const isReadOnly    = staff?.role === Role.VIEWER;

      // Obtener la sección seleccionada
	const { data : selectedSection } = useQuery({
		queryKey    : [ KEY_QUERYS.SECTIONS, 'not-planning', selectedSectionId ],
		queryFn     : () => fetchApi<OfferSection>({ url: `sections/${selectedSectionId}` }),
		enabled     : !!selectedSectionId && !section
	});

	const sectionN = section || selectedSection;

    const availableSessions = useMemo(() => {
		if ( !sectionN ) return [];

		const sessions: Session[] = [];

		if ( sectionN.lecture > 0 )          sessions.push( Session.C );
		if ( sectionN.tutoringSession > 0 )  sessions.push( Session.A );
		if ( sectionN.workshop > 0 )         sessions.push( Session.T );
		if ( sectionN.laboratory > 0 )       sessions.push( Session.L );

		return sessions;
	}, [ sectionN ]);


    const [sessionDayModules, setSessionDayModules] = useState<Record<Session, SessionDayModule[]>>({
		[Session.C] : [],
		[Session.A] : [],
		[Session.T] : [],
		[Session.L] : [],
	});


    const [sessionConfigs, setSessionConfigs] = useState<Record<Session, Partial<RequestSessionCreate>>>({
		[Session.C] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
		[Session.A] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
		[Session.T] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
		[Session.L] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
	});


    const [sessionBuildings, setSessionBuildings] = useState<Record<Session, string | null>>({
		[Session.C] : null,
		[Session.A] : null,
		[Session.T] : null,
		[Session.L] : null,
	});

    // Estado para el modo de filtro seleccionado (space, type-size)
	const [sessionFilterMode, setSessionFilterMode] = useState<Record<Session, 'space' | 'type-size'>>({
		[Session.C] : 'type-size',
		[Session.A] : 'type-size',
		[Session.T] : 'type-size',
		[Session.L] : 'type-size',
	});


    const handleClose = useCallback(() => {
		setSessionDayModules({
			[Session.C] : [],
			[Session.A] : [],
			[Session.T] : [],
			[Session.L] : [],
		});

        setCurrentSession( null );

        setSessionConfigs({
			[Session.C] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
			[Session.A] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
			[Session.T] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
			[Session.L] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
		});

        setSessionBuildings({
			[Session.C] : null,
			[Session.A] : null,
			[Session.T] : null,
			[Session.L] : null,
		});

        setSessionFilterMode({
			[Session.C] : 'type-size',
			[Session.A] : 'type-size',
			[Session.T] : 'type-size',
			[Session.L] : 'type-size',
		});

        setSelectedSectionId( null );

        onClose();
	}, [ onClose ]);


    const updateRequestApi = async ( updatedRequest: UpdateRequest ): Promise<Request> =>
        fetchApi<Request>({
            url     : `requests/${updatedRequest.id}`,
            method  : Method.PATCH,
            body    : updatedRequest
        });


    const createRequestWithSessionsApi = async ( payload: CreateRequestWithSessions ): Promise<Request> =>
		fetchApi<Request>({
			url     : 'requests',
			method  : Method.POST,
			body    : payload
		});

    const createRequestMutation = useMutation<Request, Error, CreateRequestWithSessions>({
		mutationFn  : createRequestWithSessionsApi,
		onSuccess   : ( _, variables ) => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SECTIONS ]});
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SECTIONS, 'not-planning' ]});

            updateFacultyTotal( queryClient, staff?.facultyId!, true, 'totalRequests' );
			handleClose();
			toast( 'Solicitud creada exitosamente', successToast );
		},
		onError: ( mutationError ) => toast( `Error al crear solicitud: ${mutationError.message}`, errorToast )
	});

	// Mutation para actualizar request
	const updateRequestMutation = useMutation<Request, Error, UpdateRequest>({
		mutationFn  : updateRequestApi,
		onSuccess   : () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
			handleClose();
			toast( 'Solicitud actualizada exitosamente', successToast );
		},
		onError     : ( mutationError ) => toast( `Error al actualizar la solicitud: ${mutationError.message}`, errorToast )
	});


    const form = useForm<RequestFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultRequest( request, section?.id )
    });

    const sessionLabels: Record<Session, string> = {
        [Session.C] : 'Cátedra',
        [Session.A] : 'Ayudantía',
        [Session.T] : 'Taller',
        [Session.L] : 'Laboratorio',
    };


    useEffect(() => {
        const sectionId = section?.id || request?.section?.id || null;
        form.reset( defaultRequest( request, sectionId || undefined ));
        setSelectedSectionId( sectionId );
    }, [request, section, isOpen, form]);

    function handleSubmit( data: RequestFormValues ): void {
		// Esperar a que termine de cargar antes de validar
		if ( isLoadingStaff ) {
			toast( 'Cargando información del usuario...', { description: 'Por favor espere' });
			return;
		}

		if ( !staff ) {
			toast( 'Por favor, inicie sesión para crear una solicitud', errorToast );
			return;
		}

		if ( request ) {
			// Actualizar request existente
			updateRequestMutation.mutate({
				...data,
				id              : request.id,
				staffUpdateId   : staff.id,
			});
		} else {
			// Validar que todas las sesiones tengan al menos un dayModule
			const invalidSessions = availableSessions.filter( session =>
				sessionDayModules[session].length === 0
			);

			if ( invalidSessions.length > 0 ) {
				toast(
					`Debe seleccionar al menos un horario para: ${invalidSessions.map( s => sessionLabels[s] ).join( ', ' )}`,
					errorToast
				);

				return;
			}

			// Validar que todas las sesiones tengan edificio seleccionado
			const sessionsWithoutBuilding = availableSessions.filter( session => {
				const building = sessionConfigs[session]?.building;
				return !building || building.trim() === '';
			});

			if ( sessionsWithoutBuilding.length > 0 ) {
				toast(
					`Debe seleccionar un edificio para: ${sessionsWithoutBuilding.map( s => sessionLabels[s] ).join( ', ' )}`,
					errorToast
				);

				return;
			}

			// Validar que todas las sesiones tengan al menos un filtro de espacio seleccionado
			const sessionsWithoutSpaceFilter = availableSessions.filter( session => {
				const config            = sessionConfigs[session];
				const hasSpaceId        = config?.spaceId       !== null && config?.spaceId     !== undefined;
				const hasSpaceType      = config?.spaceType     !== null && config?.spaceType   !== undefined;
				const hasSpaceSizeId    = config?.spaceSizeId   !== null && config?.spaceSizeId !== undefined;

				return !hasSpaceId && !hasSpaceType && !hasSpaceSizeId;
			});

			if ( sessionsWithoutSpaceFilter.length > 0 ) {
				toast(
					`Debe seleccionar al menos un filtro de espacio (Espacio específico, Tipo o Tamaño) para: ${sessionsWithoutSpaceFilter.map( s => sessionLabels[s] ).join( ', ' )}`,
					errorToast
				);

				return;
			}

			const requestSessions: RequestSessionCreate[] = availableSessions.map( session => {
				const dayModuleIds  = sessionDayModules[session].map( dm => dm.dayModuleId );
				const config        = sessionConfigs[session];

				return {
					session         : session,
					description     : config.description    || null,
					isEnglish       : config.isEnglish      || false,
					isConsecutive   : config.isConsecutive  || false,
					inAfternoon     : config.inAfternoon    || false,
					spaceSizeId     : config.spaceSizeId    || null,
					spaceType       : config.spaceType      || null,
					professorId     : config.professorId    || null,
					building        : config.building       || '',
					spaceId         : config.spaceId        || null,
					dayModulesId    : dayModuleIds,
				};
			});

			const request = {
				...data,
				staffCreateId   : staff.id,
				requestSessions
			}
			console.log('🚀 ~ file: request-form.tsx:395 ~ dataS:', request)

			createRequestMutation.mutate( request );
		}
	}


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <div className="flex justify-between items-center mr-5">
                        <div className="space-y-1">
                            <DialogTitle>
                                { isReadOnly ? 'Ver Solicitud' : ( request ? 'Editar Solicitud' : 'Crear Solicitud' )}
                            </DialogTitle>

                            <DialogDescription>
                                { isReadOnly 
                                    ? 'Visualización de la solicitud en modo solo lectura'
                                    : 'Realice los cambios necesarios en la solicitud'
                                }
                            </DialogDescription>
                        </div>

                        { request && <ShowStatus status={ request.status } /> }
                    </div>
                </DialogHeader>

                <Form { ...form }>
                    <form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Title */}
                            <FormField
                                control = { form.control }
                                name    = "title"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título</FormLabel>

                                        <FormControl>
                                            <Input 
                                                placeholder = "Ingrese el título de la solicitud"
                                                readOnly    = { isReadOnly }
                                                { ...field }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Section Select */}
                            { !request?.section
                                ? <FormField
                                    control = { form.control }
                                    name    = "sectionId"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <SectionSelect
                                                key                 = { `section-select-${section?.id || 'new'}-${isOpen}` }
                                                label               = "Sección"
                                                multiple            = { false }
                                                placeholder         = "Seleccionar sección"
                                                defaultValues       = { field.value }
                                                disabled            = { !!section || !!request }
                                                onSelectionChange   = {( value ) => {
                                                    const sectionId = typeof value === 'string' ? value : undefined;
                                                    field.onChange( sectionId );
                                                    setSelectedSectionId( sectionId || null );
                                                }}
                                            />

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                : <RequestSectionInfo section={ request.section } />
                            }

                            {/* Request Sessions - Solo para creación */}
                            { !request && sectionN && availableSessions.length > 0 && (
                                <RequestSessionForm
                                    availableSessions           = { availableSessions }
                                    sessionDayModules           = { sessionDayModules }
                                    sessionConfigs              = { sessionConfigs }
                                    sessionBuildings            = { sessionBuildings }
                                    sessionFilterMode           = { sessionFilterMode }
                                    currentSession              = { currentSession }
                                    onSessionDayModulesChange   = { setSessionDayModules }
                                    onSessionConfigsChange      = { setSessionConfigs }
                                    onSessionBuildingsChange    = { setSessionBuildings }
                                    onSessionFilterModeChange   = { setSessionFilterMode }
                                    onCurrentSessionChange      = { setCurrentSession }
                                />
                            )}
                        </div>

                        <div className="flex justify-between space-x-4 pt-4">
                            <Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
                                { isReadOnly ? 'Cerrar' : 'Cancelar' }
                            </Button>

                            { !isReadOnly && (
                                <Button type="submit">
                                    { request ? 'Guardar cambios' : 'Crear solicitud' }
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
