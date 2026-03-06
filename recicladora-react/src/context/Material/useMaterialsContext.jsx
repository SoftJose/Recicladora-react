import { useContext } from "react";
import { MaterialContext } from "./MaterialContext";

export const useMaterialsContext = () => {
    const context = useContext(MaterialContext);

    if (!context) {
        throw new Error("useMaterialsContext debe usarse dentro de MaterialProvider");
    }

    return context;
};

