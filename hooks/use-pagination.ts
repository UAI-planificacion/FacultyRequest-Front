import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
    data: T[];
    initialItemsPerPage?: number;
}

interface UsePaginationReturn<T> {
    currentPage         : number;
    itemsPerPage        : number;
    totalItems          : number;
    totalPages          : number;
    startIndex          : number;
    endIndex            : number;
    paginatedData       : T[];
    setCurrentPage      : ( page: number ) => void;
    setItemsPerPage     : ( itemsPerPage: number ) => void;
    resetToFirstPage    : () => void;
}

export function usePagination<T>({
    data,
    initialItemsPerPage = 10
}: UsePaginationProps<T>): UsePaginationReturn<T> {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

    const paginationData = useMemo(() => {
        const totalItems    = data.length;
        const totalPages    = Math.ceil( totalItems / itemsPerPage );
        const startIndex    = ( currentPage - 1 ) * itemsPerPage;
        const endIndex      = startIndex + itemsPerPage;
        const paginatedData = data.slice( startIndex, endIndex );

        return {
            totalItems,
            totalPages,
            startIndex,
            endIndex,
            paginatedData
        };
    }, [data, currentPage, itemsPerPage]);

    function setItemsPerPage( newItemsPerPage: number ): void {
        setItemsPerPageState( newItemsPerPage );
        setCurrentPage( 1 );
    };

    const resetToFirstPage = () => {
        setCurrentPage( 1 );
    };

    return {
        currentPage,
        itemsPerPage,
        totalItems: paginationData.totalItems,
        totalPages: paginationData.totalPages,
        startIndex: paginationData.startIndex,
        endIndex: paginationData.endIndex,
        paginatedData: paginationData.paginatedData,
        setCurrentPage,
        setItemsPerPage,
        resetToFirstPage
    };
}
