'use client'

import { JSX } from "react";

import { Search, Plus } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select";
import {
    Card,
    CardContent
}                   from "@/components/ui/card";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { ViewMode } from "@/components/shared/view-mode";

import { Status }       from "@/types/request";
import { Role, Staff }  from "@/types/staff.model";
import { cn }           from "@/lib/utils";
import { useSession } from "@/hooks/use-session";


export interface RequestFilter {
    title                   : string;
    setTitle                : ( title: string ) => void;
    // setOpen                 : ( ) => void;
    onNewRequest            : () => void;

    statusFilter            : Status | "ALL";
    setStatusFilter         : ( statusFilter: Status | "ALL" ) => void;
    consecutiveFilter       : "ALL" | "TRUE" | "FALSE";
    setConsecutiveFilter    : ( consecutiveFilter: "ALL" | "TRUE" | "FALSE" ) => void;
    // sortBy                  : "status" | "staffCreate" | "staffUpdate" | "subjectId" | "createdAt";
    // setSortBy               : ( sortBy: "status" | "staffCreate" | "staffUpdate" | "subjectId" | "createdAt" ) => void;
    sortBy                  : "title" | "consecutive" | "updatedAt";
    setSortBy               : ( sortBy: "title" | "consecutive" | "updatedAt" ) => void;
    sortOrder               : "asc" | "desc";
    setSortOrder            : ( sortOrder: "asc" | "desc" ) => void;
    // staff                   : Staff | undefined;
    viewMode                : ViewMode,
    setViewMode             : ( viewMode: ViewMode ) => void;
}


export function RequestFilter({
    title,
    setTitle,
    // setOpen,
    onNewRequest,
    statusFilter,
    setStatusFilter,
    consecutiveFilter,
    setConsecutiveFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    // staff,
    viewMode,
    setViewMode,
}: RequestFilter ): JSX.Element {
    const { staff } = useSession();

    return (
        <Card>
            <CardContent>
                <div className={cn(
                    "grid items-end lg:flex lg:justify-between",
                    staff?.role !== Role.VIEWER ? 'gap-0 lg:gap-4' : "gap-4"
                )}>
                    <div className={cn(
                        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 items-end",
                        staff?.role !== Role.VIEWER ? "lg:w-[80%]" : "w-full"
                    )}>
                        <div className="space-y-2">
                            <Label htmlFor="search">Buscar por Título</Label>

                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

                                <Input
                                    id          = "search"
                                    placeholder = "Título de solicitud..."
                                    value       = { title }
                                    onChange    = {( e ) => setTitle( e.target.value )}
                                    className   = "pl-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado</Label>

                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | "ALL")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value={Status.PENDING}>Pendiente</SelectItem>
                                    <SelectItem value={Status.APPROVED}>Aprobado</SelectItem>
                                    <SelectItem value={Status.REJECTED}>Rechazado</SelectItem>
                                    <SelectItem value={Status.REVIEWING}>En Revisión</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Consecutivo</Label>

                            <Select
                                value={consecutiveFilter}
                                onValueChange={( value ) => setConsecutiveFilter( value as "ALL" | "TRUE" | "FALSE" )}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="TRUE">Sí</SelectItem>
                                    <SelectItem value="FALSE">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Ordenar por</Label>

                            <div className="flex gap-2">
                                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="createdAt">Fecha</SelectItem>
                                        <SelectItem value="status">Estado</SelectItem>
                                        <SelectItem value="staffCreate">Creador</SelectItem>
                                        <SelectItem value="staffUpdate">Actualizador</SelectItem>
                                        <SelectItem value="subjectId">Asignatura</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant = "outline"
                                    size    = "sm"
                                    onClick = {() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end gap-2 sm:gap-4 justify-end">
                        <ViewMode
                            viewMode        = { viewMode }
                            onViewChange    = { setViewMode }
                        />

                        { staff?.role !== Role.VIEWER &&
                            <Button
                                onClick     = { onNewRequest }
                                className   = "mt-5"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Solicitud
                            </Button>
                        }
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
