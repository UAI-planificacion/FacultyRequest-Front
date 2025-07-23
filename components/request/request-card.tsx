'use client'

import {  Eye, User, BookOpen, Trash, Pencil } from "lucide-react";

import { useQueryClient } from '@tanstack/react-query';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                       from "@/components/ui/card";
import { Badge }        from "@/components/ui/badge";
import { Button }       from "@/components/ui/button";
import { ShowStatus }   from "@/components/shared/status";
import { ShowDate }     from "@/components/shared/date";
import { Consecutive }  from "@/components/shared/consecutive";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { type Request } from "@/types/request";
import { Role, Staff }  from "@/types/staff.model";


export interface RequestCardProps {
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
}: RequestCardProps ) {
    const queryClient   = useQueryClient();
    const staff         = queryClient.getQueryData<Staff>([ KEY_QUERYS.STAFF ]);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="space-y-1.5">
                    <CardTitle className="text-md font-medium max-w-full">{ request.title }</CardTitle>

                    <p className="text-[11px] text-muted-foreground">{ request.id }</p>

                    <div className="flex items-center gap-2">
                        <ShowStatus status={ request.status } />

                        <Consecutive isConsecutive={ request.isConsecutive } />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium max-w-full truncate overflow-hidden whitespace-nowrap">{request.subject.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="max-w-full truncate overflow-hidden whitespace-nowrap">{request.staffCreate.name}</span>
                    </div>

                    <ShowDate date={request.createdAt} />
                </div>

                {request.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 truncate">{request.description}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                    <Badge variant="secondary">
                        {request.totalDetails} detalle{request.totalDetails !== 1 ? "s" : ""}
                    </Badge>

                    <div className="flex items-center gap-2">
                        { staff?.role !== Role.VIEWER && <>
                            <Button size="sm" onClick={() => onEdit( request )} className="flex items-center gap-1" variant="outline">
                                <Pencil className="h-4 w-4 text-blue-500" />
                            </Button>

                            <Button size="sm" onClick={() => onDelete( request )} className="flex items-center gap-1" variant="outline">
                                <Trash className="h-4 w-4 text-red-500" />
                            </Button></>
                        }

                        <Button size="sm" onClick={() => onViewDetails( request )} className="flex items-center gap-1" variant="secondary">
                            <Eye className="h-4 w-4" />
                            Ver detalles
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
