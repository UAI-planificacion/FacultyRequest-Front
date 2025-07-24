"use client"

import { JSX, useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";
import { Plus }     from "lucide-react";

import {
    RequestDetailCardSkeleton,
    RequestDetailErrorCard
}                               from "@/components/request-detail/request-detail-card-skeleton";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Card, CardContent }    from "@/components/ui/card";
import { RequestInfoCard }      from "@/components/request-detail/request-info-card";
import { RequestDetailCard }    from "@/components/request-detail/request-detail-card";
import { Button }               from "@/components/ui/button";
import { RequestDetailForm }    from "@/components/request-detail/request-detail-form";

import { KEY_QUERYS }       from "@/consts/key-queries";
import { Method, fetchApi } from "@/services/fetch";

import type { Module, Request } from "@/types/request";
import type { RequestDetail }   from "@/types/request-detail.model";
import { Professor }            from "@/types/professor";
import { Role, Staff }          from "@/types/staff.model";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";


interface RequestDetailViewProps {
    request : Request;
    onBack  : () => void;
}


export function RequestDetailView({
    request,
    onBack,
}: RequestDetailViewProps ): JSX.Element {
    const queryClient   = useQueryClient();
    const staff         = queryClient.getQueryData<Staff>([ KEY_QUERYS.STAFF ]);


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


    function onEditRequestDetail( detail: RequestDetail ): void {
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

                    { staff?.role !== Role.VIEWER &&
                        <Button onClick={onAddRequestDetail}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Detalle
                        </Button>
                    }
                </div>

                {isError ? (
                    <RequestDetailErrorCard />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <RequestDetailCardSkeleton key={`skeleton-${index}`} />
                                ))
                            ): (
                                data?.map( detail => (
                                    <RequestDetailCard
                                        key                 = { detail.id }
                                        detail              = { detail }
                                        onEdit              = { onEditRequestDetail }
                                        onDelete            = { openDeleteDialog }
                                        professors          = { professors ?? [] }
                                        isLoadingProfessors = { isLoadingProfessors }
                                        isErrorProfessors   = { isErrorProfessors }
                                        modules             = { modules ?? [] }
                                        isLoadingModules    = { isLoadingModules }
                                        isErrorModules      = { isErrorModules }
                                        staff               = { staff }
                                    />
                                ))
                            )}
                        </div>

                        {!isLoading && data?.length === 0 && (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <p className="text-muted-foreground">No hay detalles para esta solicitud.</p>

                                    <Button className="mt-4" onClick={ onAddRequestDetail }>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Primer Detalle
                                    </Button>
                                </CardContent>
                            </Card>
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
