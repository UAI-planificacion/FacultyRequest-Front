"use client"

import { JSX, useEffect, useMemo, useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                                   from "@tanstack/react-query";
import { z }                        from "zod";
import { toast }                    from "sonner";
import { zodResolver }              from "@hookform/resolvers/zod";
import { useForm, SubmitHandler }   from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                           from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                           from "@/components/ui/form";
import { Input }            from "@/components/ui/input";
import { Button }           from "@/components/ui/button";
import { SectionSelect } from "@/components/shared/item-select/section-select";
import { RequestSectionInfo } from "@/components/request/request-section-info";
import { ShowStatus }       from "@/components/shared/status";
import { RequestSessionForm } from "@/components/request/request-session-form";

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

interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    request     : Request | undefined;
    facultyId   : string;
    section?    : OfferSection | null;
    // staff       : Staff | undefined;
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
	facultyId       : data?.facultyId       || facultyId || '',
	title           : data?.title           || '',
	status          : data?.status          || Status.PENDING,
	sectionId       : data?.section?.id     || sectionId || '',
});


export function RequestForm({
    isOpen,
    onClose,
    request,
    facultyId,
    section
    // staff
}: Props ): JSX.Element {
	const [selectedSectionId, setSelectedSectionId] = useState<string | null>( section?.id || request?.section?.id || null );
	const [currentSession, setCurrentSession] = useState<Session | null>( null );


    const queryClient   = useQueryClient();
    const { staff, isLoading: isLoadingStaff }     = useSession();
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


    const createRequestApi = async ( request: CreateRequest ): Promise<Request> =>
        fetchApi<Request>({
            url     : 'requests',
            method  : Method.POST,
            body    : request
        });


    const updateRequestApi = async ( updatedRequest: UpdateRequest ): Promise<Request> =>
        fetchApi<Request>({
            url     : `requests/${updatedRequest.id}`,
            method  : Method.PATCH,
            body    : updatedRequest
        });


    const createRequestMutation = useMutation<Request, Error, CreateRequest>({
        mutationFn: createRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});availableSessions
            onClose();
            toast( 'Solicitud creada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al crear solicitud: ${ mutationError.message }`, errorToast )
    });


    const updateRequestMutation = useMutation<Request, Error, UpdateRequest>({
        mutationFn: updateRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
            onClose();
            toast( 'Solicitud actualizada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al actualizar la solicitud: ${ mutationError.message }`, errorToast )
    });


    const form = useForm<RequestFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultRequest( request )
    });


    useEffect(() => {
        form.reset( defaultRequest( request ));
        setSelectedSectionId( section?.id || request?.section?.id || null );
    }, [request, isOpen]);


    const handleSubmit: SubmitHandler<RequestFormValues> = ( formData ) => {
        if ( isLoadingStaff ) {
			toast( 'Cargando información del usuario...', { description: 'Por favor espere' });
			return;
		}

		if ( !staff ) {
			toast( 'Por favor, inicie sesión para crear una solicitud', errorToast );
			return;
		}

        if ( request ) {
            const updateRequest = {
                ...formData,
                id: request.id,
                staffUpdateId: staff?.id
            } as UpdateRequest;

                console.log('🚀 ~ file: request-form.tsx:224 ~ updateRequest:', updateRequest)


            updateRequestMutation.mutate( updateRequest );
        } else {
            const createRequest = {
                ...formData,
                staffCreateId: staff?.id
            }  as CreateRequest;

            createRequestMutation.mutate( createRequest );
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
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

                        { request && <ShowStatus status={request.status} /> }
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit( handleSubmit )} className="space-y-4">
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
                                                {...field} 
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
