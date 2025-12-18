"use client"

import { useState, useMemo, useEffect, JSX }    from "react";
import { useSearchParams }                      from "next/navigation";

import {
    useMutation,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { RequestFilter }        from "@/components/request/request-filter";
import { RequestList }          from "@/components/request/request-list";
import { RequestTable }         from "@/components/request/request-table";
import { DataPagination }       from "@/components/ui/data-pagination";
import { RequestForm }          from "@/components/request/request-form";

import { type Request, Status }     from "@/types/request";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { useViewMode }              from "@/hooks/use-view-mode";
import { updateFacultyTotal }       from "@/app/faculty/page";


interface RequestMainProps {
    requests        : Request[];
    onViewDetails   : ( request: Request ) => void;
    facultyId?      : string;
    isLoading       : boolean;
    isError         : boolean;
}





export function RequestMain({
    requests,
    onViewDetails,
    facultyId,
    isLoading,
    isError
}: RequestMainProps ): JSX.Element {
    const queryClient                                   = useQueryClient();
    const searchParams                                  = useSearchParams();
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [editingRequest, setEditingRequest]           = useState<Request | null>( null );
    const [title, setTitle]                             = useState( "" );
    const [statusFilter, setStatusFilter]               = useState<Status[]>( [] );
    
    // Initialize sectionFilter from URL query param if present
    const sectionIdFromUrl = searchParams.get( 'sectionId' );
    const [sectionFilter, setSectionFilter]             = useState<string[]>( 
        sectionIdFromUrl ? [ sectionIdFromUrl ] : [] 
    );
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingRequest, setDeletingRequest]         = useState<Request | null>( null );
    const [currentPage, setCurrentPage]                 = useState( 1 );
    const [itemsPerPage, setItemsPerPage]               = useState( 15 );
    const { viewMode, onViewChange }                    = useViewMode({
        queryName: 'viewRequest'
    });


    const deleteRequestApi = async ( requestId: string ): Promise<Request> =>
        fetchApi<Request>({ url: `requests/${requestId}`, method: Method.DELETE });


    const deleteRequestMutation = useMutation<Request, Error, string>({
        mutationFn: deleteRequestApi,
        onSuccess: () => {
            // Invalidar queries: si hay facultyId específico, invalidar esa; si no, invalidar todas
            if ( facultyId ) {
                queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUESTS, facultyId] });
                updateFacultyTotal( queryClient, facultyId, false, 'totalRequests' );
            } else {
                queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUESTS] });
            }
            setIsDeleteDialogOpen( false );
            setDeletingRequest( null );
            toast( 'Solicitud eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar solicitud: ${mutationError.message}`, errorToast )
    });


    const filteredAndSortedRequests = useMemo(() => {
        const filtered = requests.filter( request => {
            const matchesTitle      = title === "" || request.title.toLowerCase().includes( title.toLowerCase() );
            const matchesStatus     = statusFilter.length === 0 || statusFilter.includes( request.status );
            const matchesSection    = sectionFilter.length === 0 || ( request.section?.id && sectionFilter.includes( request.section.id ));

            return matchesTitle && matchesStatus && matchesSection;
        });

        return filtered;
    }, [requests, title, statusFilter, sectionFilter]);


    const paginatedRequests = useMemo(() => {
        const startIndex = ( currentPage - 1 ) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedRequests.slice( startIndex, endIndex );
    }, [filteredAndSortedRequests, currentPage, itemsPerPage]);


    const totalPages = Math.ceil( filteredAndSortedRequests.length / itemsPerPage );


    function handleEdit( request: Request ): void {
        setEditingRequest( request );
        setIsFormOpen( true );
    }


    function handleNewRequest(): void {
        setEditingRequest( null );
        setIsFormOpen( true );
    }


    function handleFormSuccess(): void {
        setIsFormOpen( false );
        setEditingRequest( null );
    }


    function handleDelete( request: Request ): void {
        setDeletingRequest( request );
        setIsDeleteDialogOpen( true );
    }


    function handleConfirmDelete(): void {
        if ( deletingRequest ) {
            deleteRequestMutation.mutate( deletingRequest.id );
        }
    }


    function handlePageChange( page: number ): void {
        setCurrentPage( page );
    }


    function handleItemsPerPageChange( newItemsPerPage: number ): void {
        setItemsPerPage( newItemsPerPage );
        setCurrentPage( 1 );
    }


    useEffect(() => {
        const sectionIdParam = searchParams.get( 'sectionId' );
        if ( sectionIdParam ) {
            setSectionFilter([ sectionIdParam ]);
        }
    }, [ searchParams ]);


    useEffect(() => {
        setCurrentPage( 1 );
    }, [title, statusFilter, sectionFilter]);


    return (
        <div className="space-y-4">
            {/* Filters */}
            <RequestFilter
                title                   = { title }
                setTitle                = { setTitle }
                statusFilter            = { statusFilter }
                setStatusFilter         = { setStatusFilter }
                sectionFilter           = { sectionFilter }
                setSectionFilter        = { setSectionFilter }
                onNewRequest            = { handleNewRequest }
                viewMode                = { viewMode }
                setViewMode             = { onViewChange }
            />

            {/* View Mode Tabs */}
            { viewMode === 'cards'
                ? <RequestList
                    requests            = { paginatedRequests }
                    onViewDetails       = { onViewDetails }
                    onEdit              = { handleEdit }
                    onDelete            = { handleDelete }
                    isLoading           = { isLoading }
                    isError             = { isError }
                />
                : <RequestTable
                    requests            = { paginatedRequests }
                    onViewDetails       = { onViewDetails }
                    onEdit              = { handleEdit }
                    onDelete            = { handleDelete }
                    isLoading           = { isLoading }
                    isError             = { isError }
                />
            }

            {/* Pagination */}
            { !isLoading && !isError && filteredAndSortedRequests.length > 0 && (
                <DataPagination
                    currentPage             = { currentPage }
                    totalPages              = { totalPages }
                    totalItems              = { filteredAndSortedRequests.length }
                    itemsPerPage            = { itemsPerPage }
                    onPageChange            = { handlePageChange }
                    onItemsPerPageChange    = { handleItemsPerPageChange }
                />
            )}

            {/* Request Form */}
            <RequestForm
                isOpen      = { isFormOpen }
                onClose     = { () => setIsFormOpen( false )}
                // onSuccess   = { handleFormSuccess }
                request     = { editingRequest || undefined }
                facultyId   = { facultyId || '' }
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { handleConfirmDelete }
                name        = { deletingRequest?.title || '' }
                type        = "la Solicitud (y todos sus detalles relacionados)"
            />
        </div>
    );
}
