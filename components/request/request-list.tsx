"use client"

import { JSX } from "react";

import {
    RequestCardSkeletonGrid,
    RequestErrorCard
}                               from "@/components/request/request-card-skeleton";
import { Card, CardContent }    from "@/components/ui/card";
import { RequestCard }          from "@/components/request/request-card";

import { type Request }     from "@/types/request";


interface RequestListProps {
    requests        : Request[];
    onViewDetails   : ( request: Request ) => void;
    onEdit          : ( request: Request ) => void;
    onDelete        : ( request: Request ) => void;
    isLoading       : boolean;
    isError         : boolean;
}


export function RequestList({
    requests,
    onViewDetails,
    onEdit,
    onDelete,
    isLoading,
    isError,
}: RequestListProps ): JSX.Element {
    if ( isLoading ) {
        return <RequestCardSkeletonGrid count={6} />;
    }

    if ( isError ) {
        return <RequestErrorCard />;
    }

    if ( requests.length === 0 ) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron solicitudes.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map( request => (
                <RequestCard
                    request         = { request }
                    key             = { request.id }
                    onViewDetails   = { () => onViewDetails( request )}
                    onEdit          = { () => onEdit( request )}
                    onDelete        = { () => onDelete( request )}
                />
            ))}
        </div>
    );
}
