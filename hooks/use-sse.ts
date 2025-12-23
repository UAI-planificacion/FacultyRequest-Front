import { useEffect } from 'react';

import {
    QueryClient,
    useQueryClient
}                   from '@tanstack/react-query';
import { toast }    from 'sonner';

import { Request }                          from '@/types/request';
import { EmitEvent, EnumAction, Type }      from '@/types/emit-event';
import { Notification, NotificationState }  from '@/types/notification';
import { KEY_QUERYS }                       from '@/consts/key-queries';
import { errorToast, successToast }         from '@/config/toast/toast.config';
import { ENV }                              from '@/config/envs/env';
import { PlanningChange }                   from '@/types/planning-change.model';
import { RequestSession }                   from '@/types/request-session.model';
import { Comment }                          from '@/types/comment.model';

/**
 * Creates a notification and adds it to the notifications state
 */
function addNotification(
    queryClient : QueryClient,
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
): void {
    const newNotification: Notification = {
        ...notification,
        id          : `${Date.now()}-${Math.random()}`,
        timestamp   : new Date(),
        read        : false,
    };

    queryClient.setQueryData(
        [KEY_QUERYS.NOTIFICATIONS],
        ( oldState: NotificationState | undefined ) => {
            const currentState = oldState || { notifications: [], unreadCount: 0 };

            return {
                notifications   : [newNotification, ...currentState.notifications],
                unreadCount     : currentState.unreadCount + 1,
            };
        }
    );
}


function onCreateQuery<T>(
    queryClient : QueryClient,
    queryKey    : string[],
    request     : T,
    name        : string,
    type        : Type,
    entityData  : { entityId: string; requestId?: string }
): void {
    queryClient.setQueryData(
        queryKey,
        ( oldRequests: T[] ) => {
            if ( oldRequests ) {
                if ( !oldRequests.some( req => ( req as any ).id === ( request as any ).id )) {
                    return [...oldRequests, request];
                }
            } else {
                return [request];
            }

            return oldRequests;
        }
    );

    // Add notification
    addNotification( queryClient, {
        title       : `Nuevo ${type === Type.REQUEST ? 'Solicitud' : 'Detalle'}`,
        message     : name,
        action      : EnumAction.CREATE,
        type,
        entityId    : entityData.entityId,
        requestId   : entityData.requestId,
    });

    toast( `${name}`, successToast );
}


function onUpdateQuery<T>(
    queryClient : QueryClient,
    queryKey    : string[],
    data        : T,
    name        : string,
    type        : Type,
    entityData  : { entityId: string; requestId?: string }
): void {
    queryClient.setQueryData(
        queryKey,
        ( oldRequests: T[] ) => {
            if ( oldRequests ) {
                return oldRequests
                .map( req => (( req as any ).id === ( data as any ).id ? data : req ));
            }

            return oldRequests;
        }
    );

    // Add notification
    addNotification( queryClient, {
        title       : `${type === Type.REQUEST ? 'Solicitud' : 'Detalle'} Actualizado`,
        message     : name,
        action      : EnumAction.UPDATE,
        type,
        entityId    : entityData.entityId,
        requestId   : entityData.requestId,
    });

    toast( `${name}`, successToast );
}


function onDeleteQuery<T>(
    queryClient : QueryClient,
    queryKey    : string[],
    data        : T,
    name        : string,
    type        : Type,
    entityData  : { entityId: string; requestId?: string }
): void {
    queryClient.setQueryData(
        queryKey,
        ( oldRequests: T[] ) => {
            if ( oldRequests ) {
                return oldRequests
                .filter( req => ( req as any ).id !== ( data as any ).id );
            }

            return oldRequests;
        }
    );

    // Add notification
    addNotification( queryClient, {
        title       : `${type === Type.REQUEST ? 'Solicitud' : 'Detalle'} Eliminado`,
        message     : name,
        action      : EnumAction.DELETE,
        type,
        entityId    : entityData.entityId,
        requestId   : entityData.requestId,
    });

    toast( `${name}`, successToast );
}

/**
 * Hook para escuchar eventos SSE y actualizar la caché de TanStack Query de forma genérica.
 */
export const useSSE = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const url = `${ENV.REQUEST_BACK_URL}${ENV.SSE_ENDPOINT}`;
        console.log('🚀 ~ file: use-sse.ts:158 ~ url:', url)
        const eventSource = new EventSource( url );

        eventSource.onmessage = ( event: MessageEvent ) => {
            try {
                const emitEvent: EmitEvent = JSON.parse( event.data );
                console.log('🚀 ~ file: use-sse.ts:164 ~ emitEvent:', emitEvent)
                const { message, action, type, origin } = emitEvent;

                console.log( `********SSE Event Received: Type=${ type }, Action=${ action }, Origin=${ origin }`, message );

                if ( origin === window.origin ) {
                    console.log( "🚀 origin same:", window.origin );
                    return;
                }

                if ( !( message as Request | RequestSession | PlanningChange | Comment ).id ) {
                    console.error( 'Message received via SSE is missing id, cannot update specific query cache.' );
                    return;
                }

                switch ( type ) {
                    case Type.REQUEST_SESSION:
                        handleRequestSession( action, message as RequestSession );
                    break;

                    case Type.REQUEST:
                        handleRequest( action, message as Request );
                    break;

                    case Type.PLANNING_CHANGE:
                        handlePlanningChange( action, message as PlanningChange );
                    break;

                    case Type.COMMENT:
                        handleComment( action, message as Comment );
                    break;
                }
            } catch ( error ) {
                console.error( 'Error parsing SSE event data:', error );
            }
        };

        eventSource.onerror = ( error ) => {
            console.error( 'EventSource failed:', error );
            toast( 'Ocurrió un error con las notificaciones:', errorToast );
        };

        return () => {
            console.log( 'Closing EventSource connection...' );
            eventSource.close();
        };
    }, []);

    /**
     * Maneja las actualizaciones de la entidad Request en la caché.
     * @param action El tipo de acción (CREATE, UPDATE, DELETE)
     * @param request La entidad Request recibida
     */
    function handleRequest( action: EnumAction, request: Request ) {
        const queryKey = [KEY_QUERYS.REQUESTS, request.facultyId];

        switch ( action ) {
            case EnumAction.CREATE:
                onCreateQuery<Request>( 
                    queryClient, 
                    queryKey, 
                    request, 
                    `Nueva solicitud: ${request.title}`,
                    Type.REQUEST,
                    { 
                        entityId    : request.id
                    }
                );
            break;

            case EnumAction.UPDATE:
                onUpdateQuery<Request>( 
                    queryClient, 
                    queryKey, 
                    request, 
                    `Solicitud Actualizada: ${request.title}`,
                    Type.REQUEST,
                    { 
                        entityId    : request.id
                    }
                );
            break;

            case EnumAction.DELETE:
                onDeleteQuery<Request>( 
                    queryClient, 
                    queryKey, 
                    request, 
                    `Solicitud Eliminada: ${request.title}`,
                    Type.REQUEST,
                    { 
                        entityId    : request.id
                    }
                );
            break;
        }
    };

    /**
     * Maneja las actualizaciones de la entidad RequestSession en la caché.
     * @param action El tipo de acción (CREATE, UPDATE, DELETE)
     * @param requestSession La entidad RequestSession recibida
     */
    function handleRequestSession( action: EnumAction, requestSession: RequestSession ): void {
        const requestId = requestSession.requestId;

        if ( !requestId ) {
            console.warn( 'RequestSession SSE event without requestId. Skipping cache update.' );

            notifyRequestSession( action, requestSession, undefined );
            return;
        }

        const queryKey = [KEY_QUERYS.REQUEST_SESSION, requestId];

        switch ( action ) {
            case EnumAction.CREATE:
                onCreateQuery<RequestSession>( 
                    queryClient, 
                    queryKey, 
                    requestSession, 
                    `Nueva sesión de solicitud (${requestSession.session})`,
                    Type.REQUEST_SESSION,
                    { 
                        entityId    : requestSession.id, 
                        requestId   : requestId
                    }
                );
            break;

            case EnumAction.UPDATE:
                onUpdateQuery<RequestSession>( 
                    queryClient, 
                    queryKey, 
                    requestSession, 
                    `Sesión de solicitud actualizada (${requestSession.session})`,
                    Type.REQUEST_SESSION,
                    { 
                        entityId    : requestSession.id, 
                        requestId   : requestId
                    }
                );
            break;

            case EnumAction.DELETE:
                onDeleteQuery<RequestSession>( 
                    queryClient, 
                    queryKey, 
                    requestSession, 
                    `Sesión de solicitud eliminada (${requestSession.session})`,
                    Type.REQUEST_SESSION,
                    { 
                        entityId    : requestSession.id, 
                        requestId   : requestId
                    }
                );
            break;
        }

        notifyRequestSession( action, requestSession, requestId );
    };


    function notifyRequestSession( action: EnumAction, requestSession: RequestSession, requestId: string | undefined ): void {
        let title       = '';
        let toastLabel  = '';

        switch ( action ) {
            case EnumAction.CREATE:
                title       = 'Nueva Sesión de Solicitud';
                toastLabel  = `Se creó una sesión (${requestSession.session})`;
            break;

            case EnumAction.UPDATE:
                title       = 'Sesión de Solicitud Actualizada';
                toastLabel  = `Se actualizó una sesión (${requestSession.session})`;
            break;

            case EnumAction.DELETE:
                title       = 'Sesión de Solicitud Eliminada';
                toastLabel  = `Se eliminó una sesión (${requestSession.session})`;
            break;
        }

        if ( title ) {
            addNotification( queryClient, {
                title,
                message     : requestSession.description || `Sesión ${requestSession.session}`,
                action,
                type        : Type.REQUEST_SESSION,
                entityId    : requestSession.id,
                requestId,
            });

            toast( toastLabel, successToast );
        }
    }


    function handlePlanningChange( action: EnumAction, planningChange: PlanningChange ): void {
        queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.PLANNING_CHANGE] });

        let title       = '';
        let toastLabel  = '';

        switch ( action ) {
            case EnumAction.CREATE:
                title       = 'Nuevo Cambio de Planificación';
                toastLabel  = `Cambio de planificación creado: ${planningChange.title}`;
            break;

            case EnumAction.UPDATE:
                title       = 'Cambio de Planificación Actualizado';
                toastLabel  = `Cambio de planificación actualizado: ${planningChange.title}`;
            break;

            case EnumAction.DELETE:
                title       = 'Cambio de Planificación Eliminado';
                toastLabel  = `Cambio de planificación eliminado: ${planningChange.title}`;
            break;
        }

        if ( title ) {
            addNotification( queryClient, {
                title,
                message     : planningChange.title,
                action,
                type        : Type.PLANNING_CHANGE,
                entityId    : planningChange.id,
            });

            toast( toastLabel, successToast );
        }
    };


    /**
     * Maneja las notificaciones de comentarios
     * @param action El tipo de acción (CREATE, UPDATE, DELETE)
     * @param comment El comentario recibido
     */
    function handleComment( action: EnumAction, comment: Comment ): void {
        let title       = '';
        let message     = '';
        let toastLabel  = '';

        // Determinar el título y mensaje según la acción
        switch ( action ) {
            case EnumAction.CREATE:
                title       = 'Nuevo Comentario';
                toastLabel  = 'Se creó un nuevo comentario';
            break;

            case EnumAction.UPDATE:
                title       = 'Comentario Actualizado';
                toastLabel  = 'Se actualizó un comentario';
            break;

            case EnumAction.DELETE:
                title       = 'Comentario Eliminado';
                toastLabel  = 'Se eliminó un comentario';
            break;
        }

        // Determinar el tipo de entidad según los IDs
        if ( comment.requestSessionId ) {
            message = `${title} en sesión de solicitud`;
        } else if ( comment.planningChangeId ) {
            message = `${title} en cambio de planificación`;
        }

        if ( message ) {
            addNotification( queryClient, {
                title,
                message,
                action,
                type        : Type.COMMENT,
                entityId    : comment.id,
                comment     : comment,
            });

            toast( toastLabel, successToast );
        }
    };
};
