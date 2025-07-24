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

import {
    getLevelName,
    getSpaceType
}                           from "@/lib/utils";
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


    const memoizedModuleName = useMemo(() => {
        const module = modules.find( module => module.id.toString() === detail.moduleId );

        if ( !module ) return '';

        return `${module.startHour}-${module.endHour}`;
    }, [modules, detail.moduleId]);


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

                    { isLoadingModules && !isErrorModules
                        ? <LoaderMini />
                        : detail.moduleId &&
                            <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-4 w-4 text-muted-foreground" />

                                <span>{memoizedModuleName}</span>
                            </div>
                    }
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant={detail.isPriority ? "destructive" : "default"} className="text-xs">
                        {detail.isPriority ? "Con Prioridad" : "Sin Prioridad"}
                    </Badge>

                    <Badge variant="default" className="text-xs">
                        {getLevelName(detail.level)}
                    </Badge>

                    {detail.inAfternoon && (
                        <Badge variant="default" className="text-xs">
                            Tarde
                        </Badge>
                    )}
                </div>

                {( detail.days?.length ?? 0 ) > 0 && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Días:</p>

                        <div className="flex flex-wrap gap-1 mt-1">
                            {detail.days?.map((day, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {daysName[Number(day) - 1]}
                                </Badge>
                            ))}
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
