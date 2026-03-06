import { useCallback, useState } from "react";
import { DetailsContext } from "./DetailsContext";
import { DetailsService } from "../../services/detailsService";

export const DetailsProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [details, setDetails] = useState([]);

    const clearError = useCallback(() => setError(null), []);

    const loadAllDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await DetailsService.findAllDetails();
            setDetails(Array.isArray(data) ? data : []);
            return data;
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const createDetail = useCallback(async (detail) => {
        try {
            setLoading(true);
            setError(null);
            return await DetailsService.create(detail);
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const createManyDetails = useCallback(async (detailsArray) => {
        // Implementación simple: POST de uno en uno.
        // Si luego el backend soporta batch, se cambia en DetailsService.
        const safe = Array.isArray(detailsArray) ? detailsArray : [];
        const results = [];
        for (const d of safe) {
            // eslint-disable-next-line no-await-in-loop
            results.push(await createDetail(d));
        }
        return results;
    }, [createDetail]);

    return (
        <DetailsContext.Provider
            value={{
                loading,
                error,
                clearError,
                details,
                setDetails,
                loadAllDetails,
                createDetail,
                createManyDetails,
            }}
        >
            {children}
        </DetailsContext.Provider>
    );
};

