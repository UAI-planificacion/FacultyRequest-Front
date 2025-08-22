'use client'

import { JSX } from "react";

import {
    ArrowLeft,
    User,
    BookOpen,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
}                       from "@/components/ui/card";
import { Button }       from "@/components/ui/button";
import { ShowStatus }   from "@/components/shared/status";
import { ShowDate }     from "@/components/shared/date";
import { Consecutive }  from "@/components/shared/consecutive";

import { type Request } from "@/types/request";


interface RequestInfoCardProps {
    request : Request;
    onBack  : () => void;
}

export function RequestInfoCard({ request, onBack }: RequestInfoCardProps ): JSX.Element {
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

                        <div className="flex flex-col space-y-1">
                            <CardTitle>{request.title}</CardTitle>
                            <p className="text-[11px] text-muted-foreground">{request.id}</p>
                        </div>
                    </div>

                    <div className="flex sm:grid gap-2 justify-end end-1">
                        <ShowStatus status={request.status} />

                        <Consecutive isConsecutive={request.isConsecutive} />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Created By */}
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Creado por</p>

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="max-w-full truncate overflow-hidden whitespace-nowrap">{request.staffCreate.name}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Creado el</p>
                        <ShowDate date={request.createdAt} />
                    </div>

                    {/* Updated By */}
                    {request.staffUpdate && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Actualizado por</p>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <p>{request.staffUpdate.name}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Actualizado el</p>
                        <ShowDate date={request.updatedAt} />
                    </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Asignatura</p>

                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <p className="max-w-full truncate overflow-hidden whitespace-nowrap">{ request.subject.id }-{ request.subject.name }</p>
                    </div>
                </div>

                {/* Description and Comments */}
                { request.description && (
                    <div className="pt-2 border-t space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">
                            Descripción
                        </span>

                        <p className="text-sm whitespace-pre-line">
                            { request.description }
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
