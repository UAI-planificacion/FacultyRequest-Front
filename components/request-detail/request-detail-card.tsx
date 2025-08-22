'use client'

import { JSX, useMemo } from "react";

import {
    Edit,
    Trash2,
    User,
    Users,
    Building2,
    Proportions,
    Armchair,
    Cuboid,
    Clock,
    Eye,
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
}                   from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";

import { getSpaceType }     from "@/lib/utils";
import { Professor }        from "@/types/professor";
import { Role, Staff }      from "@/types/staff.model";
import { RequestDetail }    from "@/types/request-detail.model";
import type { Module }      from "@/types/request";
import LoaderMini           from "@/icons/LoaderMini";
import { daysName }         from "@/consts/days-names";


export interface RequestDetailCardProps {
    detail                  : RequestDetail;
    onEdit                  : ( detail: RequestDetail ) => void;
    onDelete                : ( detail: RequestDetail ) => void;
    professors              : Professor[];
    isLoadingProfessors     : boolean;
    isErrorProfessors       : boolean;
    modules                 : Module[];
    isLoadingModules        : boolean;
    isErrorModules          : boolean;
    staff                  : Staff | undefined;
}


export function RequestDetailCard({
    detail,
    onEdit,
    onDelete,
    professors,
    isLoadingProfessors,
    isErrorProfessors,
    modules,
    isLoadingModules,
    isErrorModules,
    staff
}: RequestDetailCardProps ): JSX.Element {
    const isReadOnly = staff?.role !== Role.VIEWER;

    const memoizedProfessorName = useMemo(() => {
        return professors
            .find( professor => professor.id === detail.professorId )?.name;
    }, [professors, detail.professorId]);


    const memoizedDays = useMemo(() => {
        const daysRecord: Record<string, string> = {};

        detail.moduleDays.forEach( moduleDay => {
            if ( !daysRecord[ moduleDay.day ]) {
                daysRecord[ moduleDay.day ] = daysName[ Number( moduleDay.day ) - 1 ];
            }
        });

        return daysRecord;
    }, [detail.moduleDays]);

    const memoizedModules = useMemo(() => {
        const modulesRecord: Record<string, string> = {};

        detail.moduleDays.forEach(moduleDay => {
            const module = modules.find( m => m.id.toString() === moduleDay.moduleId.toString() );

            if ( module && !modulesRecord[moduleDay.moduleId ]) {
                modulesRecord[moduleDay.moduleId] = `${module.startHour}-${module.endHour}`;
            }
        });

        return modulesRecord;
    }, [modules, detail.moduleDays]);


    return (
        <Card className="relative">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">ID {detail.id}</CardTitle>

                        <div className="flex gap-1">
                            <Button
                                variant = "outline"
                                size    = "sm"
                                onClick = { () => onEdit( detail )}
                            >
                                { isReadOnly
                                    ? <Edit className="h-4 w-4" />
                                    : <Eye className="h-4 w-4" />
                                }
                            </Button>

                            { isReadOnly && (
                                <Button
                                    variant     = "outline"
                                    size        = "sm"
                                    onClick     = { () => onDelete( detail )}
                                    className   = "text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    {detail.minimum && detail.maximum && (
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />

                            <span>
                                {detail.minimum}-{detail.maximum}
                            </span>
                        </div>
                    )}

                    {detail.spaceId && (
                        <div className="flex items-center gap-1">
                            <Cuboid className="h-4 w-4 text-muted-foreground" />

                            <span>
                                {detail.spaceId}
                            </span>
                        </div>
                    )}

                    {detail.spaceType && (
                        <div className="flex items-center gap-1">
                            <Armchair className="h-4 w-4 text-muted-foreground" />

                            <span>{getSpaceType( detail.spaceType )}</span>
                        </div>
                    )}

                    {detail.building && (
                        <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />

                            <span>{detail.building}</span>
                        </div>
                    )}

                    {detail.spaceSize && (
                        <div className="flex items-center gap-1">
                            <Proportions className="h-4 w-4 text-muted-foreground" />
                            <span>{detail.spaceSize}</span>
                        </div>
                    )}

                    { isLoadingProfessors && !isErrorProfessors
                        ? <LoaderMini />
                        : detail.professorId &&
                            <div className="flex items-center gap-1 text-xs">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{memoizedProfessorName}</span>
                            </div>
                    }
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant={detail.isPriority ? "destructive" : "default"} className="text-xs">
                        {detail.isPriority ? "Restrictivo" : "No restrictivo"}
                    </Badge>

                    {detail.grade && (
                        <Badge variant="default" className="text-xs">
                            {detail.grade.name}
                        </Badge>
                    )}

                    {detail.inAfternoon && (
                        <Badge variant="default" className="text-xs">
                            Tarde
                        </Badge>
                    )}

                    {detail.costCenterId && (
                        <Badge variant="default" className="text-xs">
                            {detail.costCenterId}
                        </Badge>
                    )}
                </div>

                {detail.moduleDays.length > 0 && (
                    <div className="space-y-2 items-center gap-2">
                        <div className="flex items-start gap-2">
                            <p className="text-xs font-medium text-muted-foreground">Días:</p>

                            <div className="flex flex-wrap gap-1">
                                {Object.entries(memoizedDays).map(([dayId, dayName]) => (
                                    <Badge key={dayId} variant="outline" className="text-xs border border-zinc-300 dark:border-zinc-700">
                                        {dayName}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <p className="text-xs font-medium text-muted-foreground">Horarios:</p>

                            <div className="flex flex-wrap gap-1">
                                {Object.entries(memoizedModules).map(([moduleId, moduleTime]) => (
                                    <Badge key={moduleId} variant="outline" className="text-xs border border-zinc-300 dark:border-zinc-700">
                                        {moduleTime}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {detail.description && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Descripción:</p>

                        <p className="text-xs text-muted-foreground mt-1">{detail.description}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
