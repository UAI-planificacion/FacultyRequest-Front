'use client'

import { JSX, useState } from 'react';

import { useQueryClient, useQuery } from '@tanstack/react-query';

import { RequestForm }          from '@/components/request/request-form';

import { KEY_QUERYS }   from '@/consts/key-queries';
import { fetchApi }     from '@/services/fetch';
import { ENV }          from '@/config/envs/env';

import { Module, Request }  from '@/types/request';
import { Professor }        from '@/types/professor';
import { RequestDetail }    from '@/types/request-detail.model';
import { Staff }            from '@/types/staff.model';


interface NotificationDialogManagerProps {
	children: React.ReactNode | (( props: {
		onRequestClick      : ( requestId: string ) => void;
		onRequestDetailClick: ( requestId: string, detailId: string ) => void;
	}) => React.ReactNode );
}

/**
 * Manager component for handling notification-triggered dialogs
 */
export function NotificationDialogManager({
    children
}: NotificationDialogManagerProps ): JSX.Element {
	const queryClient   = useQueryClient();
    const staff         = queryClient.getQueryData<Staff>([ KEY_QUERYS.STAFF ]);


	const [requestDialog, setRequestDialog] = useState<{
		isOpen      : boolean;
		request     : Request | null;
	}>({
		isOpen      : false,
		request     : null,
	});

	const [requestDetailDialog, setRequestDetailDialog] = useState<{
		isOpen          : boolean;
		requestDetail   : RequestDetail | null;
		requestId       : string;
	}>({
		isOpen          : false,
		requestDetail   : null,
		requestId       : '',
	});

	// Query for professors (needed for request detail form)
	const {
		data        : professors = [],
		isLoading   : isLoadingProfessors,
		isError     : isErrorProfessors,
	} = useQuery<Professor[]>({
		queryKey    : [KEY_QUERYS.PROFESSORS],
        queryFn     : () => fetchApi<Professor[]>({ url: `${ENV.ACADEMIC_SECTION}professors`, isApi: false }),
		enabled     : requestDetailDialog.isOpen,
	});

	// Query for modules (needed for request detail form)
	const {
		data        : modules = [],
		isLoading   : isLoadingModules,
		isError     : isErrorModules,
	} = useQuery({
		queryKey    : [KEY_QUERYS.MODULES],
        queryFn     : () => fetchApi<Module[]>({ url: `${ENV.ACADEMIC_SECTION}modules/original`, isApi: false }),
		enabled     : requestDetailDialog.isOpen,
	});

	const handleRequestClick = ( requestId: string ): void => {
		const allQueries = queryClient.getQueriesData({ queryKey: [KEY_QUERYS.REQUESTS] });

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
			fetchApi<Request>({ url: `requests/${requestId}` })
				.then( ( request ) => {
					console.log( 'Fetched request directly:', request );
					setRequestDialog({
						isOpen      : true,
						request     : request,
					});
				})
				.catch( ( error ) => {
					console.error( 'Error fetching request:', error );
				});
		}
	};

	const handleRequestDetailClick = ( requestId: string, detailId: string ): void => {
		const cachedRequestDetails = queryClient.getQueryData<RequestDetail[]>([KEY_QUERYS.REQUEST_DETAIL, requestId]);
		console.log( 'Request details found in cache:', cachedRequestDetails );

		if ( cachedRequestDetails ) {
			const requestDetail = cachedRequestDetails.find( rd => rd.id === detailId );

			if ( requestDetail ) {
				console.log( 'Opening request detail dialog for:', requestDetail );
				setRequestDetailDialog({
					isOpen          : true,
					requestDetail   : requestDetail,
					requestId,
				});
				return;
			}
		}

		// If not in cache, fetch the request details
		console.log( 'Request details not in cache, fetching...' );
		queryClient.fetchQuery({
			queryKey    : [KEY_QUERYS.REQUEST_DETAIL, requestId],
			queryFn     : () => fetchApi<RequestDetail[]>({ url: `request-details/request/${requestId}` }),
		}).then( ( requestDetails ) => {
			const requestDetail = requestDetails?.find( rd => rd.id === detailId );

			if ( requestDetail ) {
				console.log( 'Opening request detail dialog after fetch:', requestDetail );
				setRequestDetailDialog({
					isOpen          : true,
					requestDetail   : requestDetail,
					requestId,
				});
			} else {
				console.log( 'Request detail not found after fetch for detailId:', detailId );
			}
		}).catch( ( error ) => {
			console.error( 'Error fetching request details:', error );
		});
	};

	const handleRequestSubmit = ( data: any ): void => {
		// Handle request form submission
		console.log( 'Request form submitted:', data );
		setRequestDialog( prev => ({ ...prev, isOpen: false }));
	};

	const handleRequestDetailSubmit = ( data: any ): void => {
		// Handle request detail form submission
		console.log( 'Request detail form submitted:', data );
		setRequestDetailDialog( prev => ({ ...prev, isOpen: false }));
	};

	return (
		<>
			{/* Pass handlers to children (Notifications component) */}
			{typeof children === 'function' 
				? children({ 
					onRequestClick      : handleRequestClick, 
					onRequestDetailClick: handleRequestDetailClick 
				})
				: children
			}

			{/* Request Dialog */}
			{requestDialog.request && (
				<RequestForm
					isOpen      = { requestDialog.isOpen }
					onClose     = { () => setRequestDialog( prev => ({ ...prev, isOpen: false }))}
					request     = { requestDialog.request }
					facultyId   = { requestDialog.request.facultyId }
                    // staff       = { staff }
				/>
			)}

			{/* Request Detail Dialog */}
			{/* {requestDetailDialog.requestDetail && (
				<RequestDetailForm
					isOpen              = { requestDetailDialog.isOpen }
					onClose             = {() => setRequestDetailDialog( prev => ({ ...prev, isOpen: false }))}
					requestDetail       = { requestDetailDialog.requestDetail }
					professors          = { professors }
					isLoadingProfessors = { isLoadingProfessors }
					isErrorProfessors   = { isErrorProfessors }
					modules             = { modules }
                    requestId           = { requestDetailDialog.requestDetail.requestId }
					isLoadingModules    = { isLoadingModules }
					isErrorModules      = { isErrorModules }
                    staff               = { staff }
				/>
			)} */}
		</>
	);
}
