"use client"

import {
    JSX,
    useEffect
}                       from "react";
import { useRouter }    from 'next/navigation';

import {
	Grid2x2,
}						from "lucide-react";
import { zodResolver }	from "@hookform/resolvers/zod";
import { useForm }		from "react-hook-form";
import * as z			from "zod";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
}							from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
}							from "@/components/ui/form";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                           from "@/components/ui/tabs";
import { Button }			from "@/components/ui/button";
import { Input }			from "@/components/ui/input";
import { Textarea }			from "@/components/ui/textarea";
import { Switch }			from "@/components/ui/switch";
import { SubjectUpload }    from "@/components/subject/subject-upload";
import { SizeSelect }       from "@/components/shared/item-select/size-select";
import { SpaceTypeSelect }  from "@/components/shared/item-select/space-type-select";
import { CostCenterSelect } from "@/components/shared/item-select/cost-center";

import { Size, SpaceType }  from "@/types/request-detail.model";
import { Subject }		    from "@/types/subject.model";


export type SubjectFormValues = z.infer<typeof formSchema>;


interface SubjectFormProps {
	subject?    : Subject;
	onSubmit    : ( data: SubjectFormValues ) => void;
	isOpen		: boolean;
	onClose		: () => void;
}


const formSchema = z.object({
    id: z.string().min(2, {
        message: "El código de la asignatura debe tener al menos 2 caracteres.",
    }).max(30, {
        message: "El código de la asignatura debe tener como máximo 30 caracteres."
    }),
    name: z.string().min(2, {
        message: "El nombre de la asignatura debe tener al menos 2 caracteres.",
    }).max(200, {
        message: "El nombre de la asignatura debe tener como máximo 200 caracteres."
    }),
    spaceType : z.nativeEnum( SpaceType ).optional().nullable(),
    spaceSizeId   : z.nativeEnum( Size ).nullable().optional(),
    costCenterId: z.string().min(2, {
        message: "El código del centro de costos debe tener al menos 2 caracteres.",
    }),
    isActive: z.boolean().default(true),
});


const emptySubject = ( subject: Subject | undefined ): Partial<SubjectFormValues> => {
	return {
		id              : subject?.id           || "",
		name            : subject?.name         || "",
		spaceType       : subject?.spaceType    || null,
		spaceSizeId     : subject?.spaceSizeId  || null,
		costCenterId    : subject?.costCenterId || "",
		isActive        : subject?.isActive,
	};
};


export function SubjectForm({
	subject,
	onSubmit,
	isOpen,
	onClose,
}: SubjectFormProps ): JSX.Element {
	const router = useRouter();

	const form = useForm<SubjectFormValues>({
		resolver: zodResolver( formSchema ),
		defaultValues: emptySubject( subject ),
	});


	useEffect(() => {
		form.reset( emptySubject( subject ));
	}, [ subject, form ]);


    const handleSubmit = ( data: SubjectFormValues ) => {
		onSubmit( data );
		form.reset();
	};


	return (
		<Dialog open={ isOpen } onOpenChange={ onClose }>
			<DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{ subject ? "Editar Asignatura" : "Crear Asignatura" }
					</DialogTitle>

					<DialogDescription>
						{ subject
							? "Modifica los datos de la asignatura."
							: "Completa los datos para crear una nueva asignatura."
						}
					</DialogDescription>
				</DialogHeader>

                <Tabs defaultValue="form" className="w-full">
                    { !subject &&
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="form">Formulario</TabsTrigger>
                            <TabsTrigger value="file">Archivo</TabsTrigger>
                        </TabsList>
                    }

                    <TabsContent value="form">
                        <Form {...form}>
                            <form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-4">
                                <FormField
                                    control = { form.control }
                                    name    = "id"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código de la Asignatura</FormLabel>

                                            <FormControl>
                                                <Input
                                                    placeholder = "Ej: MAT101"
                                                    {...field}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control = { form.control }
                                    name    = "name"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de la Asignatura</FormLabel>

                                            <FormControl>
                                                <Textarea
                                                    placeholder = "Ej: Matemáticas I"
                                                    {...field}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control = { form.control }
                                    name    = "costCenterId"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <CostCenterSelect
                                                label               = "Centro de Costos"
                                                placeholder         = "Seleccionar un centro de costos"
                                                defaultValues       = { field.value || '' }
                                                onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                multiple            = { false }
                                            />

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control = { form.control }
                                        name    = "spaceType"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <SpaceTypeSelect
                                                    label               = "Tipo de Espacio"
                                                    defaultValues       = { field.value || "none" }
                                                    onSelectionChange   = {( value ) => {
                                                        field.onChange( value === "none" ? null : value );

                                                        if ( value !== SpaceType.ROOM ) {
                                                            form.setValue("spaceSizeId", null);
                                                        }
                                                    }}
                                                />

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control = { form.control }
                                        name    = "spaceSizeId"
                                        render  = {({ field }) => {
                                            const spaceType     = form.watch( 'spaceType' );
                                            const isDisabled    = spaceType !== SpaceType.ROOM;

                                            return (
                                                <FormItem>
                                                    <SizeSelect
                                                        label               = "Tamaño del Espacio"
                                                        placeholder         = "Seleciona un tamaño"
                                                        onSelectionChange   = {( value ) => {
                                                            field.onChange( value === "none" ? null : value as string );
                                                        }}
                                                        defaultValues       = { field.value || "none" }
                                                        multiple            = { false }
                                                        disabled            = { isDisabled }
                                                    />

                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                </div>

                                { subject && 
                                    <FormField
                                        control = { form.control }
                                        name    = "isActive"
                                        render  = {({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Asignatura Activa
                                                    </FormLabel>

                                                    <FormDescription>
                                                        Marcar si la asignatura está activa
                                                    </FormDescription>
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
                                }

                                <div className="flex justify-between space-x-2">
                                    <Button
                                        type    = "button"
                                        variant = "outline"
                                        onClick = { onClose }
                                    >
                                        Cancelar
                                    </Button>

                                    <div className="flex gap-2 items-center">
                                        {subject &&
                                            <Button
                                                variant     = "outline"
                                                onClick     = { () => router.push( `/sections?subject=${subject.id}` )}
                                                type        = "button"
                                                className   = "gap-2"
                                            >
                                                <Grid2x2 className="w-5 h-5" />
                                                Ver Secciones
                                            </Button>
                                        }

                                        <Button
                                            type        = "submit"
                                            disabled    = { !form.formState.isValid }
                                        >
                                            { subject ? "Actualizar" : "Crear" }
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    { !subject &&
                        <TabsContent value="file">
                            <SubjectUpload isUploading={ false } />
                        </TabsContent>
                    }
                </Tabs>
			</DialogContent>
		</Dialog>
	);
}
