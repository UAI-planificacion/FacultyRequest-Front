"use client"

import { JSX, useEffect, useMemo } from "react";

import { useQuery}      from "@tanstack/react-query";
import { z }            from "zod";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import { Loader2 }      from "lucide-react";

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
    type RequestDetail,
    SpaceType,
    Size,
    Level,
    Building,
    SizeResponse,
    Day,
    Module,
}                       from "@/types/request";
import { getSpaceType } from "@/lib/utils";
import { spacesMock }   from "@/data/space";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { ENV }          from "@/config/envs/env";
import { Professor }    from "@/types/professor";


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
    comment         : z.string().max( 500, "El comentario no puede tener más de 500 caracteres" ).nullable().default(''),
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
    initialData         : RequestDetail;
    onSubmit            : ( data: RequestDetailFormValues ) => void;
    onCancel            : () => void;
    isOpen              : boolean;
    onClose             : () => void;
    professors          : Professor[];
    isLoadingProfessors : boolean;
    isErrorProfessors   : boolean;
    modules             : Module[];
    isLoadingModules    : boolean;
    isErrorModules      : boolean;
}


const defaultRequestDetail = ( data: RequestDetail ) => ({
    minimum         : data.minimum,
    maximum         : data.maximum,
    spaceType       : data.spaceType as SpaceType,
    spaceSize       : data.spaceSize as Size,
    building        : data.building as Building,
    costCenterId    : data.costCenterId,
    inAfternoon     : data.inAfternoon,
    isPriority      : data.isPriority,
    moduleId        : data.moduleId,
    days            : data.days?.map( day => Number( day )) ?? [],
    comment         : data.comment,
    level           : data.level,
    professorId     : data.professorId,
    spaceId         : data.spaceId,
});


export function RequestDetailForm({ 
    initialData, 
    onSubmit, 
    onClose,
    isOpen,
    professors,
    isLoadingProfessors,
    isErrorProfessors,
    modules,
    isLoadingModules,
    isErrorModules
}: RequestDetailFormProps ): JSX.Element {
    const {
        data        : sizes,
        isLoading   : isLoadingSizes,
        isError     : isErrorSizes,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SIZE ],
        queryFn     : () => fetchApi<SizeResponse[]>({ url: `${ENV.ACADEMIC_SECTION}sizes`, isApi: false }),
    });


    const {
        data        : days,
        isLoading   : isLoadingDays,
        isError     : isErrorDays,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.DAYS ],
        queryFn     : () => fetchApi<Day[]>({ url: `${ENV.ACADEMIC_SECTION}days`, isApi: false }),
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
        defaultValues   : defaultRequestDetail( initialData ),
    });


    useEffect(() => {
        form.reset( defaultRequestDetail( initialData ));
    }, [initialData, isOpen]);


    function onSubmitForm( formData: RequestDetailFormValues ): void {
        console.log( '🚀 ~ file: request-detail-form.tsx:191 ~ formData:', formData );
        formData.building = formData.spaceId?.split('-')[1] as Building;
        onSubmit( formData );
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className=" flex justify-between items-center gap-2">
                        <div>
                            <DialogTitle>
                                {initialData ? 'Editar Detalle' : 'Agregar Nuevo Detalle'}
                            </DialogTitle>

                            <DialogDescription>
                                {initialData 
                                    ? 'Modifique los campos necesarios del detalle.' 
                                    : 'Complete los campos para agregar un nuevo detalle.'}
                            </DialogDescription>
                        </div>

                        <Badge
                            className="mr-5"
                            variant={initialData.isPriority ? 'destructive' : 'default'}
                        >
                            {initialData.isPriority ? 'Prioritario' : 'Sin Prioridad' }
                        </Badge>
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
                                                value       = { field.value || '' }
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
                                                placeholder = "Ej: 30"
                                                value       = { field.value || '' }
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
                                                onChange    = {( e: React.ChangeEvent<HTMLInputElement> ) => field.onChange( e.target.value )}
                                            />
                                        : <MultiSelectCombobox
                                                multiple            = { false }
                                                placeholder         = "Seleccionar profesor"
                                                defaultValues       = { field.value || '' }
                                                onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                options             = { memoizedProfessorOptions }
                                                isLoading           = { isLoadingProfessors }
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
                                                disabled        = { isLoadingSizes }
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

                                    <Select
                                        defaultValue    = { field.value || 'Sin especificar' }
                                        disabled        = { isLoadingModules }
                                        onValueChange   = {( value ) => {
                                            field.onChange(value === "Sin especificar" ? null : value);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar módulo" />
                                            </SelectTrigger>
                                        </FormControl>

                                        {isLoadingModules ? (
                                            <div className="flex items-center gap-2 border border-zinc-300 dark:border-zinc-800 p-2 rounded animate-spin">
                                                <Loader2 className="h-4 w-4" />
                                                Cargando módulos...
                                            </div>
                                        ) : (
                                            <SelectContent>
                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                {modules?.map((module) => (
                                                    <SelectItem key={module.id.toString()} value={module.id.toString()}>
                                                        {module.name} {module.difference ? `-${module.difference}` : ''} {module.startHour}:{module.endHour}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        )}
                                    </Select>

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

                        {/* Descripción */}
                        <div className="col-span-2">
                            <FormLabel>Descripción</FormLabel>

                            <p>{initialData?.description || '-'}</p>
                        </div>

                        {/* Comentario */}
                        <FormField
                            control = { form.control }
                            name    = "comment"
                            render  = {({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Comentario</FormLabel>

                                    <FormControl>
                                        <Textarea 
                                            placeholder="Agregue un comentario opcional"
                                            className="min-h-[100px] max-h-[250px]"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>

                                    <FormDescription className="flex justify-end">
                                        {field.value?.length || 0 } / 500
                                    </FormDescription>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-6 flex justify-between items-center">
                            <Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { form.formState.isSubmitting }
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : initialData ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
}
