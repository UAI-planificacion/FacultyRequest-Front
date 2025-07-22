"use client"

import { JSX, useState } from "react"

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import {
    RequestDetailForm,
    RequestDetailFormValues
}                               from "@/components/request-detail/request-detail-form";

import {
    RequestDetailCardSkeleton,
    RequestDetailErrorCard
}                               from "@/components/request-detail/request-detail-card-skeleton";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Card, CardContent }    from "@/components/ui/card";
import { RequestInfoCard }      from "@/components/request-detail/request-info-card";
import { RequestDetailCard }    from "@/components/request-detail/request-detail-card";

import type {
    Module,
    Request,
    RequestDetail,
    UpdateRequestDetail
}                           from "@/types/request";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { Method, fetchApi } from "@/services/fetch";
import { Professor }        from "@/types/professor";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";


interface RequestDetailViewProps {
    request : Request;
    onBack  : () => void;
}


const initialRequestDetail = {} as RequestDetail


export function RequestDetailView({
    request,
    onBack,
}: RequestDetailViewProps ): JSX.Element {
    const queryClient = useQueryClient();

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

    const [selectedDetail, setSelectedDetail]   = useState<RequestDetail>( initialRequestDetail );
    const [ isOpenEdit, setIsOpenEdit ]         = useState( false );
    const [ isOpenDelete, setIsOpenDelete ]     = useState( false );


    function onEditRequesDetail( detail: RequestDetail ) {
        console.log('🚀 ~ file: request-detail.tsx:47 ~ detail:', detail)
        setIsOpenEdit( true );
        setSelectedDetail( detail );
    }


    const updateRequestDetailApi = async ( updatedRequestDetail: UpdateRequestDetail ): Promise<RequestDetail>  =>
        fetchApi<RequestDetail>({
            url:`request-details/${updatedRequestDetail.id}`,
            method: Method.PATCH ,
            body: updatedRequestDetail
        });


    const deleteRequestDetailApi = async ( requestId: string ): Promise<Request> =>
        fetchApi<Request>( {
            url:`request-details/${requestId}`,
            method: Method.DELETE
        } );


    const updateRequestDetailMutation = useMutation<RequestDetail, Error, UpdateRequestDetail>({
        mutationFn: updateRequestDetailApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUEST_DETAIL, request.id] });
            setIsOpenEdit( false );
            setSelectedDetail( initialRequestDetail );
            toast( 'Solicitud actualizada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al actualizar la solicitud: ${mutationError.message}`, errorToast )
    });


    const deleteRequestDetailMutation = useMutation<Request, Error, string>({
        mutationFn: deleteRequestDetailApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUEST_DETAIL, request.id] });
            setIsOpenDelete( false );
            setSelectedDetail( initialRequestDetail );
            toast( 'Solicitud eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar solicitud: ${mutationError.message}`, errorToast )
    });

    
    function openDeleteDialog( requestDetail: RequestDetail ): void {
        setSelectedDetail( requestDetail );
        setIsOpenDelete( true );
    }


    const handleFormSubmit = ( formData: RequestDetailFormValues ): void => {
        updateRequestDetailMutation.mutate({
            ...formData,
            id      : selectedDetail.id,
            days    : formData.days.map( String ),
        });
    };


    return (
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

                    {/* <Dialog open={isAddingDetail} onOpenChange={setIsAddingDetail}> */}
                    <Dialog >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Detalle
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Agregar Nuevo Detalle</DialogTitle>
                            </DialogHeader>

                            {/* <RequestDetailForm onSubmit={handleAddDetail} onCancel={() => setIsAddingDetail(false)} /> */}
                        </DialogContent>
                    </Dialog>
                </div>

                {isError ? (
                    <RequestDetailErrorCard />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {isLoading ? (
                                // Show skeleton cards during loading
                                Array.from({ length: 3 }).map((_, index) => (
                                    <RequestDetailCardSkeleton key={`skeleton-${index}`} />
                                ))
                            ): (
                                data?.map( detail => (
                                    <RequestDetailCard
                                        key                 = { detail.id }
                                        detail              = { detail }
                                        onEdit              = { onEditRequesDetail }
                                        onDelete            = { openDeleteDialog }
                                        professors          = { professors ?? [] }
                                        isLoadingProfessors = { isLoadingProfessors }
                                        isErrorProfessors   = { isErrorProfessors }
                                        modules             = { modules ?? [] }
                                        isLoadingModules    = { isLoadingModules }
                                        isErrorModules      = { isErrorModules }
                                    />
                                ))
                            )}
                        </div>

                        {!isLoading && data?.length === 0 && (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <p className="text-muted-foreground">No hay detalles para esta solicitud.</p>

                                    {/* <Button className="mt-4" onClick={() => setIsAddingDetail(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Primer Detalle
                                    </Button> */}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                <RequestDetailForm
                    initialData         = { selectedDetail }
                    onSubmit            = { ( data) => handleFormSubmit( data ) }
                    onCancel            = { () => setIsOpenEdit( false )}
                    isOpen              = { isOpenEdit }
                    onClose             = { () => setIsOpenEdit( false )}
                    professors          = { professors ?? [] }
                    isLoadingProfessors = { isLoadingProfessors }
                    isErrorProfessors   = { isErrorProfessors }
                    modules             = { modules ?? [] }
                    isLoadingModules    = { isLoadingModules }
                    isErrorModules      = { isErrorModules }
                />

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmDialog
                    isOpen      = { isOpenDelete }
                    onClose     = { () => setIsOpenDelete( false )}
                    onConfirm   = { () => deleteRequestDetailMutation.mutate( selectedDetail.id || '') }
                    name        = { selectedDetail.id || '' }
                    type        = "el Detalle"
                />
            </div>
        </div>
    );
}
