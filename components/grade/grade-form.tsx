"use client"

import { JSX, useEffect } from "react";

import {
    useForm,
    SubmitHandler,
}                       from "react-hook-form";
import {
    useMutation,
    useQueryClient
}                       from "@tanstack/react-query";
import { zodResolver }  from "@hookform/resolvers/zod";
import { toast }        from "sonner";
import { Loader2 }      from "lucide-react";
import * as z           from "zod";


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
}                   from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
}                   from "@/components/ui/form";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";

import {
    Grade,
    GradeFormData,
    HeadquartersEnum
}                                   from "@/types/grade";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";


const endpoint = 'grades';


const formSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    headquartersId: z.nativeEnum(HeadquartersEnum, {
        errorMap: () => ({ message: "La sede es requerida." }),
    }),
});


export type GradeFormValues = z.infer<typeof formSchema>;


interface GradeFormProps {
    grade?  : Grade;
    isOpen  : boolean;
    onClose : () => void;
}


const emptyGrade: Partial<GradeFormValues> = {
    name            : "",
    headquartersId  : undefined,
}

/**
 * API call para crear un nuevo grado
 */
const createGradeApi = async ( newGrade: GradeFormData ): Promise<Grade>  =>
    fetchApi<Grade>({
        url     : endpoint,
        method  : Method.POST,
        body    : newGrade
    });

/**
 * API call para actualizar un grado existente
 */
const updateGradeApi = async ( id: string, updatedGrade: GradeFormData ): Promise<Grade>  =>
    fetchApi<Grade>({
        url     : `${endpoint}/${id}`,
        method  : Method.PATCH,
        body    : updatedGrade
    });


export function GradeForm({
    grade,
    isOpen,
    onClose,
}: GradeFormProps ): JSX.Element {
    const queryClient   = useQueryClient();
    const form          = useForm<GradeFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : emptyGrade,
    });

    /**
     * Mutación para crear un grado
     */
    const createGradeMutation = useMutation<Grade, Error, GradeFormData>({
        mutationFn: createGradeApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.GRADES ]});
            onClose();
            toast( 'Grado creado exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al crear grado: ${mutationError.message}`, errorToast );
        },
    });

    /**
     * Mutación para actualizar un grado
     */
    const updateGradeMutation = useMutation<Grade, Error, { id: string, data: GradeFormData }>({
        mutationFn: ({ id, data }) => updateGradeApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.GRADES] });
            onClose();
            toast( 'Grado actualizado exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al actualizar grado: ${mutationError.message}`, errorToast );
        },
    });


    useEffect(() => {
        form.reset({
            name            : grade?.name           || "",
            headquartersId  : grade?.headquartersId || undefined,
        });
    }, [grade, form]);

    /**
     * Maneja el envío del formulario de grado
     */
    const handleSubmit: SubmitHandler<GradeFormValues> = ( data ) => {
        const gradeData: GradeFormData = {
            name            : data.name,
            headquartersId  : data.headquartersId,
        };

        if ( grade ) {
            updateGradeMutation.mutate({ id: grade.id, data: gradeData });
        } else {
            createGradeMutation.mutate( gradeData );
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {grade ? "Editar Unidad Académica" : "Agregar Nueva Unidad Académica"}
                    </DialogTitle>

                    <DialogDescription>
                        {grade
                            ? "Actualice los datos de la unidad académica"
                            : "Complete los datos de la nueva unidad académica"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control = { form.control }
                            name    = "name"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Unidad Académica</FormLabel>

                                    <FormControl>
                                        <Input placeholder="Ej: Ingeniería Civil" {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control = { form.control }
                            name    = "headquartersId"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Sede</FormLabel>

                                    <Select 
                                        onValueChange   = { field.onChange } 
                                        defaultValue    = { field.value }
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una sede" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            <SelectItem value={ HeadquartersEnum.ERRAZURIZ.toString() }>Errazuriz</SelectItem>
                                            <SelectItem value={ HeadquartersEnum.PENALOLEN.toString() }>Peñalolén</SelectItem>
                                            <SelectItem value={ HeadquartersEnum.VINADELMAR.toString() }>Viña del mar</SelectItem>
                                            <SelectItem value={ HeadquartersEnum.VITACURA.toString() }>Vitacura</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between gap-2 pt-2">
                            <Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { createGradeMutation.isPending || updateGradeMutation.isPending }
                            >
                                { createGradeMutation.isPending || updateGradeMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        { grade ? "Actualizando..." : "Creando..." }
                                    </>
                                ) : (
                                    grade ? "Actualizar" : "Agregar"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
