"use client"

import { useState, useMemo, useEffect, JSX } from "react";

import {
    useMutation,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { RequestFilter }        from "@/components/request/request-filter";
import { RequestList }          from "@/components/request/request-list";
import { RequestTable }         from "@/components/request/request-table";
import { RequestForm }          from "@/components/request/request-form";
import { DataPagination }       from "@/components/ui/data-pagination";

import { type Request, Status }     from "@/types/request";
import { Staff }                    from "@/types/staff.model";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { useViewMode }              from "@/hooks/use-view-mode";


interface RequestMainProps {
    requests        : Request[];
    onViewDetails   : ( request: Request ) => void;
    facultyId       : string;
    isLoading       : boolean;
    isError         : boolean;
}

type SortBy             = "status" | "staffCreate" | "staffUpdate" | "subjectId" | "createdAt";
type SortOrder          = "asc" | "desc";
type ConsecutiveFilter  = "ALL" | "TRUE" | "FALSE";


export function RequestMain({
    requests,
    onViewDetails,
    facultyId,
    isLoading,
    isError
}: RequestMainProps ): JSX.Element {
    const queryClient                                   = useQueryClient();
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [editingRequest, setEditingRequest]           = useState<Request | undefined>( undefined );
    const [title, setTitle]                             = useState( "" );
    const [statusFilter, setStatusFilter]               = useState<Status | "ALL">( "ALL" );
    const [consecutiveFilter, setConsecutiveFilter]     = useState<ConsecutiveFilter>( "ALL" );
    const [sortBy, setSortBy]                           = useState<SortBy>( "createdAt" );
    const [sortOrder, setSortOrder]                     = useState<SortOrder>( "desc" );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingRequest, setDeletingRequest]         = useState<Request | null>( null );
    const [currentPage, setCurrentPage]                 = useState( 1 );
    const [itemsPerPage, setItemsPerPage]               = useState( 15 );
    const staff                                         = queryClient.getQueryData<Staff>([ KEY_QUERYS.STAFF ]);
    const { viewMode, onViewChange }                    = useViewMode({
        queryName: 'viewRequest'
    });


    const deleteRequestApi = async ( requestId: string ): Promise<Request> =>
        fetchApi<Request>({ url: `requests/${requestId}`, method: Method.DELETE });


    const deleteRequestMutation = useMutation<Request, Error, string>({
        mutationFn: deleteRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUESTS, facultyId] });
            setIsDeleteDialogOpen( false );
            setDeletingRequest( null );
            toast( 'Solicitud eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar solicitud: ${mutationError.message}`, errorToast )
    });


    const filteredAndSortedRequests = useMemo(() => {
        const filtered = requests.filter( request => {
            const matchesId = title === "" || request.title.toLowerCase().includes( title.toLowerCase() );
            const matchesStatus = statusFilter === "ALL" || request.status === statusFilter;
            const matchesConsecutive =
                consecutiveFilter === "ALL" ||
                ( consecutiveFilter === "TRUE" && request.isConsecutive ) ||
                ( consecutiveFilter === "FALSE" && !request.isConsecutive );

            return matchesId && matchesStatus && matchesConsecutive;
        });

        return filtered.sort(( a, b ) => {
            const [aValue, bValue] = {
                status      : [a.status, b.status],
                staffCreate : [a.staffCreate.name, b.staffCreate.name],
                staffUpdate : [a.staffUpdate?.name || "", b.staffUpdate?.name || ""],
                subjectId   : [a.subject.name, b.subject.name],
                createdAt   : [a.createdAt, b.createdAt],
            }[sortBy];

            if ( aValue < bValue ) return sortOrder === "asc" ? -1 : 1;
            if ( aValue > bValue ) return sortOrder === "asc" ? 1 : -1;

            return 0;
        })
    }, [requests, title, statusFilter, consecutiveFilter, sortBy, sortOrder]);


    const paginatedRequests = useMemo(() => {
        const startIndex = ( currentPage - 1 ) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedRequests.slice( startIndex, endIndex );
    }, [filteredAndSortedRequests, currentPage, itemsPerPage]);


    const totalPages    = Math.ceil( filteredAndSortedRequests.length / itemsPerPage );
    const startIndex    = ( currentPage - 1 ) * itemsPerPage;
    const endIndex      = startIndex + itemsPerPage;


    function handleEdit( request: Request ): void {
        setEditingRequest( request );
        setIsFormOpen( true );
    }


    function handleNewRequest(): void {
        setEditingRequest( undefined );
        setIsFormOpen( true );
    }


    function handleFormSuccess(): void {
        setIsFormOpen( false );
        setEditingRequest( undefined );
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


    function openFormRequest(): void {
        setEditingRequest( undefined );
        setIsFormOpen( true );
    }


    useEffect(() => {
        setCurrentPage( 1 );
    }, [title, statusFilter, consecutiveFilter, sortBy, sortOrder]);


    return (
        <div className="space-y-4">
            {/* Filters */}
            <RequestFilter
                title                   = { title }
                setOpen                 = { openFormRequest }

                setTitle                = { setTitle }
                statusFilter            = { statusFilter }
                setStatusFilter         = { setStatusFilter }
                consecutiveFilter       = { consecutiveFilter }
                setConsecutiveFilter    = { setConsecutiveFilter }
                sortBy                  = { sortBy }
                setSortBy               = { setSortBy }
                sortOrder               = { sortOrder }
                setSortOrder            = { setSortOrder }
                staff                   = { staff }
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
                    staff               = { staff }
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
                    startIndex              = { startIndex }
                    endIndex                = { endIndex }
                />
            )}

            {/* Request Form */}
            <RequestForm
                isOpen      = { isFormOpen }
                onClose     = { () => setIsFormOpen( false )}
                request     = { editingRequest }
                facultyId   = { facultyId }
                staff       = { staff }
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
