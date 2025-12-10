'use client'

import { JSX } from "react"

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
}												from "@/components/ui/accordion";
import { Card, CardContent, CardHeader }		from "@/components/ui/card";
import { Badge }								from "@/components/ui/badge";
import { SessionShort }							from "@/components/session/session-short";

import { RequestSection }	from "@/types/request";
import { Session }			from "@/types/section.model";
import { getSpaceType, tempoFormat }		from "@/lib/utils";


interface Props {
	section		: RequestSection;
}


/**
 * RequestSectionInfo Component
 * 
 * Muestra la información completa de una sección en un Accordion colapsable.
 * Por defecto está cerrado para no ser invasivo en el formulario.
 */
export function RequestSectionInfo({ section }: Props ): JSX.Element {
	return (
		<Card className="border-muted">
			<Accordion type="single" collapsible>
				<AccordionItem value="section-info" className="border-none">
					<CardHeader className="">
						<AccordionTrigger className="hover:no-underline py-0">
							<div className="flex items-center gap-2">
								<h3 className="text-base font-semibold">
									Información de la Sección
								</h3>

								<Badge className="ml-2">
									SSEC {section.subject.id}-{section.code}
								</Badge>

								{ section.isClosed && (
									<Badge variant="destructive">
										Cerrada
									</Badge>
								)}
							</div>
						</AccordionTrigger>
					</CardHeader>

					<AccordionContent>
						<CardContent className="space-y-4">
							{/* Información General */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Asignatura */}
								<div>
									<p className="text-sm font-medium text-muted-foreground">Asignatura</p>
									<p className="text-sm font-semibold">
										{String( section.subject?.id || '' )} - {String( section.subject?.name || '' )}
									</p>
								</div>

								{/* Profesor */}
								<div>
									<p className="text-sm font-medium text-muted-foreground">Profesor</p>
									<p className="text-sm font-semibold">
										{String( section.professor?.id || '' )} - {String( section.professor?.name || '' )}
									</p>
								</div>

								{/* Período */}
								<div>
									<p className="text-sm font-medium text-muted-foreground">Período</p>

									<p className="text-sm font-semibold flex items-center">
                                        {section.period.name }

										<span className="text-xs text-muted-foreground">
                                            {section.period.startDate && section.period.endDate && (
                                                `${tempoFormat( section.period.startDate )} - ${tempoFormat( section.period.endDate )}`
                                            )}
                                        </span>
                                    </p>
								</div>

								{/* Fechas de la Sección */}
								<div>
									<p className="text-sm font-medium text-muted-foreground">Fechas de la Sección</p>
									<p className="text-sm font-semibold">
										{section.startDate ? tempoFormat( section.startDate ) : '-'} - {section.endDate ? tempoFormat( section.endDate ) : '-'}
									</p>
								</div>

								{/* Edificio */}
								{ section.building && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Edificio</p>
										<p className="text-sm font-semibold">{String( section.building )}</p>
									</div>
								)}

								{/* Tipo de Espacio */}
								<div>
									<p className="text-sm font-medium text-muted-foreground">Detalle de Espacio</p>

									<p className="text-sm font-semibold">
                                        <span className="mr-2">
                                            {section.spaceType ?  getSpaceType(section.spaceType) : '-'}
                                        </span>
                                        { section.spaceSizeId && ( section.spaceSizeId )}
                                    </p>
								</div>

								

                                {/* Tipos de Sesión */}
							<div className="flex gap-2">
                                <div>

								<p className="text-sm font-medium text-muted-foreground mb-2">Tipos de Sesión</p>
								<SessionShort
									sessionCounts = {{
                                        [Session.C]	: section.lecture,
										[Session.A]	: section.tutoringSession,
										[Session.T]	: section.workshop,
										[Session.L]	: section.laboratory,
									}}
                                    />
                                    </div>

                                {/* Cantidad de Sesiones */}
								<div className="space-y-2">
									<p className="text-sm font-medium text-muted-foreground">Total</p>
                                    <Badge>
                                        {section.countSessions.sessions}
                                    </Badge>
								</div>
							</div>
							</div>
						</CardContent>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Card>
	);
}
