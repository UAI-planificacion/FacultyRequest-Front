"use client"

import { JSX, useEffect, useMemo } from "react";

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
import {
    ToggleGroup,
    ToggleGroupItem
}                               from "@/components/ui/toggle-group";
import { Button }               from "@/components/ui/button";
import { Input }                from "@/components/ui/input";
import { Textarea }             from "@/components/ui/textarea";
import { Switch }               from "@/components/ui/switch";
import { DaySelector }          from "@/components/shared/DaySelector";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Badge }                from "@/components/ui/badge";

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
    Level,
    Building,
}                       from "@/types/request-detail.model";
import { Professor }    from "@/types/professor";
import { Role, Staff }  from "@/types/staff.model";

import { getSpaceType }     from "@/lib/utils";
import { spacesMock }       from "@/data/space";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { Method, fetchApi } from "@/services/fetch";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";


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
]).transform(val => val === undefined ? null : val);


const formSchema = z.object({
    minimum         : numberOrNull,
    maximum         : numberOrNull,
    spaceType       : z.nativeEnum( SpaceType ).optional().nullable(),
    spaceSize       : z.nativeEnum( Size ).nullable().optional(),
    building        : z.nativeEnum( Building ).nullable().optional(),
    costCenterId    : z.string().nullable().optional(),
    inAfternoon     : z.boolean().default( false ),
    isPriority      : z.boolean().default( false ),
    moduleId        : z.string().nullable().optional(),
    days            : z.array( z.number() ).default( [] ),
    description     : z.string().max( 500, "La descripción no puede tener más de 500 caracteres" ).nullable().default(''),
    level           : z.nativeEnum(Level, { required_error: "Por favor selecciona un nivel" }),
    professorId     : z.string().nullable().optional(),
    spaceId         : z.string().nullable().default( '' )
}).superRefine(( data, ctx ) => {
    const minimum = data.minimum;
    const maximum = data.maximum;

    if ( minimum !== null && maximum !== null && maximum < minimum ) {
        ctx.addIssue({
            code    : z.ZodIssueCode.custom,
            message : "El máximo no puede ser menor que el mínimo.",
            path    : ['maximum'],
        });
    }
});


export type RequestDetailFormValues = z.infer<typeof formSchema>;


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
    minimum         : data?.minimum || null,
    maximum         : data?.maximum || null,
    spaceType       : data?.spaceType as SpaceType || null,
    spaceSize       : data?.spaceSize as Size || null,
    building        : data?.building as Building || null,
    costCenterId    : data?.costCenterId || null,
    inAfternoon     : data?.inAfternoon || false,
    isPriority      : data?.isPriority || false,
    moduleId        : data?.moduleId || null,
    days            : data?.days?.map( day => Number( day )) ?? [],
    description     : data?.description || '',
    level           : data?.level || Level.PREGRADO,
    professorId     : data?.professorId || null,
    spaceId         : data?.spaceId || null,
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
    const queryClient   = useQueryClient();
    const isReadOnly    = staff?.role === Role.VIEWER;

    const createRequestDetailApi = async (newRequestDetail: CreateRequestDetail): Promise<RequestDetail> =>
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


    const memoizedProfessorOptions = useMemo(() => {
        return professors?.map( professor => ({
            id      : professor.id,
            label   : `${professor.id}-${professor.name}`,
            value   : professor.id,
        })) ?? [];
    }, [professors]);


    const memoizedDays = useMemo(() => {
        return days?.map( day =>  day.id - 1 ) ?? [];
    }, [days]);


    const form = useForm<RequestDetailFormValues>({
        resolver        : zodResolver( formSchema ) as any,
        defaultValues   : defaultRequestDetail( requestDetail ),
    });


    useEffect(() => {
        form.reset( defaultRequestDetail( requestDetail ));
    }, [requestDetail, isOpen]);


    function onSubmitForm( formData: RequestDetailFormValues ): void {
        formData.building = formData.spaceId?.split('-')[1] as Building;

        if ( requestDetail ) {
            updateRequestDetailMutation.mutate({
                ...formData,
                id      : requestDetail.id,
                days    : formData.days.map( String ),
                staffUpdateId : staff?.id || ''
            });
        } else {
            createRequestDetailMutation.mutate({
                ...formData,
                requestId,
                days            : formData.days.map( String ),
                staffCreateId   : staff?.id || ''
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

                            {/* Level */}
                            <FormField
                                control = { form.control }
                                name    = "level"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nivel</FormLabel>

                                        <ToggleGroup
                                            type            = "single"
                                            value           = { field.value }
                                            className       = "w-full"
                                            defaultValue    = { field.value }
                                            disabled        = { isReadOnly }
                                            onValueChange   = {( value: string ) => {
                                                if ( value ) field.onChange( value )
                                            }}
                                        >
                                            <ToggleGroupItem
                                                value       = "PREGRADO"
                                                aria-label  = "Pregrado"
                                                className   = "flex-1 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none border-t border-l border-b border-zinc-200 dark:border-zinc-700 dark:data-[state=on]:text-black dark:data-[state=on]:bg-white data-[state=on]:text-white data-[state=on]:bg-black"
                                            >
                                                Pregrado
                                            </ToggleGroupItem>

                                            <ToggleGroupItem
                                                value       = "FIRST_GRADE"
                                                aria-label  = "1° Grado"
                                                className   = "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:text-foreground dark:data-[state=on]:text-black dark:data-[state=on]:bg-white data-[state=on]:bg-black data-[state=on]:text-white"
                                            >
                                                1° Grado
                                            </ToggleGroupItem>

                                            <ToggleGroupItem
                                                value       = "SECOND_GRADE"
                                                aria-label  = "2° Grado"
                                                className   = "flex-1 rounded-tl-none rounded-bl-none rounded-tr-lg rounded-br-lg border-t border-r border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:text-foreground dark:data-[state=on]:text-black dark:data-[state=on]:bg-white data-[state=on]:bg-black data-[state=on]:text-white"
                                            >
                                                2° Grado
                                            </ToggleGroupItem>
                                        </ToggleGroup>

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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Espacio */}
                            <FormField
                                control = { form.control }
                                name    = "spaceId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Espacio</FormLabel>

                                        <MultiSelectCombobox
                                            multiple            = { false }
                                            placeholder         = "Seleccionar espacio"
                                            defaultValues       = { field.value || '' }
                                            onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                            options             = { spacesMock }
                                            isLoading           = { isLoadingModules }
                                            disabled            = { isReadOnly }
                                        />

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
                                        <FormLabel>Tipo de espacio</FormLabel>

                                        <Select
                                            defaultValue    = { field.value ?? 'Sin especificar' }
                                            onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                            disabled        = { isReadOnly }
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
                                        <FormLabel>Tamaño del espacio</FormLabel>

                                        {isErrorSizes ? (
                                            <>
                                                <FormControl>
                                                    <Input
                                                        placeholder = "Ej: XS (< 30)"
                                                        value       = { field.value || '' }
                                                        readOnly    = { isReadOnly }
                                                        onChange    = {( e ) => field.onChange( e.target.value || null )}
                                                    />
                                                </FormControl>

                                                <FormDescription>
                                                    Error al cargar los tamaños. Ingrese el tamaño manualmente.
                                                </FormDescription>
                                            </>
                                        ) : (
                                            <Select
                                                onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                defaultValue    = { field.value || 'Sin especificar' }
                                                disabled        = { isLoadingSizes || isReadOnly }
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

                        {/* Módulo */}
                        <FormField
                            control = { form.control }
                            name    = "moduleId"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Módulo</FormLabel>

                                    { isErrorModules
                                        ? <>
                                            <FormControl>
                                                <Input
                                                    {... field}
                                                    placeholder="Ingrese el módulo"
                                                    value = { field.value || '' }
                                                    onChange    = {( e: React.ChangeEvent<HTMLInputElement> ) => field.onChange( e.target.value )}
                                                />
                                            </FormControl>

                                            <FormDescription>
                                                Error al cargar los módulos. Ingrese manualmente.
                                            </FormDescription>
                                        </>
                                        :  <Select
                                            defaultValue    = { field.value || 'Sin especificar' }
                                            disabled        = { isLoadingModules || isReadOnly }
                                            onValueChange   = {( value ) => {
                                                field.onChange(value === "Sin especificar" ? null : value);
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar módulo" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                {modules?.map((module) => (
                                                    <SelectItem key={module.id.toString()} value={module.id.toString()}>
                                                        {module.name} {module.difference ? `-${module.difference}` : ''} {module.startHour}:{module.endHour}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    }

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Días */}
                        <FormField
                            control = { form.control }
                            name    = "days"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Días</FormLabel>

                                    {isLoadingDays ? (
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from({ length: 7 }).map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="h-8 w-16 bg-muted rounded-md animate-pulse"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <FormControl>
                                                <DaySelector
                                                    days        = { isErrorDays ? [0, 1, 2, 3, 4, 5, 6] : memoizedDays }
                                                    value       = { field.value?.map( day => Number( day )) || []}
                                                    onChange    = { field.onChange }
                                                    disabled    = { isReadOnly }
                                                />
                                            </FormControl>

                                            {isErrorDays && (
                                                <FormDescription className="text-destructive">
                                                    Error al obtener los días. Se muestran todos los días disponibles.
                                                </FormDescription>
                                            )}
                                        </>
                                    )}

                                    <FormMessage />
                                </FormItem>
                            )}
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

                        {/* Comments */}
                        { requestDetail &&
                            <div className="col-span-2">
                                <FormLabel>Comentarios</FormLabel>

                                <p>{requestDetail?.comment || 'Sin comentarios.'}</p>
                            </div>
                        }

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

            </DialogContent>
        </Dialog>
    );
}
