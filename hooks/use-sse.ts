import { useEffect } from 'react';

import {
    QueryClient,
    useQueryClient
}                   from '@tanstack/react-query';
import { toast }    from 'sonner';

import { Request }           from '@/types/request';
import { EmitEvent, EnumAction, Type }      from '@/types/emit-event';
import { Notification, NotificationState }  from '@/types/notification';
import { KEY_QUERYS }                       from '@/consts/key-queries';
import { errorToast, successToast }         from '@/config/toast/toast.config';
import { ENV }                              from '@/config/envs/env';
import { RequestDetail } from '@/types/request-detail.model';


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
        const eventSource = new EventSource( url );
        console.log("🚀 ~ file: use-sse.ts:159 ~ urlOrigin:", window.origin)

        eventSource.onmessage = ( event: MessageEvent ) => {
            try {
                const emitEvent: EmitEvent = JSON.parse( event.data );
                const { message, action, type, origin } = emitEvent;

                console.log(`********SSE Event Received: Type=${type}, Action=${action}, Origin=${origin}`,message);

                if ( origin === window.origin ) {
                    console.log("🚀 origin same:", window.origin);
                    return;
                }

                if ( !( message as Request | RequestDetail ).id ) {
                    console.error( 'Request received via SSE is missing id, cannot update specific query cache.' );
                    return;
                }

                switch ( type ) {
                    case Type.DETAIL:
                        handleRequestDetail( action, message as RequestDetail );
                    break;

                    case Type.REQUEST:
                        handleRequest( action, message as Request );
                    break;
                }
            } catch (error) {
                console.error('Error parsing SSE event data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            toast( 'Ocurrió un error con las notificaciones:', errorToast );
        };

        return () => {
            console.log('Closing EventSource connection...');
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
     * Maneja las actualizaciones de la entidad RequestDetail en la caché.
     * @param action El tipo de acción (CREATE, UPDATE, DELETE)
     * @param detail La entidad RequestDetail recibida
     */
    function handleRequestDetail( action: EnumAction, detail: RequestDetail ): void {
        const queryKey = [KEY_QUERYS.REQUEST_DETAIL, detail.requestId]; 

        switch ( action ) {
            case EnumAction.CREATE:
                onCreateQuery<RequestDetail>( 
                    queryClient, 
                    queryKey, 
                    detail, 
                    `Nuevo detalle de solicitud: ${detail.id}`,
                    Type.DETAIL,
                    { 
                        entityId    : detail.id, 
                        requestId   : detail.requestId
                    }
                );
            break;

            case EnumAction.UPDATE:
                onUpdateQuery<RequestDetail>( 
                    queryClient, 
                    queryKey, 
                    detail, 
                    `Detalle de Solicitud Actualizado: ${detail.id}`,
                    Type.DETAIL,
                    { 
                        entityId    : detail.id, 
                        requestId   : detail.requestId
                    }
                );
            break;

            case EnumAction.DELETE:
                onDeleteQuery<RequestDetail>( 
                    queryClient, 
                    queryKey, 
                    detail, 
                    `Detalle de Solicitud Eliminado: ${detail.id}`,
                    Type.DETAIL,
                    { 
                        entityId    : detail.id, 
                        requestId   : detail.requestId
                    }
                );
            break;
        }
    };
};
