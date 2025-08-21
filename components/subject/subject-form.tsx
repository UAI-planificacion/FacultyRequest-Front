"use client"

import { JSX, useEffect } from "react";

import {
	Calendar as CalendarIcon,
	Plus,
	Trash,
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
	Popover,
	PopoverContent,
	PopoverTrigger
}							from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}							from "@/components/ui/table";
import {
	MultiSelectCombobox,
	Option
}							from "@/components/shared/Combobox";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                           from "@/components/ui/tabs";
import { Button }			from "@/components/ui/button";
import { Input }			from "@/components/ui/input";
import { Textarea }			from "@/components/ui/textarea";
import { Calendar }			from "@/components/ui/calendar";
import { Switch }			from "@/components/ui/switch";
import { ScrollArea }		from "@/components/ui/scroll-area";
import { SubjectUpload }    from "@/components/subject/subject-upload";

import { Subject }			from "@/types/subject.model";
import { cn, tempoFormat }	from "@/lib/utils";


// Interface for date pairs in the form
interface SubjectDate {
	startDate	: Date;
	endDate		: Date;
}


export type SubjectFormValues = z.infer<typeof formSchema>;


interface SubjectFormProps {
	subject?       : Subject;
	onSubmit		: ( data: SubjectFormValues ) => void;
	isOpen			: boolean;
	onClose			: () => void;
	costCenter		: Option[];
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
    dates: z.array(z.object({
        startDate: z.date({
            required_error: "La fecha de inicio es requerida."
        }),
        endDate: z.date({
            required_error: "La fecha de fin es requerida."
        })
    }).refine(data => data.startDate < data.endDate, {
        message: "La fecha de inicio debe ser anterior a la fecha de fin.",
    })).refine(dateRanges => {
        const sortedRanges = [...dateRanges].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        for ( let i = 0; i < sortedRanges.length - 1; i++ ) {
            const currentRange = sortedRanges[i];
            const nextRange = sortedRanges[i + 1];

            if ( currentRange.endDate > nextRange.startDate ) {
                return false;
            }
        }

        return true;
    }, {
        message: "Los rangos de fechas no pueden superponerse.",
    }),
    students: z.coerce.number().min(1, {
        message: "El número máximo de estudiantes debe ser al menos 1.",
    }).max(1000, {
        message: "El número máximo de estudiantes no puede exceder los 1000."
    }),
    costCenterId: z.string().min(2, {
        message: "El código del centro de costos debe tener al menos 2 caracteres.",
    }),
    isEnglish: z.boolean().default(false),
});


const emptySubject = ( subject: Subject | undefined ): Partial<SubjectFormValues> => {
	const dates: SubjectDate[] = [];

	if ( subject?.startDate && subject.startDate.length > 0 ) {
		subject.startDate.forEach(( startDate, index ) => {
            const startDateObj  = startDate instanceof Date ? startDate : new Date( startDate );
            const endDateValue  = subject.endDate?.[index];
            const endDateObj    = endDateValue
                ? ( endDateValue instanceof Date ? endDateValue : new Date( endDateValue ))
                : new Date( startDateObj.getTime() + 86400000 );

            dates.push({
                startDate   : startDateObj,
                endDate     : endDateObj
            });
		});
	} else if ( !subject ) {
		const today     = new Date();
        const tomorrow  = new Date( today.getTime() + 86400000 );

        dates.push({
            startDate   : today,
            endDate     : tomorrow
        });
	}

	return {
		id				: subject?.id			|| '',
		name			: subject?.name			|| '',
		students		: subject?.students		|| 0,
		costCenterId	: subject?.costCenterId	|| '',
		dates,
		isEnglish		: subject?.isEnglish	|| false,
	};
};


export function SubjectForm({
	subject,
	onSubmit,
	isOpen,
	onClose,
	costCenter,
}: SubjectFormProps ): JSX.Element {
	const form = useForm<SubjectFormValues>({
		resolver		: zodResolver( formSchema ),
		defaultValues   : emptySubject( subject ),
		mode			: 'onChange'
	});


	const { watch, setValue } = form;
	const dates = watch( 'dates' ) || [];


	useEffect(() => {
		if ( !isOpen ) return;

        form.reset( emptySubject( subject ));
	}, [ isOpen, subject?.id ]);


	function handleSubmit( formData: SubjectFormValues ): void {
		const startDate = formData.dates.map( date => date.startDate );
		const endDate	= formData.dates.map( date => date.endDate );
		const data      = {
			...formData,
			startDate,
			endDate,
		};

        const { dates, ...rest } = data;

		console.log('🚀 ~ file: subject-form.tsx:64 ~ data:', rest);
		onSubmit( data );
	}


    function addDatePair(): void {
		const newDates = [ ...dates, { startDate: new Date(), endDate: new Date() } ];
		setValue( 'dates', newDates );
	};


    function removeDatePair( index: number ): void {
		const newDates = dates.filter( ( _, i ) => i !== index );
		setValue( 'dates', newDates );
	};


    function updateStartDate( index: number, date: Date | undefined ): void {
		if ( !date ) return;

        const newDates = [ ...dates ];
		newDates[ index ] = { ...newDates[ index ], startDate: date };
		setValue( 'dates', newDates );
	};


    function updateEndDate( index: number, date: Date | undefined ): void {
		if ( !date ) return;

		const newDates      = [ ...dates ];
		newDates[ index ]   = { ...newDates[ index ], endDate: date };

        setValue( 'dates', newDates );
	};


    return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{subject ? "Editar Asignatura" : "Nueva Asignatura"}
					</DialogTitle>

					<DialogDescription>
						{subject
							? "Actualizar los detalles de una asignatura existente"
							: "Agregar una nueva asignatura a esta facultad"
						}
					</DialogDescription>
				</DialogHeader>

                <Tabs defaultValue="form" className="w-full">
                    { !subject &&
                        <TabsList className="grid grid-cols-2 mb-4">
                            <TabsTrigger value="form">Formulario</TabsTrigger>
                            <TabsTrigger value="file">Archivo</TabsTrigger>
                        </TabsList>
                    }

                    <TabsContent value="form">
                        <Form {...form}>
                            <form
                                onSubmit    = { form.handleSubmit( handleSubmit )}
                                className   = "space-y-4"
                            >
                                <FormField
                                    control = { form.control }
                                    name    = "id"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código de la Asignatura</FormLabel>

                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder = "Ej: MAT101"
                                                    disabled	= { !!subject?.id }
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
                                                    {...field}
                                                    placeholder = "Ej: Matemáticas Básicas"
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control = { form.control }
                                        name    = "students"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número Máximo de Estudiantes</FormLabel>

                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type		= "number"
                                                        min			= { 1 }
                                                        max			= { 1000 }
                                                        placeholder = "30"
                                                        onChange	= {(e) => field.onChange( parseInt( e.target.value ) || 0)}
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
                                                <FormLabel>Centro de Costos</FormLabel>

                                                <FormControl>
                                                    <MultiSelectCombobox
                                                        multiple			= { false }
                                                        placeholder			= "Seleccionar centro de costos"
                                                        defaultValues		= { field.value || '' }
                                                        onSelectionChange	= {( value ) => field.onChange( value === undefined ? null : value )}
                                                        options				= { costCenter }
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control = { form.control }
                                    name    = "dates"
                                    render  = {() => (
                                        <FormItem>
                                            <ScrollArea className={cn(
                                                dates.length <= 1 ? 'h-28' : dates.length <= 3 ? 'h-auto' : 'h-72',
                                                "w-full border rounded-md transition-all duration-300"
                                            )}>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="bg-background w-[250px] text-white">Fecha de Inicio</TableHead>
                                                            <TableHead className="bg-background w-[250px] text-white">Fecha de Fin</TableHead>
                                                            <TableHead className="bg-background w-[30px]">
                                                                <Button
                                                                    type        = "button"
                                                                    onClick     = { addDatePair }
                                                                    className   = "gap-2"
                                                                    size        = "sm"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>

                                                    <TableBody>
                                                        { dates.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="text-center bg-background">
                                                                    No hay fechas disponibles
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : null }
                                                        {dates.map(( dateItem, index ) => (
                                                            <TableRow key={index}>
                                                                <TableCell className="w-[250px]" isPadding={false}>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                variant     = "outline"
                                                                                className   = {cn(
                                                                                    "w-full justify-start text-left font-normal gap-2",
                                                                                    !dateItem.startDate && "text-muted-foreground"
                                                                                )}
                                                                            >
                                                                                <CalendarIcon className="h-4 w-4" />

                                                                                { dateItem.startDate
                                                                                    ? tempoFormat( dateItem.startDate )
                                                                                    : "Seleccionar fecha"
                                                                                }
                                                                            </Button>
                                                                        </PopoverTrigger>

                                                                        <PopoverContent className="w-auto p-0">
                                                                            <Calendar
                                                                                mode        = "single"
                                                                                selected    = { dateItem.startDate }
                                                                                onSelect    = {( selectedDate ) => updateStartDate( index, selectedDate )}
                                                                                disabled    = {( date ) => date < new Date() }
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </TableCell>

                                                                <TableCell className="w-[250px]" isPadding={false}>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                variant     = "outline"
                                                                                className   = "w-full justify-start text-left font-normal gap-2"
                                                                            >
                                                                                <CalendarIcon className="h-4 w-4" />

                                                                                { tempoFormat( dateItem.endDate ) }
                                                                            </Button>
                                                                        </PopoverTrigger>

                                                                        <PopoverContent className="w-auto p-0">
                                                                            <Calendar
                                                                                mode        = "single"
                                                                                selected    = { dateItem.endDate }
                                                                                onSelect    = {( selectedDate ) => updateEndDate( index, selectedDate )}
                                                                                disabled    = {( date ) => date < dateItem.startDate || date < new Date() }
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </TableCell>

                                                                <TableCell className="w-[30px] text-center" isPadding={false}>
                                                                    <Button
                                                                        type    = "button"
                                                                        variant = "destructive"
                                                                        size    = "icon"
                                                                        onClick = {() => removeDatePair( index )}
                                                                    >
                                                                        <Trash className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </ScrollArea>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control = { form.control }
                                    name    = "isEnglish"
                                    render  = {({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Asignatura en Inglés
                                                </FormLabel>

                                                <FormDescription>
                                                    Marcar si la asignatura se imparte en inglés
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

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type    = "button"
                                        variant = "outline"
                                        onClick = { onClose }
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type        = "submit"
                                        disabled    = { !form.formState.isValid }
                                    >
                                        { subject ? "Actualizar" : "Crear" }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    { !subject &&
                        <TabsContent value="file">
                            <SubjectUpload
                                onUpload    = { () => {} }
                                isUploading = { false }
                                />
                        </TabsContent>
                    }
                </Tabs>
			</DialogContent>
		</Dialog>
	);
}
