'use client'

import { JSX } from "react";

import {
    Eye,
    User,
    BookOpen,
    CalendarDays,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                       from "@/components/ui/card";
import { Button }       from "@/components/ui/button";
import { ShowStatus }   from "@/components/shared/status";
import { ShowDate }     from "@/components/shared/date";
import { ActionButton } from "@/components/shared/action";

import { type Request } from "@/types/request";


export interface Props {
    request         : Request;
    onViewDetails   : ( request: Request ) => void;
    onEdit          : ( request: Request ) => void;
    onDelete        : ( request: Request ) => void;
}


export function RequestCard({
    request,
    onViewDetails,
    onEdit,
    onDelete
}: Props ): JSX.Element {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="space-y-2">
                    <CardTitle className="text-md font-medium max-w-full">
                        { request.title }
                        <p className="text-[11px] text-muted-foreground">{ request.id }</p>
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <ShowStatus status={ request.status } />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />

                        <span className="font-medium max-w-full truncate overflow-hidden whitespace-nowrap">
                            { request.section.subject.id }-{ request.section.code }
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />

                        <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                            { request.section.period.id }-{ request.section.period.name } { new Date( request.section.startDate ).toLocaleDateString( 'es-CL' )} - { new Date( request.section.endDate ).toLocaleDateString( 'es-CL' )}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />

                        <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                            { request.staffCreate.name }
                        </span>
                    </div>

                    <ShowDate date={ request.createdAt } />
                </div>

                <div className="flex items-center gap-2 justify-end">
                    <ActionButton
                        item        = { request }
                        editItem    = { onEdit }
                        deleteItem  = { onDelete }
                    />

                    <Button
                        size        = "sm"
                        onClick     = { () => onViewDetails( request )}
                        className   = "flex items-center gap-1"
                        variant     = "secondary"
                    >
                        <Eye className="h-4 w-4 mt-0.5" />

                        { request.totalDetails } detalle{ request.totalDetails !== 1 ? "s" : "" }
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
