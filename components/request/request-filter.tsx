'use client'

import { JSX } from "react";

import { Search, Plus } from "lucide-react";

import { Card,  CardContent }   from "@/components/ui/card";
import { Button }               from "@/components/ui/button";
import { Input }                from "@/components/ui/input";
import { Label }                from "@/components/ui/label";
import { ViewMode }             from "@/components/shared/view-mode";
import { ChangeStatus }         from "@/components/shared/change-status";
import { SectionSelect }        from "@/components/shared/item-select/section-select";

import { Status }       from "@/types/request";
import { Role }         from "@/types/staff.model";
import { useSession }   from "@/hooks/use-session";
import { KEY_QUERYS }   from "@/consts/key-queries";


export interface RequestFilter {
    title               : string;
    setTitle            : ( title: string ) => void;
    onNewRequest        : () => void;
    statusFilter        : Status[];
    setStatusFilter     : ( statusFilter: Status[] ) => void;
    sectionFilter       : string[];
    setSectionFilter    : ( sectionFilter: string[] ) => void;
    viewMode            : ViewMode;
    setViewMode         : ( viewMode: ViewMode ) => void;
}


export function RequestFilter({
    title,
    setTitle,
    onNewRequest,
    statusFilter,
    setStatusFilter,
    sectionFilter,
    setSectionFilter,
    viewMode,
    setViewMode,
}: RequestFilter ): JSX.Element {
    const { staff } = useSession();

    return (
        <Card>
            <CardContent className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
                {/* Search Input */}
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

                {/* Status Filter */}
                <div className="space-y-2 md:col-span-2 xl:col-span-2">
                    <Label>Estado</Label>

                    <ChangeStatus
                        multiple        = { true }
                        value           = { statusFilter }
                        onValueChange   = { setStatusFilter }
                    />
                </div>

                {/* Section Filter */}
                <div className="space-y-2">
                    <SectionSelect
                        label               = "Sección"
                        multiple            = { true }
                        defaultValues       = { sectionFilter }
                        onSelectionChange   = {( value ) => setSectionFilter(( value as string[] ) || [] )}
                        placeholder         = "Seleccionar secciones"
                        queryKey            = {[ KEY_QUERYS.SECTIONS ]}
                        url                 = { KEY_QUERYS.SECTIONS }
                    />
                </div>

                {/* View Mode and Create Button */}
                <div className="flex items-end gap-2 lg:gap-3 justify-end">
                    <ViewMode
                        viewMode        = { viewMode }
                        onViewChange    = { setViewMode }
                    />

                    { staff?.role !== Role.VIEWER &&
                        <Button
                            onClick = { onNewRequest }
                            size    = "icon"
                            title   = "Crear Solicitud"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    }
                </div>
            </CardContent>
        </Card>
    );
}
