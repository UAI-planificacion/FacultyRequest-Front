"use client"

import { JSX, useEffect } from "react"

import {
    useMutation,
    useQueryClient
}                       from "@tanstack/react-query";
import { toast }        from "sonner";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import * as z           from "zod";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                           from "@/components/ui/select";
import { Button }           from "@/components/ui/button";
import { Switch }           from "@/components/ui/switch";
import { PeriodSelect }     from "@/components/shared/item-select/period-select";
import { SizeSelect }       from "@/components/shared/item-select/size-select";
import { SubjectSelect }    from "@/components/shared/item-select/subject-select";
import { CostCenterSelect } from "@/components/shared/item-select/cost-center";
import { SessionButton }    from "@/components/section/session-button";
import { OfferDates }       from "@/components/offer/offer-dates";

import {
    Building,
    Size,
    SpaceType
}                                   from "@/types/request-detail.model";
import {
    CreateOffer,
    Offer,
    UpdateOffer
}                                   from "@/types/offer.model";
import { Subject }                  from "@/types/subject.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { getSpaceType }             from "@/lib/utils";
import { errorToast, successToast } from "@/config/toast/toast.config";
// import { updateFacultyTotal }       from "@/app/faculties/page";
import { Session }                  from "@/types/section.model";


// Form schema with Zod validation
const formSchema = z.object({
    startDate       : z.array( z.date() ).min( 1, "Al menos una fecha es requerida" ),
    endDate         : z.array( z.date() ).min( 1, "Al menos una fecha de fin es requerida" ),
    building        : z.nativeEnum( Building ).nullable(),
    isEnglish       : z.boolean(),
    workshop        : z.number().min( 0, "El taller debe ser mayor o igual a 0" ),
    lecture         : z.number().min( 0, "La conferencia debe ser mayor o igual a 0" ),
    tutoringSession : z.number().min( 0, "La sesión tutorial debe ser mayor o igual a 0" ),
    laboratory      : z.number().min( 0, "El laboratorio debe ser mayor o igual a 0" ),
    subjectId       : z.string().min( 1, "La asignatura es requerida" ),
    spaceType       : z.nativeEnum( SpaceType ).nullable(),
    spaceSizeId     : z.nativeEnum( Size ).nullable(),
    periodId        : z.string().min( 1, "El período es requerido" ),
    costCenterId    : z.string().min( 1, 'El centro de costo es requerido' ),
}).refine(( data ) => {
    const { workshop, lecture, tutoringSession, laboratory } = data;

    return workshop > 0 || lecture > 0 || tutoringSession > 0 || laboratory > 0;
}, {
    message : "Al menos una sesión debe ser mayor que 0",
    path    : [ "workshop" ],
});


export type OfferFormValues = z.infer<typeof formSchema>;


// Props interface
interface OfferFormProps {
    offer?      : Offer;
    isOpen      : boolean;
    onClose     : () => void;
    onSubmit?   : ( offer: Offer ) => void;
    facultyId   : string;
    subject?    : Subject | undefined;
}


// Default values function
function defaultOfferValues( offer?: Offer, subject? : Subject ): Partial<OfferFormValues> {
    if ( !offer ) {
        return {
            startDate       : [],
            endDate         : [],
            building        : null,
            isEnglish       : false,
            workshop        : 0,
            lecture         : 0,
            tutoringSession : 0,
            laboratory      : 0,
            subjectId       : subject?.id           || '',
            spaceType       : subject?.spaceType    ||  null,
            spaceSizeId     : subject?.spaceSizeId  || null,
            periodId        : '',
            costCenterId    : subject?.costCenterId || '',
        };
    }

    return {
        startDate       : offer.startDate.map( date => date instanceof Date ? date : new Date( date )),
        endDate         : offer.endDate.map( date => date instanceof Date ? date : new Date( date )),
        building        : offer.building,
        isEnglish       : offer.isEnglish,
        workshop        : offer.workshop,
        lecture         : offer.lecture,
        tutoringSession : offer.tutoringSession,
        laboratory      : offer.laboratory,
        subjectId       : offer.subject.id,
        spaceType       : offer.spaceType,
        spaceSizeId     : offer.spaceSize?.id,
        periodId        : offer.period.id,
        costCenterId    : offer.costCenterId,
    };
}


/**
 * API call to create a new offer
 */
const createOfferApi = async ( newOffer: CreateOffer ): Promise<Offer> =>
    fetchApi<Offer>({
        url     : 'offers',
        method  : Method.POST,
        body    : newOffer
    });


/**
 * API call to update an existing offer
 */
const updateOfferApi = async ( updatedOffer: UpdateOffer ): Promise<Offer> =>
    fetchApi<Offer>({
        url     : `offers/${updatedOffer.id}`,
        method  : Method.PATCH,
        body    : updatedOffer
    });


/**
 * Get form field name for session type
 */
function getSessionFieldName( session: Session ): keyof OfferFormValues {
    switch ( session ) {
        case Session.C: return 'lecture';
        case Session.A: return 'tutoringSession';
        case Session.T: return 'workshop';
        case Session.L: return 'laboratory';
        default: return 'lecture';
    }
}


export const updateSubjectOffersCount = ( 
    queryClient: ReturnType<typeof useQueryClient>, 
    facultyId: string, 
    subjectId: string, 
    increment: boolean 
): void => {
    queryClient.setQueryData<Subject[]>(
        [ KEY_QUERYS.SUBJECTS, facultyId ],
        ( oldSubjects: Subject[] | undefined ) => {
            if ( !oldSubjects ) return oldSubjects;

            return oldSubjects.map( ( subject: Subject ) => 
                subject.id === subjectId
                    ? {
                        ...subject,
                        offersCount: subject.offersCount + ( increment ? 1 : -1 )
                    }
                    : subject
            );
        }
    );
};


export function OfferForm({
    offer,
    isOpen,
    onClose,
    onSubmit,
    facultyId,
    subject
}: OfferFormProps ): JSX.Element {
    const queryClient = useQueryClient();


    const form = useForm<OfferFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultOfferValues( offer, subject ),
    });


    /**
     * Update session count by delta
     */
    function updateSessionCount( _: string, session: Session, delta: number ): void {
        const currentValue = form.getValues( getSessionFieldName( session ));
        const newValue = Math.max( 0, (Number(currentValue) ?? 0) + delta );
        form.setValue( getSessionFieldName( session ), newValue );
    }


    /**
     * Set session count to specific value
     */
    function setSessionCount( _: string, session: Session, value: string ): void {
        const numValue = parseInt( value ) || 0;
        form.setValue( getSessionFieldName( session ), Math.max( 0, numValue ));
    }


    /**
     * Create mock section data for SessionButton
     */
    function createMockSection(): any {
        const watchedValues = form.watch();
        return {
            id              : 'offer-form',
            workshop        : watchedValues.workshop        || 0,
            lecture         : watchedValues.lecture         || 0,
            tutoringSession : watchedValues.tutoringSession || 0,
            laboratory      : watchedValues.laboratory      || 0,
            sessionCounts   : {
                [Session.C]     : watchedValues.lecture         || 0,
                [Session.A]     : watchedValues.tutoringSession || 0,
                [Session.T]     : watchedValues.workshop        || 0,
                [Session.L]     : watchedValues.laboratory      || 0,
            }
        };
    }


    /**
     * Mutation to create an offer
     */
    const createOfferMutation = useMutation<Offer, Error, CreateOffer>({
        mutationFn: createOfferApi,
        onSuccess: ( newOffer ) => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.OFFERS, facultyId ]});
            updateSubjectOffersCount( queryClient, facultyId, newOffer.subject.id, true );
            // updateFacultyTotal( queryClient, facultyId, true, 'totalOffers' );
            onClose();
            onSubmit?.( newOffer );
            toast( 'Oferta creada exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al crear oferta: ${mutationError.message}`, errorToast );
        },
    });


    /**
     * Mutation to update an offer
     */
    const updateOfferMutation = useMutation<Offer, Error, UpdateOffer>({
        mutationFn: updateOfferApi,
        onSuccess: ( updatedOffer ) => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.OFFERS, facultyId ]});
            onClose();
            onSubmit?.( updatedOffer );
            toast( 'Oferta actualizada exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al actualizar oferta: ${mutationError.message}`, errorToast );
        },
    });


    /**
     * Handle form submission
     */
    function handleSubmit( values: OfferFormValues ): void {
        console.log("🚀 ~ file: offer-form.tsx:244 ~ values:", values)
        if ( offer ) {
            // Update existing offer
            const updateData: UpdateOffer = {
                id              : offer.id,
                ...values
            };
            updateOfferMutation.mutate( updateData );
        } else {
            // Create new offer
            const createData: CreateOffer = values;
            createOfferMutation.mutate( createData );
        }
    }


    // Reset form when offer changes
    useEffect(() => {
        form.reset( defaultOfferValues( offer, subject ));
    }, [offer, isOpen]);


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        { offer ? 'Editar Oferta' : 'Crear Nueva Oferta' }
                    </DialogTitle>

                    <DialogDescription>
                        { offer
                            ? 'Modifica los datos de la oferta existente.'
                            : 'Completa los datos para crear una nueva oferta.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit( handleSubmit )} className="space-y-4">
                        {/* Building and Space Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control = { form.control }
                                name    = "subjectId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <SubjectSelect
                                            label               = "Asignatura *"
                                            defaultValues       = { field.value }
                                            onSelectionChange   = { field.onChange }
                                            multiple            = { false }
                                            queryKey            = {[ KEY_QUERYS.SUBJECTS, facultyId ]}
                                            url                 = { facultyId }
                                            enabled             = { isOpen }
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Period Selection */}
                            <FormField
                                control = { form.control }
                                name    = "periodId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <PeriodSelect
                                            label               = "Período *"
                                            defaultValues       = { field.value || '' }
                                            multiple            = { false }
                                            onSelectionChange   = {( values ) => field.onChange( values || '' )}
                                            enabled             = { isOpen }
                                        />

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
                                            label               = "Centro de Costos *"
                                            defaultValues       = { field.value || '' }
                                            multiple            = { false }
                                            onSelectionChange   = {( values ) => field.onChange( values || null )}
                                            enabled             = { isOpen }
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control = { form.control }
                                name    = "spaceType"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Espacio</FormLabel>

                                        <Select
                                            onValueChange   = {( value ) => {
                                                field.onChange( value === "null" ? null : value );

                                                if ( value !== SpaceType.ROOM ) {
                                                    form.setValue("spaceSizeId", null);
                                                }
                                            }}
                                            defaultValue    = { field.value || "null" }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="null">Sin especificar</SelectItem>

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

                            <FormField
                                control = { form.control }
                                name    = "spaceSizeId"
                                render  = {({ field }) => {
                                    const spaceType = form.watch("spaceType");
                                    const isDisabled = spaceType !== SpaceType.ROOM;

                                    return (
                                        <FormItem>
                                            <SizeSelect
                                                label               = "Tamaño del Espacio"
                                                defaultValues       = { field.value || '' }
                                                multiple            = { false }
                                                disabled            = { isDisabled }
                                                onSelectionChange   = {( values ) => field.onChange( values === '' ? null : values )}
                                            />

                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                control = { form.control }
                                name    = "building"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Edificio</FormLabel>

                                        <Select
                                            onValueChange   = {( value ) => field.onChange( value === "null" ? null : value )}
                                            defaultValue    = { field.value || "null" }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar edificio" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="null">Sin especificar</SelectItem>

                                                {Object.values( Building ).map( building => (
                                                    <SelectItem key={building} value={building}>
                                                        {building}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            {/* <h3 className="text-lg font-medium">Sesiones</h3> */}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SessionButton
                                    session             = { Session.C }
                                    updateSessionCount  = { updateSessionCount }
                                    setSessionCount     = { setSessionCount }
                                    section             = { createMockSection() }
                                    showLabel           = { true }
                                />

                                <SessionButton
                                    session             = { Session.T }
                                    updateSessionCount  = { updateSessionCount }
                                    setSessionCount     = { setSessionCount }
                                    section             = { createMockSection() }
                                    showLabel           = { true }
                                />

                                <SessionButton
                                    session             = { Session.A }
                                    updateSessionCount  = { updateSessionCount }
                                    setSessionCount     = { setSessionCount }
                                    section             = { createMockSection() }
                                    showLabel           = { true }
                                />

                                <SessionButton
                                    session             = { Session.L }
                                    updateSessionCount  = { updateSessionCount }
                                    setSessionCount     = { setSessionCount }
                                    section             = { createMockSection() }
                                    showLabel           = { true }
                                />
                            </div>

                            {/* Error message for sessions validation */}
                            <FormField
                                control = { form.control }
                                name    = "workshop"
                                render  = {({ fieldState }) => (
                                    <FormItem>
                                        {fieldState.error && (
                                            <FormMessage className="text-start">
                                                {fieldState.error.message}
                                            </FormMessage>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* English Switch */}
                        <FormField
                            control = { form.control }
                            name    = "isEnglish"
                            render  = {({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Materia en Inglés
                                        </FormLabel>

                                        <FormDescription>
                                            Indica si la materia se imparte en inglés
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

                        {/* Start Dates Section */}
                        <FormField
                            control = { form.control }
                            name    = "startDate"
                            render  = {({ field, fieldState }) => (
                                <OfferDates form={form} />
                            )}
                        />

                        {/* Form Actions */}
                        <div className="flex justify-between gap-2 pt-4 border-t">
                            <Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
                                Cancelar
                            </Button>

                            {/* <Button
                                type        = "submit"
                                disabled    = { createOfferMutation.isPending || updateOfferMutation.isPending }
                            >
                                { createOfferMutation.isPending || updateOfferMutation.isPending
                                    ? ( offer ? 'Actualizando...' : 'Creando...' )
                                    : ( offer ? 'Actualizar Oferta' : 'Crear Oferta' )
                                }
                            </Button> */}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
