'use client'

import { JSX } from "react";

import {
    ArrowLeft,
    User,
    BookOpen,
    CalendarRange,
    SquareLibrary,
    Building,
    CalendarDays,
    Proportions,
    Cuboid,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
}                       from "@/components/ui/card";

import {
    SessionShort,
    getSessionCounts
}                       from "@/components/session/session-short";
import { Button }       from "@/components/ui/button";
import { ShowStatus }   from "@/components/shared/status";
import { ShowDate }     from "@/components/shared/date";

import { type Request }                 from "@/types/request";
import { getSpaceType, tempoFormat }    from "@/lib/utils";


interface Props {
    request : Request;
    onBack  : () => void;
}


export function RequestInfoCard({
    request,
    onBack
}: Props ): JSX.Element {
    return (
        <Card>
            <CardHeader>
                <div className="grid gap-2 sm:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant = "secondary"
                            size    = "sm"
                            onClick = { onBack }
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex flex-col space-y-0.5">
                            <CardTitle>{ request.title }</CardTitle>

                            <span className="text-[11px] text-muted-foreground">{ request.id }</span>
                        </div>
                    </div>

                    <ShowStatus status={ request.status } />
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Offer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">SSEC</span>

                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                { request.section.subject.id }-{ request.section.code }
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Periodo</span>

                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />

                            <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                { request.section.period.id } - { request.section.period.name }
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Sessiones</span>

                        <div className="flex items-center gap-2">
                            <SquareLibrary className="h-4 w-4 text-muted-foreground" />

                            <SessionShort 
                                showZero        = { true }
                                sessionCounts   = { getSessionCounts({
                                    C: request.section.lecture,
                                    A: request.section.tutoringSession,
                                    T: request.section.workshop,
                                    L: request.section.laboratory 
                                })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Edificio</span>

                        <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />

                            <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                { request.section.building || '-' }
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Detalle Espacio</span>

                        <div className="flex items-center gap-2">
                            { request.section.spaceType
                                ?<>
                                    <Cuboid className="h-4 w-4 text-muted-foreground" />

                                    <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                        {getSpaceType( request.section.spaceType )}
                                    </span>
                                </>

                                : request.section.spaceSizeId 
                                    ? <>
                                        <Proportions className="h-4 w-4 text-muted-foreground" />

                                        <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                            {request.section.spaceSizeId}
                                        </span>
                                    </>
                                    : "-"
                            }
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Fechas</span>

                        <div className="flex items-center gap-2">

                            <CalendarRange className="h-4 w-4 text-muted-foreground" />

                            <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                { tempoFormat( request.section.startDate )} - {tempoFormat( request.section.endDate )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Created By */}
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Creado por</span>

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />

                            <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                { request.staffCreate.name }
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Creado el</span>

                        <ShowDate date={ request.createdAt } />
                    </div>

                    {/* Updated By */}
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Actualizado por</span>

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />

                            <span>{ request.staffUpdate?.name || "-" }</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Actualizado el</span>

                        <ShowDate date={ request.updatedAt } />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
