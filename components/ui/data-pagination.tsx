"use client"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
}                   from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                   from "@/components/ui/select";
import { Label }    from "@/components/ui/label";

interface DataPaginationProps {
    currentPage             : number;
    totalPages              : number;
    totalItems              : number;
    itemsPerPage            : number;
    onPageChange            : ( page: number ) => void;
    onItemsPerPageChange    : ( itemsPerPage: number ) => void;
    startIndex              : number;
    endIndex                : number;
    className?              : string;
}

export function DataPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    startIndex,
    endIndex,
    className = ""
}: DataPaginationProps) {
    const itemsPerPageOptions = [10, 15, 30, 50];

    if ( totalItems === 0 ) return null;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Selector de elementos por página */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="items-per-page" className="text-sm font-medium">
                        Elementos por página:
                    </Label>

                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => onItemsPerPageChange(Number(value))}
                    >
                        <SelectTrigger id="items-per-page" className="w-20">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            {itemsPerPageOptions.map((option) => (
                                <SelectItem key={option} value={option.toString()}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Información de paginación */}
                <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} resultados
                </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) {
                                            onPageChange(currentPage - 1);
                                        }
                                    }}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>

                            {/* Páginas */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Mostrar solo algunas páginas alrededor de la actual
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onPageChange(page);
                                                }}
                                                isActive={currentPage === page}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}

                            <PaginationItem>
                                <PaginationNext 
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) {
                                            onPageChange(currentPage + 1);
                                        }
                                    }}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Información adicional de página */}
            {totalPages > 1 && (
                <div className="text-center text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                </div>
            )}
        </div>
    );
}
