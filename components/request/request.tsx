"use client"

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { RequestMain }          from "@/components/request/request-main";
import { RequestDetailView }    from "@/components/request-detail/request-detail";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { type Request } from "@/types/request";
import { fetchApi }     from "@/services/fetch";


interface RequestsManagementProps {
    facultyId   : string;
    enabled     : boolean;
}


export function RequestsManagement({
    facultyId,
    enabled,
}: RequestsManagementProps ) {
    const router                                = useRouter();
    const searchParams                          = useSearchParams();
    const [selectedRequest, setSelectedRequest] = useState<Request | null>( null );
    const detailId                              = searchParams.get( 'detail' );
    const { data, isLoading, isError }          = useQuery({
        queryKey    : [ KEY_QUERYS.REQUESTS, facultyId ],
        queryFn     : () => fetchApi<Request[]>({ url: `requests/faculty/${facultyId}` }),
        enabled,
    });

    /**
     * Effect to handle URL-based request selection
     * When detailId changes in URL, find and set the corresponding request
     */
    useEffect(() => {
        if ( detailId && data ) {
            const foundRequest = data.find( request => request.id === detailId );

            if ( foundRequest ) {
                setSelectedRequest( foundRequest );
            } else {
                updateUrlParams( null );
            }
        } else if ( !detailId ) {
            setSelectedRequest( null );
        }
    }, [detailId, data]);

    /**
     * Update URL parameters with detail ID
     */
    const updateUrlParams = ( requestId: string | null ): void => {
        const params = new URLSearchParams( searchParams.toString() );

        if ( requestId ) {
            params.set( 'detail', requestId );
        } else {
            params.delete( 'detail' );
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.replace( newUrl );
    };

    /**
     * Handle viewing request details
     * Updates both state and URL
     */
    const handleViewDetails = ( request: Request ): void => {
        setSelectedRequest( request );
        updateUrlParams( request.id );
    };

    /**
     * Handle going back to request list
     * Clears both state and URL parameter
     */
    const handleBack = (): void => {
        setSelectedRequest( null );
        updateUrlParams( null );
    };


    return (
        selectedRequest ? (
            <RequestDetailView
                request = { selectedRequest }
                onBack  = { handleBack }
            />
        ) : (
            <RequestMain
                requests        = { data || [] }
                onViewDetails   = { handleViewDetails }
                facultyId       = { facultyId }
                isLoading       = { isLoading }
                isError         = { isError }
            />
        )
    );
}
