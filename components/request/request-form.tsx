"use client"

import { JSX, useEffect, useMemo } from "react"

import { z }            from "zod";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import { useQuery }     from "@tanstack/react-query";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                               from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                               from "@/components/ui/form";
import { Input }                from "@/components/ui/input";
import { Button }               from "@/components/ui/button";
import { Textarea }             from "@/components/ui/textarea";
import { ShowDateAt }           from "@/components/shared/date-at";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { ShowStatus }           from "@/components/shared/status";
import { Switch }               from "@/components/ui/switch";

import { Request }      from "@/types/request";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Subject }      from "@/types/subject.model";


export type RequestFormValues = z.infer<typeof formSchema>;


interface RequestFormProps {
    isOpen      : boolean;
    onClose     : () => void;
    onSubmit    : ( data: RequestFormValues ) => void;
    data        : Request | undefined;
    facultyId   : string;
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
    subjectId: z.string({
        required_error: "Debe seleccionar una asignatura",
        invalid_type_error: "Asignatura no válida"
    }).min( 1, { message: "Debe seleccionar una asignatura" })
});


const defaultRequest = ( data : Request | undefined ) => ({
    title           : data?.title           || '',
    isConsecutive   : data?.isConsecutive   || false,
    description     : data?.description     || '',
    subjectId       : data?.subject.id      || '',
});


export function RequestForm({
    isOpen,
    onClose,
    onSubmit,
    data,
    facultyId
}: RequestFormProps ): JSX.Element {
    const { data: subjects, isLoading, isError } = useQuery<Subject[]>({
        queryKey: [KEY_QUERYS.SUBJECTS, facultyId],
        queryFn : () => fetchApi({ url: `subjects/all/${facultyId}` }),
    });


    const memoizedSubject = useMemo(() => {
        return subjects?.map( professor => ({
            id      : professor.id,
            label   : `${professor.id}-${professor.name}`,
            value   : professor.id,
        })) ?? [];
    }, [subjects]);


    const form = useForm<RequestFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultRequest( data )
    });


    useEffect(() => {
        form.reset( defaultRequest( data ));
    }, [data, isOpen]);


    const handleSubmit = ( data: RequestFormValues ) => {
        console.log('🚀 ~ file: request-form.tsx:71 ~ data:', data)
        onSubmit( data );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="space-y-3">
                    <div className="flex justify-between items-center mr-5">
                        <div className="space-y-1">
                            <DialogTitle>Editar Solicitud</DialogTitle>

                            <DialogDescription>
                                Realice los cambios necesarios en la solicitud
                            </DialogDescription>
                        </div>

                        { data && <ShowStatus status={data.status} /> }
                    </div>
                </DialogHeader>

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
                                                placeholder="Ingrese el título de la solicitud"
                                                {...field} 
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Subject */}
                            <FormField
                                control = { form.control }
                                name    = "subjectId"
                                render  = {({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Asignatura</FormLabel>

                                            <FormControl>
                                                { isError ? (
                                                    <>
                                                        <Input
                                                            placeholder="ID de la asignatura"
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                        />

                                                        <FormDescription>
                                                            Error al cargar las asignaturas. Ingrese el ID manualmente.
                                                        </FormDescription>
                                                    </>
                                                ) : (
                                                    <MultiSelectCombobox
                                                        multiple            = { false }
                                                        placeholder         = "Seleccionar una asignatura"
                                                        defaultValues       = { field.value || '' }
                                                        onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                        options             = { memoizedSubject }
                                                        isLoading           = { isLoading }
                                                    />
                                                )}
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
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
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
                                                placeholder="Agregue una descripción (opcional)"
                                                className="min-h-[100px] max-h-[200px]"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>

                                        <FormDescription className="text-xs flex justify-end">
                                            {field.value?.length || 0} / 500
                                        </FormDescription>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Comments */}
                            { data && 
                                <div className="flex flex-col space-y-1">
                                    <label>Comentarios</label>
                                    <p>{data.comment || 'Sin comentarios.'}</p>
                                </div>
                            }
                        </div>

                        <div className="flex justify-between space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>

                            <Button type="submit">
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
