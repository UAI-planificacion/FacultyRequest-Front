"use client"

import { JSX, useEffect, useMemo, useState } from "react";

import { 
    useMutation,
    useQuery,
    useQueryClient
}                       from "@tanstack/react-query";
import { z }            from "zod";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import { Loader2 }      from "lucide-react";
import { toast }        from "sonner";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
}                               from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                               from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
}                               from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
}                               from "@/components/ui/form";
import { Button }               from "@/components/ui/button";
import { Input }                from "@/components/ui/input";
import { Textarea }             from "@/components/ui/textarea";
import { Switch }               from "@/components/ui/switch";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Badge }                from "@/components/ui/badge";
import { CommentSection }       from "@/components/comment/comment-section";
import { Checkbox }             from "@/components/ui/checkbox";
import { RequestDetailModuleDays } from "@/components/request-detail/request-detail-module-days";

import {
    SizeResponse,
    Day,
    Module,
}                        from "@/types/request";
import  {
    type RequestDetail,
    type CreateRequestDetail,
    type UpdateRequestDetail,
    SpaceType,
    Size,
    Building,
}                       from "@/types/request-detail.model";
import { Professor }    from "@/types/professor";
import { Role, Staff }  from "@/types/staff.model";

import {
    errorToast,
    successToast
}                           from "@/config/toast/toast.config";
import { ENV }              from "@/config/envs/env";
import { useCostCenter }    from "@/hooks/use-cost-center";
import { useSpace }         from "@/hooks/use-space";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { Method, fetchApi } from "@/services/fetch";
import { cn, getSpaceType } from "@/lib/utils";
import { Grade }            from "@/types/grade";


const numberOrNull = z.union([
    z.string()
        .transform(val => val === '' ? null : Number(val))
        .refine(
            val => val === null || val === undefined || val >= 1,
            { message: "Debe ser al menos 1" }
        ),
    z.number()
        .min(1, { message: "Debe ser al menos 1" })
        .nullable()
        .optional(),
    z.null(),
    z.undefined()
]).transform( val => val === undefined ? null : val );


const formSchema = z.object({
    minimum         : numberOrNull,
    maximum         : numberOrNull,
    spaceType       : z.nativeEnum( SpaceType ).optional().nullable(),
    spaceSize       : z.nativeEnum( Size ).nullable().optional(),
    building        : z.nativeEnum( Building ).nullable().optional(),
    costCenterId    : z.string().nullable().optional(),
    inAfternoon     : z.boolean().default( false ),
    isPriority      : z.boolean().default( false ),
    gradeId         : z.string().nullable().optional(),
    professorId     : z.string().nullable().optional(),
    description     : z.string().max( 500, "La descripción no puede tener más de 500 caracteres" ).nullable().default( '' ),
    spaceId         : z.string().nullable().default( '' ),
    moduleDays      : z.array(z.object({
        day         : z.string(),
        moduleId    : z.string()
    })).default([])
}).superRefine(( data, ctx ) => {
    const { minimum, maximum } = data;

    if ( minimum && maximum && maximum < minimum ) {
        ctx.addIssue({
            code    : z.ZodIssueCode.custom,
            message : "El máximo no puede ser menor que el mínimo.",
            path    : ['maximum'],
        });
    }
});


export type RequestDetailFormValues = z.infer<typeof formSchema>;


type Tab = 'form' | 'comments';


function getTypeSpace( requestDetail: RequestDetail | undefined | null ): boolean[] {
    if ( !requestDetail ) return [ false, false, false ];

    if ( requestDetail.spaceId ) {
        return [ true, false, false ];
    }

    if ( requestDetail.spaceType ) {
        return [ false, true, false ];
    }

    if ( requestDetail.spaceSize ) {
        return [ false, false, true ];
    }

    return [ false, false, false ];
}


interface RequestDetailFormProps {
    requestDetail?      : RequestDetail | undefined;
    requestId           : string;
    isOpen              : boolean;
    onClose?            : () => void;
    professors          : Professor[];
    isLoadingProfessors : boolean;
    isErrorProfessors   : boolean;
    modules             : Module[];
    isLoadingModules    : boolean;
    isErrorModules      : boolean;
    staff               : Staff | undefined;
}


const defaultRequestDetail = ( data?: RequestDetail ) => ({
    minimum         : data?.minimum                 || null,
    maximum         : data?.maximum                 || null,
    spaceType       : data?.spaceType as SpaceType  || null,
    spaceSize       : data?.spaceSize as Size       || null,
    building        : data?.building as Building    || null,
    costCenterId    : data?.costCenterId            || null,
    inAfternoon     : data?.inAfternoon             || false,
    isPriority      : data?.isPriority              || false,
    gradeId         : data?.grade?.id               || null,
    description     : data?.description             || '',
    professorId     : data?.professorId             || null,
    spaceId         : data?.spaceId                 || null,
    moduleDays      : data?.moduleDays              || [],
});


export function RequestDetailForm({ 
    requestDetail, 
    requestId,
    onClose,
    isOpen,
    professors,
    isLoadingProfessors,
    isErrorProfessors,
    modules,
    isLoadingModules,
    isErrorModules,
    staff
}: RequestDetailFormProps ): JSX.Element {
    const queryClient               = useQueryClient();
    const isReadOnly                = staff?.role === Role.VIEWER;
    const [tab, setTab]             = useState<Tab>( 'form' );
    const [typeSpace, setTypeSpace] = useState<boolean[]>([ false, false, false ]);


    const {
        costCenter,
        isLoading: isLoadingCostCenter,
    } = useCostCenter({ enabled: true });


    const {
        spaces,
        isLoading: isLoadingSpaces,
    } = useSpace({ enabled: true });


    const createRequestDetailApi = async ( newRequestDetail: CreateRequestDetail ): Promise<RequestDetail> =>
        fetchApi<RequestDetail>({
            url: 'request-details',
            method: Method.POST,
            body: newRequestDetail
        });


    const updateRequestDetailApi = async ( updatedRequestDetail: UpdateRequestDetail ): Promise<RequestDetail> =>
        fetchApi<RequestDetail>({
            url     : `request-details/${updatedRequestDetail.id}`,
            method  : Method.PATCH,
            body    : updatedRequestDetail
        });


    const createRequestDetailMutation = useMutation<RequestDetail, Error, CreateRequestDetail>({
        mutationFn: createRequestDetailApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUEST_DETAIL, requestId] });
            onClose?.();
            form.reset();
            toast( 'Detalle creado exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al crear el detalle: ${mutationError.message}`, errorToast )
    });


    const updateRequestDetailMutation = useMutation<RequestDetail, Error, UpdateRequestDetail>({
        mutationFn: updateRequestDetailApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUEST_DETAIL, requestId] });
            onClose?.();
            toast( 'Detalle actualizado exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al actualizar el detalle: ${mutationError.message}`, errorToast )
    });


    const {
        data        : sizes,
        isLoading   : isLoadingSizes,
        isError     : isErrorSizes,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SIZE ],
        queryFn     : () => fetchApi<SizeResponse[]>({ url: `${ENV.ACADEMIC_SECTION}sizes`, isApi: false }),
        enabled     : isOpen
    });


    const {
        data        : days,
        isLoading   : isLoadingDays,
        isError     : isErrorDays,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.DAYS ],
        queryFn     : () => fetchApi<Day[]>({ url: `${ENV.ACADEMIC_SECTION}days`, isApi: false }),
        enabled     : isOpen
    });


    const {
        data        : grades,
        isLoading   : isLoadingGrades,
        isError     : isErrorGrades,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.GRADES ],
        queryFn     : () => fetchApi<Grade[]>({ url: 'grades' }),
    });


    const memoizedProfessorOptions = useMemo(() => {
        return professors?.map( professor => ({
            id      : professor.id,
            label   : `${professor.id}-${professor.name}`,
            value   : professor.id,
        })) ?? [];
    }, [professors]);


    const form = useForm<RequestDetailFormValues>({
        resolver        : zodResolver( formSchema ) as any,
        defaultValues   : defaultRequestDetail( requestDetail ),
    });


    useEffect(() => {
        form.reset( defaultRequestDetail( requestDetail ));
        setTab( 'form' );
        setTypeSpace( getTypeSpace( requestDetail ));
    }, [requestDetail, isOpen]);


    function handleModuleToggle( day: string, moduleId: string, isChecked: boolean ): void {
        const currentModuleDays = form.getValues( 'moduleDays' );

        if ( isChecked ) {
            const exists = currentModuleDays.some( 
                item => item.day === day && item.moduleId === moduleId 
            );

            if ( !exists ) {
                const newModuleDay = {
                    day         : day,
                    moduleId    : moduleId
                };

                form.setValue( 'moduleDays', [...currentModuleDays, newModuleDay] );
            }
        } else {
            const updatedModuleDays = currentModuleDays.filter( 
                item => !(item.day === day && item.moduleId === moduleId)
            );

            form.setValue( 'moduleDays', updatedModuleDays );
        }
    };


    function onSubmitForm( formData: RequestDetailFormValues ): void {
        console.log("🚀 ~ file: request-detail-form.tsx:288 ~ formData:", formData)
        if ( !staff ) return;

        if ( formData.spaceId ) {
            formData.building = ( formData.spaceId.split( '-' )[1] as Building || 'A' );
        }

        if ( typeSpace.every( item => !item )) {
            formData.spaceType  = null;
            formData.spaceSize  = null;
            formData.spaceId    = null;
        } else if ( typeSpace[0] ) {
            formData.spaceType = null;
            formData.spaceSize = null;
        } else if ( typeSpace[1] ) {
            formData.spaceId    = null;
            formData.spaceSize  = null;
        } else if ( typeSpace[2] ) {
            formData.spaceId    = null;
            formData.spaceType  = null;
        }

        if ( requestDetail ) {
            updateRequestDetailMutation.mutate({
                ...formData,
                id              : requestDetail.id,
                staffUpdateId   : staff.id,
            });
        } else {
            createRequestDetailMutation.mutate({
                ...formData,
                requestId,
                staffCreateId: staff.id,
            });
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className=" flex justify-between items-center gap-2">
                        <div>
                            <DialogTitle>
                                {isReadOnly 
                                    ? 'Ver Detalle' 
                                    : (requestDetail ? 'Editar Detalle' : 'Agregar Nuevo Detalle')}
                            </DialogTitle>

                            <DialogDescription>
                                {isReadOnly 
                                    ? 'Visualización del detalle en modo solo lectura.'
                                    : (requestDetail 
                                        ? 'Modifique los campos necesarios del detalle.' 
                                        : 'Complete los campos para agregar un nuevo detalle.')}
                            </DialogDescription>
                        </div>

                        {requestDetail && (
                            <Badge
                                className="mr-5"
                                variant={requestDetail.isPriority ? 'destructive' : 'default'}
                            >
                                {requestDetail.isPriority ? 'Prioritario' : 'Sin Prioridad' }
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <Tabs
                    defaultValue    = { tab }
                    onValueChange   = {( value ) => setTab( value as Tab )}
                    className       = "w-full"
                >
                    { requestDetail && (
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="form">
                                Información
                            </TabsTrigger>

                            <TabsTrigger value="comments">
                                Comentarios 
                            </TabsTrigger>
                        </TabsList>
                    )}

                    <TabsContent value="form" className={cn( requestDetail ? "space-y-4 mt-4" : '' )}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit( onSubmitForm )} className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Mínimo de estudiantes */}
                                    <FormField
                                        control = { form.control }
                                        name    = "minimum"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mínimo de estudiantes</FormLabel>

                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type        = "number"
                                                        min         = "1"
                                                        max         = "999999"
                                                        placeholder = "Ej: 10"
                                                        value       = { field.value || '' }
                                                        readOnly    = { isReadOnly }
                                                        onChange    = {( e: React.ChangeEvent<HTMLInputElement> ) => {
                                                            const value = e.target.value === '' ? undefined : Number( e.target.value );
                                                            field.onChange( value );
                                                        }}
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Máximo de estudiantes */}
                                    <FormField
                                        control = { form.control }
                                        name    = "maximum"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Máximo de estudiantes</FormLabel>

                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type        = "number"
                                                        min         = "1"
                                                        max         = "999999"
                                                        placeholder = "Ej: 30"
                                                        value       = { field.value || '' }
                                                        readOnly    = { isReadOnly }
                                                        onChange    = {( e: React.ChangeEvent<HTMLInputElement> ) => {
                                                            field.onChange(e.target.value === '' ? undefined : Number( e.target.value ));
                                                        }}
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Grade */}
                                    <FormField
                                        control = { form.control }
                                        name    = "gradeId"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grado</FormLabel>

                                                <Select
                                                    defaultValue    = { field.value ?? 'Sin especificar' }
                                                    onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar grado" />
                                                        </SelectTrigger>
                                                    </FormControl>

                                                    <SelectContent>
                                                        <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                        {grades?.map( grade => (
                                                            <SelectItem key={grade.id} value={grade.id}>
                                                                { grade.name }
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Professor */}
                                    <FormField
                                        control = { form.control }
                                        name    = "professorId"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Profesor</FormLabel>

                                                { isErrorProfessors && !isLoadingProfessors ?
                                                    <Input
                                                        {...field}
                                                        placeholder = "Ej: Juan Pérez"
                                                        value       = { field.value || '' }
                                                        readOnly    = { isReadOnly }
                                                        onChange    = {( e: React.ChangeEvent<HTMLInputElement> ) => field.onChange( e.target.value )}
                                                    />
                                                : <MultiSelectCombobox
                                                        multiple            = { false }
                                                        placeholder         = "Seleccionar profesor"
                                                        defaultValues       = { field.value || '' }
                                                        onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                        options             = { memoizedProfessorOptions }
                                                        isLoading           = { isLoadingProfessors }
                                                        disabled            = { isReadOnly }
                                                    />
                                                }

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                    {/* Espacio */}
                                    <FormField
                                        control = { form.control }
                                        name    = "spaceId"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel onClick={() => setTypeSpace([ true, false, false ])}>
                                                    Espacio
                                                </FormLabel>

                                                <div className="flex gap-2 items-center">
                                                    <Checkbox
                                                        className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center"
                                                        checked			= { typeSpace[0] }
                                                        onCheckedChange	= {( checked ) => setTypeSpace( [ checked as boolean, false, false ] )}
                                                        disabled        = { isReadOnly }
                                                    />

                                                    <MultiSelectCombobox
                                                        multiple            = { false }
                                                        placeholder         = "Seleccionar"
                                                        defaultValues       = { field.value || '' }
                                                        onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                        options             = { spaces }
                                                        isLoading           = { isLoadingSpaces }
                                                        disabled            = { !typeSpace[0] || isReadOnly }
                                                    />
                                                </div>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tipo de espacio */}
                                    <FormField
                                        control = { form.control }
                                        name    = "spaceType"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel onClick={() => setTypeSpace([ false, true, false ])}>
                                                    Tipo de espacio</FormLabel>

                                                <div className="flex gap-2 items-center">
                                                    <Checkbox
                                                        className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center"
                                                        checked			= { typeSpace[1] }
                                                        onCheckedChange	= {( checked ) => setTypeSpace( [ false, checked as boolean, false ] )}
                                                        disabled        = { isReadOnly }
                                                    />

                                                    <Select
                                                        defaultValue    = { field.value ?? 'Sin especificar' }
                                                        onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                        disabled        = { !typeSpace[1] || isReadOnly }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar tipo" />
                                                            </SelectTrigger>
                                                        </FormControl>

                                                        <SelectContent>
                                                            <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                            {Object.values( SpaceType ).map( type => (
                                                                <SelectItem key={type} value={type}>
                                                                    { getSpaceType( type )}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tamaño del espacio */}
                                    <FormField
                                        control = { form.control }
                                        name    = "spaceSize"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel onClick={() => setTypeSpace([ false, false, true ])}>
                                                    Tamaño del espacio
                                                </FormLabel>

                                                {isErrorSizes ? (
                                                    <>
                                                        <FormControl>
                                                            <Input
                                                                placeholder = "Ej: XS (< 30)"
                                                                value       = { field.value || '' }
                                                                onChange    = {( e ) => field.onChange( e.target.value || null )}
                                                            />
                                                        </FormControl>

                                                        <FormDescription>
                                                            Error al cargar los tamaños. Ingrese el tamaño manualmente.
                                                        </FormDescription>
                                                    </>
                                                ) : (
                                                    <div className="flex gap-2 items-center">
                                                        <Checkbox
                                                            className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center"
                                                            checked			= { typeSpace[2] }
                                                            onCheckedChange	= {( checked ) => setTypeSpace([ false, false, checked as boolean ])}
                                                            disabled        = { isReadOnly }
                                                        />

                                                        <Select
                                                            onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                            defaultValue    = { field.value || 'Sin especificar' }
                                                            disabled        = { isLoadingSizes || !typeSpace[2] || isReadOnly }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccionar tamaño" />
                                                                </SelectTrigger>
                                                            </FormControl>

                                                            <SelectContent>
                                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                                {sizes?.map( size => (
                                                                    <SelectItem key={size.id} value={size.id}>
                                                                        {size.id} ({size.detail})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Tarde */}
                                <FormField
                                    control = { form.control }
                                    name    = "inAfternoon"
                                    render  = {({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>Turno Tarde</FormLabel>

                                                <p className="text-sm text-muted-foreground">
                                                    Indica si es en horario de tarde
                                                </p>
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

                                <FormField
                                    control = { form.control }
                                    name    = "costCenterId"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-medium">Centro de Costos</FormLabel>

                                            <MultiSelectCombobox
                                                multiple            = { false }
                                                placeholder         = "Seleccionar centro de costo"
                                                defaultValues       = { field.value || '' }
                                                onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                options             = { costCenter }
                                                isLoading           = { isLoadingCostCenter }
                                            />

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                               {/* Tabla de módulos */}
                                <RequestDetailModuleDays
                                    requestDetailModule = { form.watch( 'moduleDays' )}
                                    days                = { days || [] }
                                    modules             = { modules }
                                    onModuleToggle      = { handleModuleToggle }
                                />

                                {/* Description */}
                                <FormField
                                    control = { form.control }
                                    name    = "description"
                                    render  = {({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Descripción</FormLabel>

                                            <FormControl>
                                                <Textarea 
                                                    {...field}
                                                    placeholder = "Agregue una descripción opcional"
                                                    className   = "min-h-[100px] max-h-[250px]"
                                                    value       = { field.value || '' }
                                                    readOnly    = { isReadOnly }
                                                />
                                            </FormControl>

                                            <FormDescription className="flex justify-end">
                                                {field.value?.length || 0 } / 500
                                            </FormDescription>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="flex items-center justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                    >
                                        {isReadOnly ? 'Cerrar' : 'Cancelar'}
                                    </Button>

                                    { !isReadOnly && (
                                        <Button
                                            type="submit"
                                            disabled={form.formState.isSubmitting || createRequestDetailMutation.isPending || updateRequestDetailMutation.isPending}
                                        >
                                            {(form.formState.isSubmitting || createRequestDetailMutation.isPending || updateRequestDetailMutation.isPending) ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                requestDetail ? 'Actualizar' : 'Crear'
                                            )}
                                        </Button>
                                    )}
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    { requestDetail && (
                        <TabsContent value="comments" className="mt-4">
                            <CommentSection
                                requestDetailId = { requestDetail.id }
                                enabled         = { tab === 'comments' }
                                size            = { 'h-[555px]' }
                            />
                        </TabsContent>
                    )}
                </Tabs>

            </DialogContent>
        </Dialog>
    );
}
