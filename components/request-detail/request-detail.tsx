"use client"

import { JSX, useMemo, useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";
import { Plus }     from "lucide-react";

import { RequestDetailErrorCard }   from "@/components/request-detail/request-detail-card-skeleton";
import { DeleteConfirmDialog }      from "@/components/dialog/DeleteConfirmDialog";
import { RequestInfoCard }          from "@/components/request-detail/request-info-card";
import { Button }                   from "@/components/ui/button";
import { RequestDetailForm }        from "@/components/request-detail/request-detail-form";
import { ViewMode }                 from "@/components/shared/view-mode";
import { RequestDetailList }        from "@/components/request-detail/request-detail-list";
import { RequestDetailTable }       from "@/components/request-detail/request-detail-table";
import { DataPagination }           from "@/components/ui/data-pagination";

import type { Module, Request } from "@/types/request";
import type { RequestDetail }   from "@/types/request-detail.model";
import { Professor }            from "@/types/professor";
import { Role, Staff }          from "@/types/staff.model";

import {
    errorToast,
    successToast
}                           from "@/config/toast/toast.config";
import { ENV }              from "@/config/envs/env";
import { useViewMode }      from "@/hooks/use-view-mode";
import { Method, fetchApi } from "@/services/fetch";
import { KEY_QUERYS }       from "@/consts/key-queries";


interface RequestDetailViewProps {
    request : Request;
    onBack  : () => void;
}


export function RequestDetailView({
    request,
    onBack,
}: RequestDetailViewProps ): JSX.Element {
    const queryClient                       = useQueryClient();
    const staff                             = queryClient.getQueryData<Staff>([ KEY_QUERYS.STAFF ]);
    const { viewMode, onViewChange }        = useViewMode({ queryName: 'viewDetail' });
    const [currentPage, setCurrentPage]     = useState( 1 );
    const [itemsPerPage, setItemsPerPage]   = useState( 15 );


    const {
        data        : modules,
        isLoading   : isLoadingModules,
        isError     : isErrorModules,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.MODULES ],
        queryFn     : () => fetchApi<Module[]>({ url: `${ENV.ACADEMIC_SECTION}modules/original`, isApi: false }),
    });


    const {
        data        : professors,
        isLoading   : isLoadingProfessors,
        isError     : isErrorProfessors,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.PROFESSORS ],
        queryFn     : () => fetchApi<Professor[]>({ url: `${ENV.ACADEMIC_SECTION}professors`, isApi: false }),
    });


    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.REQUEST_DETAIL, request.id ],
        queryFn     : () => fetchApi<RequestDetail[]>({ url:`request-details/request/${request.id}` }),
    });


    const [ selectedDetail, setSelectedDetail ] = useState<RequestDetail | undefined>( undefined );
    const [ isOpen, setIsOpen ]                 = useState( false );
    const [ isOpenDelete, setIsOpenDelete ]     = useState( false );


    const paginatedData = useMemo(() => {
        if ( !data ) return [];

        const startIndex    = ( currentPage - 1 ) * itemsPerPage;
        const endIndex      = startIndex + itemsPerPage;

        return data.slice( startIndex, endIndex );
    }, [data, currentPage, itemsPerPage]);


    const totalPages    = Math.ceil(( data?.length || 0 ) / itemsPerPage );
    const startIndex    = ( currentPage - 1 ) * itemsPerPage;
    const endIndex      = startIndex + itemsPerPage;


    function onEditRequesDetail( detail: RequestDetail ) {
        console.log('🚀 ~ file: request-detail.tsx:47 ~ detail:', detail)
        setIsOpen( true );
        setSelectedDetail( detail );
    }


    function onAddRequestDetail(): void {
        setIsOpen( true );
        setSelectedDetail( undefined );
    }


    const deleteRequestDetailApi = async ( requestId: string ): Promise<Request> =>
        fetchApi<Request>({
            url     :`request-details/${requestId}`,
            method  : Method.DELETE
        });


    const deleteRequestDetailMutation = useMutation<Request, Error, string>({
        mutationFn: deleteRequestDetailApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUEST_DETAIL, request.id] });
            setIsOpenDelete( false );
            setSelectedDetail( undefined );
            toast( 'Detalle eliminado exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar detalle: ${mutationError.message}`, errorToast )
    });


    function openDeleteDialog( requestDetail: RequestDetail ): void {
        setSelectedDetail( requestDetail );
        setIsOpenDelete( true );
    }


    function handlePageChange( page: number ): void {
        setCurrentPage( page );
    }


    function handleItemsPerPageChange( newItemsPerPage: number ): void {
        setItemsPerPage( newItemsPerPage );
        setCurrentPage( 1 );
    }


    return (
        <>
        <div className="space-y-4">
            {/* Request Info */}
            <RequestInfoCard
                request = { request }
                onBack  = { onBack }
            />

            {/* Request Details */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Detalles de la Solicitud ({data?.length ?? 0})</h2>

                    <div className="flex items-end gap-2 sm:gap-4">
                        <ViewMode
                            viewMode        = { viewMode }
                            onViewChange    = { onViewChange }
                        />

                        { staff?.role !== Role.VIEWER &&
                            <Button onClick={ onAddRequestDetail }>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Detalle
                            </Button>
                        }
                    </div>
                </div>

                {isError ? (
                    <RequestDetailErrorCard />
                ) : (
                    <>
                        {viewMode === 'cards' ? (
                            <RequestDetailList
                                data                = { paginatedData }
                                isLoading           = { isLoading }
                                onEdit              = { onEditRequesDetail }
                                onDelete            = { openDeleteDialog }
                                professors          = { professors ?? [] }
                                isLoadingProfessors = { isLoadingProfessors }
                                isErrorProfessors   = { isErrorProfessors }
                                modules             = { modules ?? [] }
                                isLoadingModules    = { isLoadingModules }
                                isErrorModules      = { isErrorModules }
                                staff = { staff }
                            />
                        ) : (
                            <RequestDetailTable
                                data                = { paginatedData }
                                isLoading           = { isLoading }
                                onEdit              = { onEditRequesDetail }
                                onDelete            = { openDeleteDialog }
                                professors          = { professors ?? [] }
                                isLoadingProfessors = { isLoadingProfessors }
                                isErrorProfessors   = { isErrorProfessors }
                                modules             = { modules ?? [] }
                                isLoadingModules    = { isLoadingModules }
                                isErrorModules      = { isErrorModules }
                            />
                        )}

                        {/* Pagination */}
                        {!isLoading && !isError && data && data.length > 0 && (
                            <DataPagination
                                currentPage             = { currentPage }
                                totalPages              = { totalPages }
                                totalItems              = { data.length }
                                itemsPerPage            = { itemsPerPage }
                                onPageChange            = { handlePageChange }
                                onItemsPerPageChange    = { handleItemsPerPageChange }
                                startIndex              = { startIndex }
                                endIndex                = { Math.min(endIndex, data.length) }
                            />
                        )}
                    </>
                )}
            </div>
        </div>

         {/* Dialog Request Detail */}
        <RequestDetailForm
            requestDetail       = { selectedDetail }
            requestId           = { request.id }
            isOpen              = { isOpen }
            onClose             = { () => setIsOpen( false )}
            professors          = { professors ?? [] }
            isLoadingProfessors = { isLoadingProfessors }
            isErrorProfessors   = { isErrorProfessors }
            modules             = { modules ?? [] }
            isLoadingModules    = { isLoadingModules }
            isErrorModules      = { isErrorModules }
            staff               = { staff }
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
            isOpen      = { isOpenDelete }
            onClose     = { () => setIsOpenDelete( false )}
            onConfirm   = { () => selectedDetail?.id && deleteRequestDetailMutation.mutate( selectedDetail.id ) }
            name        = { selectedDetail?.id || '' }
            type        = "el Detalle"
        />
        </>
    );
}
