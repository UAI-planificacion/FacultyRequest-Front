import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

/**
 * Componente de esqueleto para una fila individual de la tabla de asignaturas
 */
export function SubjectRowSkeleton() {
    return (
        <TableRow>
            {/* Código */}
            <TableCell className="w-[120px]">
                <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
            </TableCell>

            {/* Nombre */}
            <TableCell className="w-[250px]">
                <div className="h-4 w-40 bg-gray-300 rounded animate-pulse" />
            </TableCell>

            {/* Fecha Inicio */}
            <TableCell className="w-[140px]">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
            </TableCell>

            {/* Fecha Fin */}
            <TableCell className="w-[140px]">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
            </TableCell>

            {/* Alumnos */}
            <TableCell className="text-right w-[100px]">
                <div className="h-4 w-8 bg-gray-300 rounded animate-pulse ml-auto" />
            </TableCell>

            {/* Centro de Costo */}
            <TableCell className="w-[150px]">
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
            </TableCell>

            {/* Acciones */}
            <TableCell className="text-right w-[120px]">
                <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
                </div>
            </TableCell>
        </TableRow>
    );
}

interface StaffTableSkeletonProps {
    rows?: number;
}
/**
 * Componente de esqueleto para la tabla de asignaturas durante la carga
 */
export function SubjectTableSkeleton({ rows = 5}: StaffTableSkeletonProps ) {
    return (
        <ScrollArea className="h-[calc(100vh-600px)]">
            <Table>
                <TableBody>
                    {Array.from({ length: rows }).map((_, index) => (
                        <SubjectRowSkeleton key={index} />
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}

/**
 * Componente para mostrar mensaje de error
 */
export function SubjectErrorMessage() {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
                Error al cargar las asignaturas
            </h3>
            <p className="text-muted-foreground">
                Hubo un problema al obtener la información de las asignaturas. 
                Por favor, intenta recargar la página.
            </p>
        </div>
    );
}