"use client"

import { JSX, useEffect, useState } from "react";

import {
    useMutation,
    useQueryClient
}                                   from "@tanstack/react-query";
import { z }                        from "zod";
import { toast }                    from "sonner";
import { zodResolver }              from "@hookform/resolvers/zod";
import { useForm, SubmitHandler }   from "react-hook-form";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
}                           from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                           from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                           from "@/components/ui/form";
import { Input }            from "@/components/ui/input";
import { Button }           from "@/components/ui/button";
import { Textarea }         from "@/components/ui/textarea";
import { ShowStatus }       from "@/components/shared/status";
import { CommentSection }   from "@/components/comment/comment-section";
import { Switch }           from "@/components/ui/switch";
import { OfferSelect }      from "@/components/offer/offer-select";

import {
    CreateRequest,
    Request,
    UpdateRequest,
    Status
}                                   from "@/types/request";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { fetchApi, Method }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { Staff, Role }              from "@/types/staff.model";
import { cn }                       from "@/lib/utils";
import { useSession } from "@/hooks/use-session";


interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    request     : Request | undefined;
    facultyId   : string;
    // staff       : Staff | undefined;
}


const formSchema = z.object({
    title: z.string({
        required_error: "El título es obligatorio",
        invalid_type_error: "El título debe ser un texto"
    }).min( 1, { message: "El título no puede estar vacío" })
    .max( 100, { message: "El título no puede tener más de 100 caracteres" }),
    isConsecutive: z.boolean(),
    description: z.string()
        .max( 500, { message: "La descripción no puede tener más de 500 caracteres" })
        .nullable()
        .transform( val => val === "" ? null : val ),
    offerId: z.string({
        required_error: "Debe seleccionar una oferta",
        invalid_type_error: "Oferta no válida"
    }).min(1, { message: "Debe seleccionar una oferta" })
});


export type RequestFormValues = z.infer<typeof formSchema>;


type Tab = 'form' | 'comments';


// const defaultRequest = ( data : Request | undefined ) => ({
//     title           : data?.title           || '',
//     description     : data?.description     || '',
//     isConsecutive   : data?.isConsecutive   || false,
//     offerId         : data?.offer.id        || '',
// });

const defaultRequest = ( data : Request | null | undefined, sectionId? : string, facultyId? : string ) => ({
	// facultyId       : data?.facultyId       || facultyId || '',
	title           : data?.title           || '',
	status          : data?.status          || Status.PENDING,
	sectionId       : data?.section?.id     || sectionId || '',
});


export function RequestForm({
    isOpen,
    onClose,
    request,
    facultyId,
    // staff
}: Props ): JSX.Element {
    const queryClient   = useQueryClient();
    const { staff }     = useSession();
    const isReadOnly    = staff?.role === Role.VIEWER;
    const [tab, setTab] = useState<Tab>( 'form' );


    const createRequestApi = async ( request: CreateRequest ): Promise<Request> =>
        fetchApi<Request>({
            url     : 'requests',
            method  : Method.POST,
            body    : request
        });


    const updateRequestApi = async ( updatedRequest: UpdateRequest ): Promise<Request> =>
        fetchApi<Request>({
            url     : `requests/${updatedRequest.id}`,
            method  : Method.PATCH,
            body    : updatedRequest
        });


    const createRequestMutation = useMutation<Request, Error, CreateRequest>({
        mutationFn: createRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
            onClose();
            toast( 'Solicitud creada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al crear solicitud: ${ mutationError.message }`, errorToast )
    });


    const updateRequestMutation = useMutation<Request, Error, UpdateRequest>({
        mutationFn: updateRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
            onClose();
            toast( 'Solicitud actualizada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al actualizar la solicitud: ${ mutationError.message }`, errorToast )
    });


    const form = useForm<RequestFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultRequest( request )
    });


    // useEffect(() => {
    //     form.reset( defaultRequest( request ));
    //     setTab( 'form' );
    // }, [request, isOpen]);
    // useEffect(() => {
	// 	form.reset( defaultRequest( request, propSection?.id, facultyId ));
	// 	setSelectedSectionId( propSection?.id || request?.section?.id || null );
	// }, [request, isOpen, propSection, facultyId]);


    const handleSubmit: SubmitHandler<RequestFormValues> = ( formData ) => {
        // if ( request ) {
        //     const updateRequest = {
        //         ...formData,
        //         id: request!.id,
        //         staffUpdateId: staff?.id
        //     } as UpdateRequest;

        //     updateRequestMutation.mutate( updateRequest );
        // } else {
        //     const createRequest = {
        //         ...formData,
        //         staffCreateId: staff?.id
        //     }  as CreateRequest;

        //     createRequestMutation.mutate( createRequest );
        // }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="space-y-3">
                    <div className="flex justify-between items-center mr-5">
                        <div className="space-y-1">
                            <DialogTitle>
                                { isReadOnly ? 'Ver Solicitud' : ( request ? 'Editar Solicitud' : 'Crear Solicitud' )}
                            </DialogTitle>

                            <DialogDescription>
                                { isReadOnly 
                                    ? 'Visualización de la solicitud en modo solo lectura'
                                    : 'Realice los cambios necesarios en la solicitud'
                                }
                            </DialogDescription>
                        </div>

                        { request && <ShowStatus status={request.status} /> }
                    </div>
                </DialogHeader>

                <Tabs defaultValue={tab} onValueChange={( value ) => setTab( value as Tab )} className="w-full">
                    { request && (
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="form">
                                Información
                            </TabsTrigger>

                            <TabsTrigger value="comments">
                                Comentarios 
                            </TabsTrigger>
                        </TabsList>
                    )}

                    <TabsContent value="form" className={ cn( request ? "space-y-4 mt-4" : '' )}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit( handleSubmit )} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Title */}
                                    <FormField
                                        control = { form.control }
                                        name    = "title"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Título</FormLabel>

                                                <FormControl>
                                                    <Input 
                                                        placeholder = "Ingrese el título de la solicitud"
                                                        readOnly    = { isReadOnly }
                                                        {...field} 
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control = { form.control }
                                        name    = "offerId"
                                        render  = {({ field }) => {
                                            return (
                                                <FormItem>
                                                    <FormLabel className="text-base">Oferta</FormLabel>

                                                    <FormControl>
                                                        <OfferSelect
                                                            facultyId           = { facultyId }
                                                            value               = { field.value }
                                                            placeholder         = "Seleccionar una oferta"
                                                            searchPlaceholder   = "Buscar por asignatura o período"
                                                            onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value )}
                                                        />
                                                    </FormControl>

                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    {/* Is Consecutive */}
                                    <FormField
                                        control = { form.control }
                                        name    = "isConsecutive"
                                        render  = {({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Es consecutivo</FormLabel>

                                                    <FormDescription>
                                                        Marque si la solicitud es para horarios consecutivos
                                                    </FormDescription>
                                                </div>

                                                <FormControl>
                                                    <Switch
                                                        checked         = { field.value }
                                                        onCheckedChange = { field.onChange }
                                                        disabled        = { isReadOnly }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Description */}
                                    <FormField
                                        control = { form.control }
                                        name    = "description"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descripción</FormLabel>

                                                <FormControl>
                                                    <Textarea
                                                        placeholder = "Agregue una descripción (opcional)"
                                                        className   = "min-h-[100px] max-h-[200px]"
                                                        readOnly    = { isReadOnly }
                                                        {...field}
                                                        value       = { field.value || '' }
                                                    />
                                                </FormControl>

                                                <FormDescription className="text-xs flex justify-end">
                                                    { field.value?.length || 0 } / 500
                                                </FormDescription>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-between space-x-4 pt-4">
                                    <Button
                                        type    = "button"
                                        variant = "outline"
                                        onClick = { onClose }
                                    >
                                        { isReadOnly ? 'Cerrar' : 'Cancelar' }
                                    </Button>

                                    { !isReadOnly && (
                                        <Button type="submit">
                                            { request ? 'Guardar cambios' : 'Crear solicitud' }
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    { request && (
                        <TabsContent value="comments" className="mt-4">
                            <CommentSection
                                requestId   = { request.id }
                                enabled     = { tab === 'comments' }
                                size        = { 'h-[378px]' }
                            />
                        </TabsContent>
                    )}
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
