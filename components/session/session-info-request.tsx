'use client'

import { JSX, useMemo, useState } from "react";

import {
	User,
	Building2,
	Clock,
	Languages,
	Sun,
	FileText,
	PlusIcon,
	Calendar,
    Cuboid,
    Edit,
    MessageCircle
}                   from 'lucide-react';
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader }    from '@/components/ui/card';
import { Button }                           from '@/components/ui/button';
import { ShowStatus }                       from '@/components/shared/status';
import { RequestForm }                      from '@/components/request/request-form';
import { SessionDayModuleSelector }         from '@/components/session/session-day-module-selector';
import { RequestSessionEditForm }           from '@/components/request-session/request-session-edit-form';
import { SesionInfoRequestCard }            from '@/components/session/session-info-request-card';
import { sessionLabels }                    from '@/components/section/section.config';

import {
    OfferSection,
    RequestSession
}                                           from '@/types/offer-section.model';
import { Request }                          from '@/types/request';
import { KEY_QUERYS }                       from "@/consts/key-queries";
import { fetchApi }                         from "@/services/fetch";
import { getBuildingName, getSpaceType }    from "@/lib/utils";


interface Props {
	section			: OfferSection;
	enabled			: boolean;
	facultyId?		: string;
}


const getResponsive = ( lenght: number ): string => ({
    1 : 'grid-cols-1',
    2 : 'grid-cols-1 md:grid-cols-2',
    3 : 'grid-cols-1 md:grid-cols-2',
    4 : 'grid-cols-1 md:grid-cols-2'
})[lenght] || 'grid-cols-1'


/**
 * Component to display request session information in an accordion format
 */
export function SessionInfoRequest({
	section,
	enabled,
	facultyId = ''
}: Props ): JSX.Element {
	const [isRequestFormOpen, setIsRequestFormOpen]					= useState( false );
	const [isRequestSessionEditOpen, setIsRequestSessionEditOpen]	= useState( false );
	const [selectedRequestSession, setSelectedRequestSession]		= useState<RequestSession['requestSessions'][0] | undefined>( undefined );

	const {
		data        : request,
		isLoading,
		isError
	} = useQuery({
		queryKey    : [ KEY_QUERYS.REQUESTS, section.id ],
		queryFn     : () => fetchApi<RequestSession>({ url : `requests/section/${section.id}` }),
	});

	// Preparar las sesiones seleccionadas para el selector de días/módulos
	const allSelectedSessions = useMemo(() => {
		if ( !request?.requestSessions ) return [];

		return request.requestSessions.flatMap( reqSession =>
			reqSession.sessionDayModules.map( sdm => ({
				session         : reqSession.session,
				dayModuleId     : parseInt( sdm.id ),
				dayId           : sdm.dayId,
				moduleId        : sdm.module.id
			}))
		);
	}, [ request ]);

	// Obtener las sesiones disponibles
	const availableSessions = useMemo(() => {
		if ( !request?.requestSessions ) return [];
		return request.requestSessions.map( rs => rs.session );
	}, [ request ]);

	// Memoizar valores de Detalle Espacio para evitar recálculos
	const spaceDetailValues = useMemo(() => {
		if ( !request?.requestSessions ) return [];

		return request.requestSessions.map( rs => ({
			session	: rs.session,
			value	: rs.spaceId || 
				( rs.spaceType
					? (
						`${ getSpaceType( rs.spaceType! )}
						${ rs.spaceSize
							? `${rs.spaceSize!.id} ${rs.spaceSize!.detail}`
							: ''
						}`
					)
					: ''
				)
		}));
	}, [ request ]);

	if ( !request ) return (
		<>
			<Card>
				<CardContent className="mt-5 space-y-0">
					<Button
						onClick     = {() => setIsRequestFormOpen( true )}
						className   = "gap-2 w-full"
					>
						<PlusIcon className="h-4 w-4" />
						Crear Solicitud
					</Button>
				</CardContent>
			</Card>

			<RequestForm
				isOpen      = { isRequestFormOpen }
				onClose     = {() => setIsRequestFormOpen( false )}
				request     = { undefined }
				facultyId   = { facultyId }
                // staff       = { staff }
				// section     = { section }
			/>
		</>
	);

	return (
		<Card>
		{/* <Card className="border-l-4 border-l-primary/50 p-4"> */}
			{/* <Accordion type="single" collapsible className="w-full"> */}
				{/* <AccordionItem value="request-info" className="border-none"> */}
					{/* <AccordionTrigger className="px-6 py-4 hover:no-underline"> */}
						{/* <CardHeader className="flex items-center justify-betwee"> */}
						<CardHeader>
                            <div className="flex items-center justify-between">
								<div className="flex flex-col items-start gap-0.5">
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold">
											Solicitud:
										</span>

										<span className="text-sm font-medium text-muted-foreground">
											{ request.title }
										</span>
									</div>

									<p className="text-xs text-muted-foreground">
										ID: { request.id }
									</p>
								</div>

                                <div className="flex items-center gap-2">
                                    <ShowStatus status={ request.status } />

                                    <Button
                                        onClick     = {() => setIsRequestFormOpen( true )}
                                        className   = "text-blue-500 hover:text-blue-600"
                                        variant     = "ghost"
                                        size        = "icon"
                                        title       = "Editar solicitud"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
						</CardHeader>
					{/* </AccordionTrigger> */}

					{/* // <AccordionContent className="px-6 pb-4"> */}
						<CardContent className="space-y-4 h-[calc(100vh-500px)] overflow-y-auto">
							{/* Cards agrupadas por campo */}
                            <div className="space-y-3">
                                {/* Botones de acción comentados temporalmente */}
                                <div className={`grid ${getResponsive( request.requestSessions.length )} gap-3`}>
                                    { request.requestSessions.map(( rs, index ) => (
                                        <div
                                            key={ index }
                                            className="flex items-center justify-between gap-1 border py-0.5 px-4 rounded-lg"
                                        >
                                            <span className="text-sm font-medium">
                                                { sessionLabels[rs.session] } ({ rs.sessionDayModules.length })
                                            </span>

                                            <Button
                                                onClick     = {() => {
                                                    setSelectedRequestSession( rs );
                                                    setIsRequestSessionEditOpen( true );
                                                }}
                                                className   = "text-blue-500 hover:text-blue-600"
                                                variant     = "ghost"
                                                size        = "icon"
                                                title       = "Editar solicitud de sesión"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									{/* Edificio */}
									<SesionInfoRequestCard
										icon	= { Building2 }
										label	= "Edificio"
										values	= { request.requestSessions.map( rs => ({
											session	: rs.session,
											value	: getBuildingName( rs.building )
										}))}
									/>

									{/* Detalle Espacio */}
									<SesionInfoRequestCard
										icon	= { Cuboid }
										label	= "Detalle Espacio"
										values	= { spaceDetailValues }
									/>

									{/* Profesor */}
									<SesionInfoRequestCard
										icon	= { User }
										label	= "Profesor"
										values	= { request.requestSessions.map( rs => ({
											session	: rs.session,
											value	: rs.professor ? `${rs.professor.id}-${rs.professor.name}` : null
										}))}
									/>

									{/* En la Tarde */}
									<SesionInfoRequestCard
										icon	= { Sun }
										label	= "En la Tarde"
										values	= { request.requestSessions.map( rs => ({
											session	: rs.session,
											value	: rs.isAfternoon ? "Sí" : "No"
										}))}
									/>

									{/* En Inglés */}
									<SesionInfoRequestCard
										icon	= { Languages }
										label	= "En Inglés"
										values	= { request.requestSessions.map( rs => ({
											session	: rs.session,
											value	: rs.isEnglish ? "Sí" : "No"
										}))}
									/>

									{/* Consecutivo */}
									<SesionInfoRequestCard
										icon	= { Clock }
										label	= "Consecutivo"
										values	= { request.requestSessions.map( rs => ({
											session	: rs.session,
											value	: rs.isConsecutive ? "Sí" : "No"
										}))}
									/>
								</div>

                                {/* Descripción */}
                                <SesionInfoRequestCard
                                    icon	= { FileText }
                                    label	= "Descripción"
                                    values	= { request.requestSessions.map( rs => ({
                                        session	: rs.session,
                                        value	: rs.description
                                    }))}
                                />
                            </div>

							{/* Tabla de sesiones por día y módulo */}
							{ allSelectedSessions.length > 0 && (
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Calendar className="h-5 w-5 text-primary" />
										<h3 className="text-sm font-semibold">
											Sesiones por Día y Módulo
										</h3>
									</div>

									<SessionDayModuleSelector
										selectedSessions    = { allSelectedSessions }
										onToggleDayModule   = {() => {}} // No hace nada, solo visualización
										currentSession      = { null } // No hay sesión actual en modo visualización
										availableSessions   = { availableSessions }
										enabled             = { false } // Modo visualización, sin botones
										showSessionButtons  = { false } // Ocultar botones de sesión
									/>
								</div>
							)}
						</CardContent>
					{/* </AccordionContent> */}
				{/* </AccordionItem> */}
			{/* </Accordion> */}

			{/* Formulario de edición de solicitud */}
			<RequestForm
				isOpen		= { isRequestFormOpen }
				onClose		= {() => setIsRequestFormOpen( false )}
				request		= { request as unknown as Request | undefined }
				facultyId	= { facultyId }
				// section		= { section }
			/>

			{/* Formulario de edición de sesión de solicitud */}
			{ selectedRequestSession && (
				<RequestSessionEditForm
					isOpen				= { isRequestSessionEditOpen }
					requestId			= { request?.id || '' }
					onClose				= {() => {
						setIsRequestSessionEditOpen( false );
						setSelectedRequestSession( undefined );
					}}
					onCancel			= {() => {
						setIsRequestSessionEditOpen( false );
						setSelectedRequestSession( undefined );
					}}
					onSuccess			= {() => {
						setIsRequestSessionEditOpen( false );
						setSelectedRequestSession( undefined );
					}}
					requestSession		= {{
						...selectedRequestSession,
						inAfternoon: selectedRequestSession.isAfternoon
					} as any}
				/>
			)}
		</Card>
	);
}
