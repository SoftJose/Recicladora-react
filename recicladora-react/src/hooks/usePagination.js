import { useState, useMemo, useEffect } from "react";

export const usePagination = (data, itemsPerPage = 5) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = Array.isArray(data) ? data.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        const startIndex = (currentPage - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    const goToPage = (page) => {
        const p = Number(page);
        if (!Number.isFinite(p)) return;

        const clamped = Math.min(Math.max(p, 1), totalPages);
        setCurrentPage(clamped);
    };

    return {
        currentPage,
        totalPages,
        paginatedData,
        goToPage,
        nextPage: () => goToPage(currentPage + 1),
        prevPage: () => goToPage(currentPage - 1),
        resetPage: () => setCurrentPage(1),
        totalItems,
        itemsPerPage,
    };
};