'use client'

import { JSX, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { RequestForm }              from '@/components/request/request-form';
import { RequestSessionEditForm }   from '@/components/request-session/request-session-edit-form';
import { PlanningChangeForm }       from '@/components/planning-change/planning-change-form';

import { Request }          from '@/types/request';
import { KEY_QUERYS }       from '@/consts/key-queries';
import { fetchApi }         from '@/services/fetch';
import { PlanningChange }   from '@/types/planning-change.model';
import { RequestSession }   from '@/types/request-session.model';
import { Comment }          from '@/types/comment.model';


interface NotificationDialogManagerProps {
	children: React.ReactNode | (( props: {
		onRequestClick          : ( requestId: string )                     => void;
		onRequestSessionClick   : ( requestId: string, sessionId: string )  => void;
		onPlanningChangeClick   : ( planningChangeId: string )              => void;
		onCommentClick          : ( comment: Comment )                      => void;
	}) => React.ReactNode );
}

/**
 * Manager component for handling notification-triggered dialogs
 */
export function NotificationDialogManager({
    children
}: NotificationDialogManagerProps ): JSX.Element {
	const queryClient = useQueryClient();

	const [requestDialog, setRequestDialog] = useState<{
		isOpen      : boolean;
		request     : Request | null;
	}>({
		isOpen      : false,
		request     : null,
	});

	const [requestSessionDialog, setRequestSessionDialog] = useState<{
		isOpen              : boolean;
		requestSession      : RequestSession | null;
		requestId           : string;
	}>({
		isOpen              : false,
		requestSession      : null,
		requestId           : '',
	});

	const [planningChangeDialog, setPlanningChangeDialog] = useState<{
		isOpen              : boolean;
		planningChange      : PlanningChange | null;
		openInComments      : boolean;
	}>({
		isOpen              : false,
		planningChange      : null,
		openInComments      : false,
	});

	const [requestSessionCommentDialog, setRequestSessionCommentDialog] = useState<{
		isOpen              : boolean;
		requestSession      : RequestSession | null;
		requestId           : string;
		openInComments      : boolean;
	}>({
		isOpen              : false,
		requestSession      : null,
		requestId           : '',
		openInComments      : false,
	});


    function handleRequestClick( requestId: string ): void {
		console.log( 'handleRequestClick called with requestId:', requestId );

		// Find request in cache from any faculty
		const allQueries = queryClient.getQueriesData({ queryKey: [KEY_QUERYS.REQUESTS] });
		console.log( 'All queries found:', allQueries );

		let foundRequest: Request | undefined;

		for ( const [, requests] of allQueries ) {
			if ( Array.isArray( requests )) {
				foundRequest = requests.find( r => r.id === requestId );

                if ( foundRequest ) {
					console.log( 'Found request in cache:', foundRequest );
					break;
				}
			}
		}

		if ( foundRequest ) {
			console.log( 'Opening request dialog for:', foundRequest );
			setRequestDialog({
				isOpen      : true,
				request     : foundRequest,
			});
		} else {
			console.log( 'Request not found in cache for ID:', requestId );
			console.log( 'Attempting to fetch request directly...' );

			queryClient.fetchQuery({
				queryKey    : [ KEY_QUERYS.REQUESTS, 'single', requestId ],
				queryFn     : () => fetchApi<Request[]>({ url: KEY_QUERYS.REQUESTS }),
			}).then( ( requests ) => {
				if ( requests ) {
					console.log( 'Fetched request directly:', requests );

                    setRequestDialog({
						isOpen      : true,
						request     : requests.find( r => r.id === requestId ) || null,
					});
				} else {
					console.log( 'Request not found after direct fetch for ID:', requestId );
				}
			}).catch( ( error ) => {
				console.error( 'Error fetching request:', error );
			});
		}
	};


	function handlePlanningChangeClick( planningChangeId: string ): void {
		console.log( 'handlePlanningChangeClick called with planningChangeId:', planningChangeId );

		queryClient.fetchQuery({
			queryKey    : [ KEY_QUERYS.PLANNING_CHANGE, 'single', planningChangeId ],
			queryFn     : () => fetchApi<PlanningChange>({ url: `planning-change/${ planningChangeId }` }),
		}).then(( planningChange ) => {
			if ( planningChange ) {
				setPlanningChangeDialog({
					isOpen              : true,
					planningChange      : planningChange,
					openInComments      : false,
				});
			} else {
				console.log( 'Planning change not found after fetch for ID:', planningChangeId );
			}
		}).catch(( error ) => {
			console.error( 'Error fetching planning change:', error );
		});
	};


    function handleRequestSessionClick( requestId: string, sessionId: string ): void {
		console.log( 'handleRequestSessionClick called with requestId:', requestId, 'sessionId:', sessionId );

		// Si no hay requestId, buscar la sesión directamente por ID
		if ( !requestId ) {
			console.log( 'No requestId provided, fetching session directly by ID:', sessionId );
			queryClient.fetchQuery({
				queryKey    : [KEY_QUERYS.REQUEST_SESSION, sessionId],
				queryFn     : () => fetchApi<RequestSession>({ url: `request-sessions/${ sessionId }` }),
			}).then(( requestSession ) => {
				console.log( 'Fetched request session by ID:', requestSession );

				if ( requestSession ) {
					setRequestSessionDialog({
						isOpen              : true,
						requestSession      : requestSession,
						requestId           : requestSession.requestId || '',
					});
				} else {
					console.log( 'Request session not found for sessionId:', sessionId );
				}
			}).catch(( error ) => {
				console.error( 'Error fetching request session by ID:', error );
			});
			return;
		}

		const cachedSessions = queryClient.getQueryData<RequestSession[]>([KEY_QUERYS.REQUEST_SESSION, requestId]);
		console.log( 'Request sessions found in cache:', cachedSessions );

		if ( cachedSessions ) {
			const requestSession = cachedSessions.find( rs => rs.id === sessionId );
			console.log( 'Found request session in cache:', requestSession );

			if ( requestSession ) {
				setRequestSessionDialog({
					isOpen              : true,
					requestSession      : requestSession,
					requestId           : requestId,
				});

                return;
			}
		}

		console.log( 'Request sessions not in cache, fetching...' );
		queryClient.fetchQuery({
			queryKey    : [KEY_QUERYS.REQUEST_SESSION, requestId],
			queryFn     : () => fetchApi<RequestSession[]>({ url: `request-sessions/request/${ requestId }` }),
		}).then(( requestSessions ) => {
			console.log( 'Fetched request sessions:', requestSessions );
			const requestSession = requestSessions?.find( rs => rs.id === sessionId );
			console.log( 'Found request session after fetch:', requestSession );

			if ( requestSession ) {
				setRequestSessionDialog({
					isOpen              : true,
					requestSession      : requestSession,
					requestId           : requestId,
				});
			} else {
				console.log( 'Request session not found after fetch for sessionId:', sessionId );
			}
		}).catch(( error ) => {
			console.error( 'Error fetching request sessions:', error );
		});
	};


	/**
	 * Handle comment click notification
	 * Fetches the related RequestSession or PlanningChange and opens the form in comments tab
	 */
	function handleCommentClick( comment: Comment ): void {
		console.log( 'handleCommentClick called with comment:', comment );

		// Si el comentario es de un RequestSession
		if ( comment.requestSessionId ) {
			console.log( 'Fetching RequestSession for comment:', comment.requestSessionId );

			queryClient.fetchQuery({
				queryKey    : [KEY_QUERYS.REQUEST_SESSION, comment.requestSessionId],
				queryFn     : () => fetchApi<RequestSession>({ url: `request-sessions/${ comment.requestSessionId }` }),
			}).then(( requestSession ) => {
				if ( requestSession ) {
					console.log( 'Fetched RequestSession:', requestSession );

					setRequestSessionCommentDialog({
						isOpen              : true,
						requestSession      : requestSession,
						requestId           : requestSession.requestId || '',
						openInComments      : true,
					});
				} else {
					console.log( 'RequestSession not found for ID:', comment.requestSessionId );
				}
			}).catch(( error ) => {
				console.error( 'Error fetching RequestSession:', error );
			});
		}
		// Si el comentario es de un PlanningChange
		else if ( comment.planningChangeId ) {
			console.log( 'Fetching PlanningChange for comment:', comment.planningChangeId );

			queryClient.fetchQuery({
				queryKey    : [KEY_QUERYS.PLANNING_CHANGE, 'single', comment.planningChangeId],
				queryFn     : () => fetchApi<PlanningChange>({ url: `planning-change/${ comment.planningChangeId }` }),
			}).then(( planningChange ) => {
				if ( planningChange ) {
					console.log( 'Fetched PlanningChange:', planningChange );

					setPlanningChangeDialog({
						isOpen              : true,
						planningChange      : planningChange,
						openInComments      : true,
					});
				} else {
					console.log( 'PlanningChange not found for ID:', comment.planningChangeId );
				}
			}).catch(( error ) => {
				console.error( 'Error fetching PlanningChange:', error );
			});
		}
	};


	return (
		<>
			{/* Pass handlers to children (Notifications component) */}
			{typeof children === 'function' 
				? children({ 
					onRequestClick          : handleRequestClick, 
					onRequestSessionClick   : handleRequestSessionClick,
					onPlanningChangeClick   : handlePlanningChangeClick,
					onCommentClick          : handleCommentClick,
				})
				: children
			}

			{/* Request Dialog */}
			{requestDialog.request && (
				<RequestForm
					isOpen      = { requestDialog.isOpen }
					onClose     = { () => setRequestDialog( prev => ({ ...prev, isOpen: false }))}
					request     = { requestDialog.request }
					// facultyId   = { requestDialog.request.facultyId }
				/>
			)}

			{/* Request Session Dialog */}
			{requestSessionDialog.requestSession && (
				<RequestSessionEditForm
					isOpen              = { requestSessionDialog.isOpen }
					onClose             = { () => setRequestSessionDialog({ isOpen: false, requestSession: null, requestId: '' }) }
					onCancel            = { () => setRequestSessionDialog({ isOpen: false, requestSession: null, requestId: '' }) }
					onSuccess           = { () => setRequestSessionDialog({ isOpen: false, requestSession: null, requestId: '' }) }
					requestSession      = { requestSessionDialog.requestSession }
					requestId           = { requestSessionDialog.requestId }
				/>
			)}

			{/* Planning Change Dialog */}
			{planningChangeDialog.planningChange && (
				<PlanningChangeForm
					isOpen              = { planningChangeDialog.isOpen }
					onClose             = { () => setPlanningChangeDialog({ isOpen: false, planningChange: null, openInComments: false }) }
					onCancel            = { () => setPlanningChangeDialog({ isOpen: false, planningChange: null, openInComments: false }) }
					onSuccess           = { () => setPlanningChangeDialog({ isOpen: false, planningChange: null, openInComments: false }) }
					planningChange      = { planningChangeDialog.planningChange }
					section             = { null }
					defaultTab          = { planningChangeDialog.openInComments ? 'comments' : 'form' }
				/>
			)}

			{/* Request Session Dialog for Comments */}
			{requestSessionCommentDialog.requestSession && (
				<RequestSessionEditForm
					isOpen              = { requestSessionCommentDialog.isOpen }
					onClose             = { () => setRequestSessionCommentDialog({ isOpen: false, requestSession: null, requestId: '', openInComments: false }) }
					onCancel            = { () => setRequestSessionCommentDialog({ isOpen: false, requestSession: null, requestId: '', openInComments: false }) }
					onSuccess           = { () => setRequestSessionCommentDialog({ isOpen: false, requestSession: null, requestId: '', openInComments: false }) }
					requestSession      = { requestSessionCommentDialog.requestSession }
					requestId           = { requestSessionCommentDialog.requestId }
					defaultTab          = { requestSessionCommentDialog.openInComments ? 'comments' : 'form' }
				/>
			)}
		</>
	);
}
