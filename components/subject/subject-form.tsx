"use client"

import {
    JSX,
    useEffect,
    useMemo,
    useState
}                       from "react";
import { useRouter }    from 'next/navigation';

import {
	Calendar as CalendarIcon,
	Grid2x2,
	Plus,
	Trash,
}						from "lucide-react";
import { zodResolver }	from "@hookform/resolvers/zod";
import { useForm }		from "react-hook-form";
import * as z			from "zod";
import { useQuery }     from "@tanstack/react-query";


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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                           from "@/components/ui/select";
import {
    ToggleGroup,
    ToggleGroupItem
}                           from "@/components/ui/toggle-group";
import { Button }			from "@/components/ui/button";
import { Input }			from "@/components/ui/input";
import { Textarea }			from "@/components/ui/textarea";
import { Calendar }			from "@/components/ui/calendar";
import { Switch }			from "@/components/ui/switch";
import { ScrollArea }		from "@/components/ui/scroll-area";
import { SubjectUpload }    from "@/components/subject/subject-upload";
import { Checkbox }         from "@/components/ui/checkbox";

import {
    Building,
    Size,
    SpaceType
}                           from "@/types/request-detail.model";
import {
    cn,
    getSpaceType,
    tempoFormat
}                           from "@/lib/utils";
import { Subject }		    from "@/types/subject.model";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { fetchApi }         from "@/services/fetch";
import { SizeResponse }     from "@/types/request";
import { ENV }              from "@/config/envs/env";


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
    spaceType   : z.nativeEnum( SpaceType ).optional().nullable(),
    spaceSize   : z.nativeEnum( Size ).nullable().optional(),
    building    : z.nativeEnum( Building ).optional().nullable(),
    dates       : z.array(z.object({
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
        spaceType       : subject?.spaceType    || null,
        spaceSize       : subject?.spaceSize    || null,
        building        : subject?.building     || null,
	};
};


export function SubjectForm({
	subject,
	onSubmit,
	isOpen,
	onClose,
	costCenter,
}: SubjectFormProps ): JSX.Element {
    const [typeSpace, setTypeSpace] = useState<boolean[]>([ false, false, false ]);
    const router                    = useRouter();


    const form = useForm<SubjectFormValues>({
		resolver		: zodResolver( formSchema ),
		defaultValues   : emptySubject( subject ),
		mode			: 'onChange'
	});


	const { watch, setValue } = form;
	const dates = watch( 'dates' ) || [];


    const {
        data        : sizes,
        isLoading   : isLoadingSizes,
        isError     : isErrorSizes,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SIZE ],
        queryFn     : () => fetchApi<SizeResponse[]>({ url: `${ENV.ACADEMIC_SECTION}sizes`, isApi: false }),
    });


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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control = { form.control }
                                        name    = "spaceType"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel onClick={() => setTypeSpace([ false, true, false ])}>
                                                    Tipo de espacio
                                                </FormLabel>

                                                <div className="flex gap-2 items-center">
                                                    <Checkbox
                                                        className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center"
                                                        checked			= { typeSpace[1] }
                                                        onCheckedChange	= {( checked ) => setTypeSpace( [ false, checked as boolean, false ] )}
                                                    />

                                                    <Select
                                                        defaultValue    = { field.value ?? 'Sin especificar' }
                                                        onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                        disabled        = { !typeSpace[1] }
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
                                                        />

                                                        <Select
                                                            onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                            defaultValue    = { field.value || 'Sin especificar' }
                                                            disabled        = { isLoadingSizes || !typeSpace[2] }
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

                                    {/* cupos */}
                                    <FormField
                                        control = { form.control }
                                        name    = "students"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cupos Máximos de Estudiantes</FormLabel>

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
                                        name    = "building"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel onClick={() => setTypeSpace([ false, true, false ])}>
                                                    Edificio
                                                </FormLabel>

                                                <ToggleGroup
                                                    type            = "single"
                                                    variant         = "outline"
                                                    className       = "w-full"
                                                    value           = {  field.value as string }
                                                    onValueChange   = {( value: Building ) => {
                                                        if ( value ) field.onChange( value )
                                                    }}
                                                >
                                                    { Object.values( Building ).map(( type, index ) => {
                                                        const { isFirst, isLast, isSingle } = useMemo(() => {
                                                            const buildingValues = Object.values( Building );
                                                            return {
                                                                isFirst     : index === 0,
                                                                isLast      : index === buildingValues.length - 1,
                                                                isSingle    : buildingValues.length === 1
                                                            };
                                                        }, [ index ]);

                                                        return (
                                                            <ToggleGroupItem
                                                                key         = { type }
                                                                value       = { type }
                                                                aria-label  = {`Edificio ${type}`}
                                                                className   = {cn(
                                                                    "flex-1 border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-black data-[state=on]:dark:bg-white data-[state=on]:text-white data-[state=on]:dark:text-black data-[state=on]:hover:bg-zinc-800 data-[state=on]:dark:hover:bg-zinc-200",
                                                                    {
                                                                        "rounded-lg border-l border-r": isSingle,
                                                                        "rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none border-l": isFirst && !isSingle,
                                                                        "rounded-tl-none rounded-bl-none rounded-tr-lg rounded-br-lg border-r": isLast && !isSingle,
                                                                        "rounded-none": !isFirst && !isLast
                                                                    }
                                                                )}
                                                            >
                                                                { type }
                                                            </ToggleGroupItem>
                                                        );
                                                    })}
                                                </ToggleGroup>

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
                                                    onClick     = { () => router.push( `/sections/${subject.id}` )}
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
