import { useContext } from "react";
import { DetailsContext } from "./DetailsContext";

export const useDetailsContext = () => {
    const ctx = useContext(DetailsContext);
    if (!ctx) throw new Error("useDetailsContext debe usarse dentro de DetailsProvider");
    return ctx;
};

