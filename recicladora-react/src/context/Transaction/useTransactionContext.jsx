import { useContext } from "react";
import { TransactionContext } from "./TransactionContext";

export const useTransactionContext = () => {
    const ctx = useContext(TransactionContext);
    if (!ctx) throw new Error("useTransactionContext debe usarse dentro de TransactionProvider");
    return ctx;
};

