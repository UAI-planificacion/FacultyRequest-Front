"use client"

import { JSX } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
}                               from "@/components/ui/table";
import { Card, CardContent }    from "@/components/ui/card";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { Badge }                from "@/components/ui/badge";
import { Skeleton }             from "@/components/ui/skeleton";
import { ActionButton }         from "@/components/shared/action";

import type { RequestDetail }   from "@/types/request-detail.model";
import type { Module }          from "@/types/request";
import type { Professor }       from "@/types/professor";
import { getSpaceType }         from "@/lib/utils";


interface RequestDetailTableProps {
    data                : RequestDetail[] | undefined;
    isLoading           : boolean;
    onEdit              : ( detail: RequestDetail ) => void;
    onDelete            : ( detail: RequestDetail ) => void;
    professors          : Professor[];
    isLoadingProfessors : boolean;
    isErrorProfessors   : boolean;
    modules             : Module[];
    isLoadingModules    : boolean;
    isErrorModules      : boolean;
}


function TableRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-6 w-12" /></TableCell>
            <TableCell><Skeleton className="h-6 w-12" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </TableCell>
        </TableRow>
    );
}

export function RequestDetailTable({
    data,
    isLoading,
    onEdit,
    onDelete,
    professors,
    isLoadingProfessors,
    isErrorProfessors,
    modules,
    isLoadingModules,
    isErrorModules,
}: RequestDetailTableProps): JSX.Element {
    const getProfessorName = (professorId: string | null): string => {
        if ( !professorId || isLoadingProfessors || isErrorProfessors ) return "-";

        const professor = professors.find( p => p.id === professorId );

        return professor?.name || "-";
    };


    const getSpaceDisplay = (detail: RequestDetail): string => {
        if ( detail.spaceId ) return detail.spaceId;
        if ( detail.spaceType ) return getSpaceType( detail.spaceType ) || detail.spaceType;
        if ( detail.spaceSize ) return detail.spaceSize;

        return "-";
    };


    const getCapacityRange = (minimum: number | null, maximum: number | null): string => {
        if ( minimum  && maximum ) return `${minimum} - ${maximum}`;
        if ( minimum ) return `${minimum}+`;
        if ( maximum ) return `≤ ${maximum}`;
        return "-";
    };

    return (
        <Card>
            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-768px)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Capacidad</TableHead>
                                <TableHead>Espacio</TableHead>
                                <TableHead>Centro de Costo</TableHead>
                                <TableHead>Tarde</TableHead>
                                <TableHead>Prioridad</TableHead>
                                <TableHead>Grado</TableHead>
                                <TableHead>Profesor</TableHead>
                                <TableHead>Creado por</TableHead>
                                <TableHead>Actualizado por</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRowSkeleton key={`skeleton-${index}`} />
                                ))
                            ) : data && data.length > 0 ? (
                                    data.map((detail) => (
                                        <TableRow key={detail.id}>
                                            <TableCell className="font-medium">
                                                { detail.minimum && detail.maximum
                                                    ? getCapacityRange(detail.minimum , detail.maximum)
                                                    : "-"
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {getSpaceDisplay(detail)}
                                            </TableCell>

                                            <TableCell>
                                                {detail.costCenterId || "-"}
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant={detail.inAfternoon ? "default" : "secondary"}>
                                                    {detail.inAfternoon ? "Sí" : "No"}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant={detail.isPriority ? "destructive" : "default"}>
                                                    {detail.isPriority ? "Restrictivo" : "No Restrictivo"}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                {detail.grade?.name || "-"}
                                            </TableCell>

                                            <TableCell>
                                                { detail.professorId 
                                                    ? getProfessorName(detail.professorId)
                                                    : "-"
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">{detail.staffCreate.name}</div>
                                                    <div className="text-xs text-muted-foreground">{detail.staffCreate.email}</div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {detail.staffUpdate ? (
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-sm">{detail.staffUpdate.name}</div>
                                                        <div className="text-xs text-muted-foreground">{detail.staffUpdate.email}</div>
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <ActionButton
                                                    editItem    = { () => onEdit( detail ) }
                                                    deleteItem  = { () => onDelete( detail )}
                                                    item        = { detail }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8">
                                        <p className="text-muted-foreground">No hay detalles para esta solicitud.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
