import { useCallback, useEffect, useState } from "react";
import { MaterialContext } from "./MaterialContext";
import { materialsService } from "../../services/materialsService";

export const MaterialProvider = ({ children }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadMaterials = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setMaterials([]);
            return;
        }

        try {
            setLoading(true);
            const response = await materialsService.findAllMaterials();
            setMaterials(response || []);
        } catch (error) {
            console.error("Error cargando materiales", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMaterials();
    }, [loadMaterials]);

    return (
        <MaterialContext.Provider value={{ materials, loading, loadMaterials }}>
            {children}
        </MaterialContext.Provider>
    );
};
