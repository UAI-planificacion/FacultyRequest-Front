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
}

export function DataPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: DataPaginationProps ) {
    const itemsPerPageOptions = [10, 15, 30, 50];

    if ( totalItems === 0 ) return null;

    return (
        <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page" className="text-sm font-medium hidden sm:inline">
                    Elementos por página
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
        </div>
    );
}
