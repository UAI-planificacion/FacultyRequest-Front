"use client"

import { JSX, useEffect } from "react"

import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import * as z           from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                   from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Switch }   from "@/components/ui/switch";

import { Staff, Role } from "@/types/staff.model";


export type StaffFormValues = z.infer<typeof formSchema>;


interface StaffFormProps {
    staff?      : Staff;
    onSubmit    : ( data: StaffFormValues ) => void;
    isOpen      : boolean;
    onClose     : () => void;
}


const formSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().min(1, {
        message: "El email es requerido.",
    }).regex(/^[a-zA-Z0-9._-]+$/, {
        message: "El email solo puede contener letras, números, puntos, guiones y guiones bajos.",
    }),
    role: z.enum([Role.EDITOR, Role.VIEWER, Role.ADMIN_FACULTY] as const, {
        message: "Por favor selecciona un rol válido.",
    }),
    isActive: z.boolean().default(true),
});


const emptyStaff = {
    name    : "",
    email   : "",
    role    : Role.EDITOR,
    isActive: true,
}


export function StaffForm({
    staff,
    isOpen,
    onSubmit,
    onClose,
}: StaffFormProps ): JSX.Element {
    const defaultValues: Partial<StaffFormValues> = emptyStaff;

    if ( staff ) {
        staff.email = staff.email.replace( '@uai.cl', '' );
    }

    const form = useForm<StaffFormValues>({
        resolver: zodResolver( formSchema ),
        defaultValues,
    })


    useEffect(() => {
        if ( !isOpen ) return;

        form.reset({
            name    : staff?.name     || emptyStaff.name,
            email   : staff?.email    || emptyStaff.email,
            role    : staff?.role     || emptyStaff.role,
            isActive: staff?.isActive!,
        });
    }, [ isOpen, staff?.id, form ]);


    const handleSubmit = async ( data: StaffFormValues ) => {
        data.email = data.email.toLowerCase() + "@uai.cl";
        onSubmit( data );
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {staff ? "Editar Personal" : "Agregar Nuevo Personal"}
                    </DialogTitle>

                    <DialogDescription>
                        {staff 
                            ? "Actualice los datos del personal existente" 
                            : "Agregue una nueva persona a esta facultad"
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control = { form.control }
                            name    = "name"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>

                                    <FormControl>
                                        <Input placeholder="Dr. Juan Pérez" {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control = { form.control }
                            name    = "email"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>

                                    <FormControl>
                                        <div className="flex items-center">
                                            <Input
                                                placeholder = "Ej: juan.perez, sin @uai.cl"
                                                type        = "text"
                                                className   = "rounded-none rounded-l-md z-10"
                                                {...field}
                                            />

                                            <div className="size-5 border border-zinc-300 dark:border-zinc-800 rounded-r-md py-[0.45rem] px-3">
                                                @uai.cl
                                            </div>
                                        </div>
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control = { form.control }
                            name    = "role"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>

                                    <Select
                                        onValueChange   = { field.onChange }
                                        defaultValue    = { field.value }
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un rol" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            <SelectItem value="ADMIN_FACULTY">Administrador de Facultad</SelectItem>
                                            <SelectItem value="EDITOR">Editor</SelectItem>
                                            <SelectItem value="VIEWER">Visualizador</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <FormDescription>
                                        Administrador de Facultad: Acceso completo para ver y editar, menos las asignaturas.
                                        <br />
                                        Editor: Puede ver y hacer cambios.
                                        <br />
                                        Visualizador: Solo puede ver información.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {staff && (
                            <FormField
                                control = { form.control }
                                name    = "isActive"
                                render  = {({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Activo</FormLabel>

                                            <p className="text-sm text-muted-foreground">
                                                Indica si es activo
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
                        )}

                        <div className="flex justify-between">
                            <Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
                                Cancelar
                            </Button>

                            <Button type="submit">
                                {staff ? "Actualizar" : "Agregar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
