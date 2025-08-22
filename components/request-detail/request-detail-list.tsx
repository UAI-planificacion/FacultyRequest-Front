"use client"

import { JSX } from "react";

import { Card, CardContent }            from "@/components/ui/card";
import { RequestDetailCard }            from "@/components/request-detail/request-detail-card";
import { RequestDetailCardSkeleton }    from "@/components/request-detail/request-detail-card-skeleton";

import type { RequestDetail }   from "@/types/request-detail.model";
import type { Module }          from "@/types/request";
import type { Professor }       from "@/types/professor";
import { Staff }                from "@/types/staff.model";


interface RequestDetailListProps {
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
    staff               : Staff | undefined;
}


export function RequestDetailList({
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
    staff
}: RequestDetailListProps ): JSX.Element {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <RequestDetailCardSkeleton key={`skeleton-${index}`} />
                ))
            ) : (
                data?.map(detail => (
                    <RequestDetailCard
                        key                 = { detail.id }
                        detail              = { detail }
                        onEdit              = { onEdit }
                        onDelete            = { onDelete }
                        professors          = { professors }
                        isLoadingProfessors = { isLoadingProfessors }
                        isErrorProfessors   = { isErrorProfessors }
                        modules             = { modules }
                        isLoadingModules    = { isLoadingModules }
                        isErrorModules      = { isErrorModules }
                        staff               = { staff }
                    />
                ))
            )}

            {!isLoading && data?.length === 0 && (
                <div className="col-span-full">
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-muted-foreground">No hay detalles para esta solicitud.</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
