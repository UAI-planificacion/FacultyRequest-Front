'use client'

import { JSX } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
}						from "@/components/ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
}						from "@/components/ui/accordion";
import { Skeleton }     from "@/components/ui/skeleton";
import { Badge }		from "@/components/ui/badge";
import { SessionType }  from "@/components/session/session-type";

import { tempoFormat }  from "@/lib/utils";
import { OfferSession } from "@/types/offer-section.model";


interface Props {
	sessionData?    : OfferSession | null;
	isLoading		: boolean;
}

/**
 * SessionInfoCard Component
 * 
 * Displays detailed information about a selected session.
 * Receives session data as prop from parent component.
 */
export function SessionInfoCard({
    sessionData,
    isLoading
}: Props ): JSX.Element | null {
	if ( !sessionData && !isLoading ) {
		return null;
	}


	if ( isLoading ) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64 mt-2" />
				</CardHeader>

				<CardContent className="space-y-3">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</CardContent>
			</Card>
		);
	}


	if ( !isLoading && !sessionData ) {
		return (
			<Card className="border-red-200 dark:border-red-800">
				<CardHeader>
					<CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
					<CardDescription>No se pudo cargar la información de la sesión</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if ( !sessionData ) {
		return null;
	}


	return (
		<Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
			<Accordion type="single" collapsible>
				<AccordionItem value="session-info" className="border-none">
					<CardHeader className="pb-2">
						<AccordionTrigger className="hover:no-underline py-0">
							<div className="flex items-center gap-2">
								<CardTitle className="text-base">Información de la Sesión</CardTitle>

                                <SessionType session={sessionData.name} />

                                <Badge>SSEC {sessionData.section.subject.id}-{sessionData.section.code}</Badge>
							</div>
						</AccordionTrigger>

						<CardDescription className="mt-1">
							Datos de la sesión seleccionada a modificar
						</CardDescription>
					</CardHeader>

					<AccordionContent>
						<CardContent className="pt-0">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								{/* Asignatura */}
								<div>
									<span className="font-semibold text-muted-foreground">Asignatura:</span>

									<p className="mt-1">
                                        { sessionData.section.subject.id } - { sessionData.section.subject.name }
                                    </p>
								</div>

								{/* Profesor */}
								<div>
									<span className="font-semibold text-muted-foreground">Profesor:</span>

									<span className="mt-1">
                                        { sessionData.professor ? `${sessionData.professor?.id} - ${ sessionData.professor?.name }` : null }
                                    </span>
								</div>

								{/* Fecha */}
								<div>
									<span className="font-semibold text-muted-foreground">Fecha reservada:</span>

									<div className="mt-1">
                                        { tempoFormat( sessionData.date ) }

                                        <Badge variant="outline" className="font-mono">
											M{ sessionData.module.code } { sessionData.module.difference || '' }: { sessionData.module.startHour } - { sessionData.module.endHour } { sessionData.module.difference?? '' }
										</Badge>
                                    </div>
								</div>

								{/* Espacio */}
								<div>
									<span className="font-semibold text-muted-foreground">Espacio:</span>
									<p className="mt-1">{ sessionData.spaceId || '-' }</p>
								</div>

								{/* En Inglés */}
								<div>
									<span className="font-semibold text-muted-foreground mr-2">En Inglés:</span>
									{ sessionData.isEnglish ? (
										<Badge variant="default" className="bg-green-600">Sí</Badge>
									) : (
										<Badge variant="secondary">No</Badge>
									)}
								</div>

								{/* Fechas de Sección */}
								<div>
									<span className="font-semibold text-muted-foreground">Período de Sección:</span>
									<p className="mt-1">
										{ tempoFormat( sessionData.section.startDate ) } - { tempoFormat( sessionData.section.endDate ) }
									</p>
								</div>
							</div>
						</CardContent>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Card>
	);
}
