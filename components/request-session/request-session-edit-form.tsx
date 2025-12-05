"use client"

import { JSX, useEffect, useState } from "react"

import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { z }                            from "zod";
import { useForm }                      from "react-hook-form";
import { zodResolver }                  from "@hookform/resolvers/zod";
import { toast }                        from "sonner";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
}								from "@/components/ui/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
}							from "@/components/ui/tabs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
}								from "@/components/ui/form";
import {
    SpaceFilterSelector,
    FilterMode
}                               from "@/components/shared/space-filter-selector";
import { Button }				from "@/components/ui/button";
import { Switch }				from "@/components/ui/switch";
import { Textarea }				from "@/components/ui/textarea";
import { Label }				from "@/components/ui/label";
import { ProfessorSelect }		from "@/components/shared/item-select/professor-select";
import { HeadquartersSelect }	from "@/components/shared/item-select/headquarters-select";
import { CommentSection }		from "@/components/comment/comment-section";

import { RequestSession }			from "@/types/request-session.model";
import { Session }					from "@/types/section.model";
import { KEY_QUERYS }				from "@/consts/key-queries";
import { Method, fetchApi }			from "@/services/fetch";
import { errorToast, successToast }	from "@/config/toast/toast.config";


interface Props {
	requestSession	: RequestSession | undefined;
	onSuccess		: () => void;
	onCancel		: () => void;
	isOpen			: boolean;
	onClose			: () => void;
	requestId		: string;
	defaultTab?		: Tab;
}


const sessionLabels: Record<Session, string> = {
	[Session.C]	: 'Cátedra',
	[Session.A]	: 'Ayudantía',
	[Session.T]	: 'Taller',
	[Session.L]	: 'Laboratorio',
};

// Zod schema for request session edit validation
const requestSessionEditSchema = z.object({
	professorId		: z.string().nullable(),
	building		: z.string().nullable(),
	filterMode		: z.enum([ 'space', 'type-size' ]),
	spaceId			: z.string().nullable(),
	spaceType		: z.string().nullable(),
	spaceSizeId		: z.string().nullable(),
	isEnglish		: z.boolean(),
	isConsecutive	: z.boolean(),
	inAfternoon		: z.boolean(),
	description		: z.string().nullable(),
}).refine(
	( data ) => {
		if ( data.filterMode === 'space' ) {
			return data.spaceId !== null;
		} else {
			return data.spaceType !== null || data.spaceSizeId !== null;
		}
	},
	{
		message	: "Debe seleccionar al menos un filtro válido según el modo seleccionado",
		path	: ["spaceId"],
	}
);


type RequestSessionEditFormValues = z.infer<typeof requestSessionEditSchema>;

type Tab = 'form' | 'comments';


export function RequestSessionEditForm({
	requestSession,
	onSuccess,
	onCancel,
	isOpen,
	onClose,
	requestId,
	defaultTab = 'form',
}: Props ): JSX.Element {
	const queryClient = useQueryClient();
	const [ tab, setTab ] = useState<Tab>( defaultTab );

	const form = useForm<RequestSessionEditFormValues>({
		resolver	: zodResolver( requestSessionEditSchema ),
		defaultValues: {
			professorId		: null,
			building		: null,
			filterMode		: 'space',
			spaceId			: null,
			spaceType		: null,
			spaceSizeId		: null,
			isEnglish		: false,
			isConsecutive	: false,
			inAfternoon		: false,
			description		: null,
		},
	});

	// Update form when requestSession changes
	useEffect(() => {
		if ( requestSession ) {
			// Determine filter mode
			const filterMode: FilterMode = requestSession.spaceId ? 'space' : 'type-size';

			setTab( 'form' );

			form.reset({
				professorId		: requestSession.professor?.id || null,
				building		: requestSession.building || null,
				filterMode		: filterMode,
				spaceId			: requestSession.spaceId,
				spaceType		: requestSession.spaceType,
				spaceSizeId		: requestSession.spaceSize?.id || null,
				isEnglish		: requestSession.isEnglish,
				isConsecutive	: requestSession.isConsecutive,
				inAfternoon		: requestSession.inAfternoon,
				description		: requestSession.description,
			});
		}
	}, [ requestSession, form ]);

	// Update mutation
	const updateRequestSessionMutation = useMutation({
		mutationFn: async ( values: RequestSessionEditFormValues ) => {
			return fetchApi({
				url		: `request-sessions/${requestSession?.id}`,
				method	: Method.PATCH,
				body	: {
					professorId		: values.professorId,
					spaceId			: values.spaceId,
					spaceType		: values.spaceType,
					spaceSizeId		: values.spaceSizeId,
					isEnglish		: values.isEnglish,
					isConsecutive	: values.isConsecutive,
					inAfternoon		: values.inAfternoon,
					description		: values.description,
                    building		: values.building,
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUEST_SESSION, requestId ] });
			toast( 'Sesión actualizada exitosamente', successToast );
			onSuccess();
		},
		onError: ( error: Error ) => {
			toast( `Error al actualizar sesión: ${error.message}`, errorToast );
		},
	});


	const onSubmit = ( values: RequestSessionEditFormValues ) => {
		console.log('🚀 ~ file: request-session-edit-form.tsx:174 ~ values:', values)
		updateRequestSessionMutation.mutate( values );
	};


	const handleBuildingChange = ( buildingId: string | null ) => {
		form.setValue( 'building', buildingId );

		// Clear space filters when building changes
		form.setValue( 'spaceType', null );
		form.setValue( 'spaceSizeId', null );
		form.setValue( 'spaceId', null );
	};


	return (
		<Dialog open={ isOpen } onOpenChange={ onClose }>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						Editar Sesión - { requestSession ? sessionLabels[requestSession.session] : '' }
					</DialogTitle>

					<DialogDescription>
						Modifica los datos de la sesión de solicitud
					</DialogDescription>
				</DialogHeader>

				<Tabs
					defaultValue	= { tab }
					onValueChange	= {( value ) => setTab( value as Tab )}
					className		= "w-full"
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="form">Información</TabsTrigger>

						<TabsTrigger value="comments">
							Comentarios
						</TabsTrigger>
					</TabsList>

					<TabsContent value="form" className="space-y-4 mt-4">
						<Form {...form}>
							<form onSubmit={ form.handleSubmit( onSubmit ) } className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Profesor */}
                                    <FormField
                                        control	= { form.control }
                                        name	= "professorId"
                                        render	= {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Profesor</FormLabel>

                                                <FormControl>
                                                    <ProfessorSelect
                                                        multiple			= { false }
                                                        placeholder			= "Seleccionar profesor"
                                                        defaultValues		= { field.value || undefined }
                                                        onSelectionChange	= {( value ) => {
                                                            const professorId = typeof value === 'string' ? value : null;
                                                            field.onChange( professorId );
                                                        }}
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Edificio */}
                                    <FormField
                                        control	= { form.control }
                                        name	= "building"
                                        render	= {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Edificio</FormLabel>

                                                <FormControl>
                                                    <HeadquartersSelect
                                                        multiple			= { false }
                                                        placeholder			= "Seleccionar edificio"
                                                        defaultValues		= { field.value || undefined }
                                                        onSelectionChange	= {( value ) => {
                                                            const buildingId = typeof value === 'string' ? value : null;
                                                            field.onChange( buildingId );
                                                            handleBuildingChange( buildingId );
                                                        }}
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Selector de filtros de espacio */}
                                { form.watch( 'building' ) && (
                                    <SpaceFilterSelector
                                        buildingId          = { form.watch( 'building' ) }
                                        filterMode          = { form.watch( 'filterMode' ) }
                                        spaceId             = { form.watch( 'spaceId' ) }
                                        spaceType           = { form.watch( 'spaceType' ) }
                                        spaceSizeId         = { form.watch( 'spaceSizeId' ) }
                                        onFilterModeChange  = {( mode ) => form.setValue( 'filterMode', mode )}
                                        onSpaceIdChange     = {( spaceId ) => form.setValue( 'spaceId', typeof spaceId === 'string' ? spaceId : null )}
                                        onSpaceTypeChange   = {( spaceType ) => form.setValue( 'spaceType', spaceType )}
                                        onSpaceSizeIdChange = {( spaceSizeId ) => form.setValue( 'spaceSizeId', spaceSizeId )}
                                    />
                                )}

                                {/* Switches */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <FormField
                                        control	= { form.control }
                                        name	= "isEnglish"
                                        render	= {({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between rounded-lg border p-3">
                                                    <Label htmlFor="isEnglish" className="cursor-pointer">
                                                        En inglés
                                                    </Label>

                                                    <FormControl>
                                                        <Switch
                                                            id				= "isEnglish"
                                                            checked			= { field.value }
                                                            onCheckedChange	= { field.onChange }
                                                        />
                                                    </FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control	= { form.control }
                                        name	= "isConsecutive"
                                        render	= {({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between rounded-lg border p-3">
                                                    <Label htmlFor="isConsecutive" className="cursor-pointer">
                                                        Consecutivo
                                                    </Label>

                                                    <FormControl>
                                                        <Switch
                                                            id				= "isConsecutive"
                                                            checked			= { field.value }
                                                            onCheckedChange	= { field.onChange }
                                                        />
                                                    </FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control	= { form.control }
                                        name	= "inAfternoon"
                                        render	= {({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between rounded-lg border p-3">
                                                    <Label htmlFor="inAfternoon" className="cursor-pointer">
                                                        En la tarde
                                                    </Label>

                                                    <FormControl>
                                                        <Switch
                                                            id				= "inAfternoon"
                                                            checked			= { field.value }
                                                            onCheckedChange	= { field.onChange }
                                                        />
                                                    </FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Descripción */}
                                <FormField
                                    control	= { form.control }
                                    name	= "description"
                                    render	= {({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción de la sesión</FormLabel>

                                            <FormControl>
                                                <Textarea
                                                    placeholder	= "Descripción opcional"
                                                    value		= { field.value || '' }
                                                    onChange	= { field.onChange }
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

								<DialogFooter className="flex justify-between border-t pt-4">
									<Button
										type		= "button"
										variant		= "outline"
										onClick		= { onCancel }
										disabled	= { updateRequestSessionMutation.isPending }
									>
										Cancelar
									</Button>

									<Button
										type		= "submit"
										disabled	= { updateRequestSessionMutation.isPending }
									>
										{ updateRequestSessionMutation.isPending ? 'Guardando...' : 'Guardar Cambios' }
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</TabsContent>

					<TabsContent value="comments" className="mt-4">
						{/* <CommentSection
							requestSessionId	= { requestSession?.id }
							enabled				= { tab === 'comments' }
							size				= { 'h-[450px]' }
						/> */}
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
