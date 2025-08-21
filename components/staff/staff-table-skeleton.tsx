"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StaffTableSkeletonProps {
    rows?: number;
}

function StaffRowSkeleton() {
    return (
        <TableRow>
            {/* Nombre */}
            <TableCell className="font-medium w-[250px]">
                <div className="h-4 bg-muted rounded animate-pulse w-32" />
            </TableCell>

            {/* Rol */}
            <TableCell className="w-[150px]">
                <div className="h-6 bg-muted rounded-full animate-pulse w-20" />
            </TableCell>

            {/* Correo */}
            <TableCell className="w-[250px]">
                <div className="h-4 bg-muted rounded animate-pulse w-40" />
            </TableCell>

            {/* Activo */}
            <TableCell className="w-[120px]">
                <div className="h-6 bg-muted rounded-full animate-pulse w-16" />
            </TableCell>

            {/* Acciones */}
            <TableCell className="text-right w-[120px]">
                <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
            </TableCell>
        </TableRow>
    );
}

export function StaffTableSkeleton({ rows = 5 }: StaffTableSkeletonProps) {
    return (
        <ScrollArea className="h-[calc(100vh-600px)]">
            <Table>
                <TableBody>
                    {Array.from({ length: rows }).map((_, index) => (
                        <StaffRowSkeleton key={index} />
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}

export function StaffErrorMessage() {
    return (
        <div className="text-center p-8 text-muted-foreground">
            <div className="text-destructive">
                Ocurrió un error al obtener el personal, intente más tarde.
            </div>
        </div>
    );
}