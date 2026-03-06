import { useCallback, useEffect, useState } from "react";
import { TransactionContext } from "./TransactionContext";
import { transactionService } from "../../services/transactionService.js";

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadTransactions = useCallback(async () => {
        // Si no hay token, no cargamos nada (evita reintentos/loops)
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setTransactions([]);
            return;
        }

        try {
            setLoading(true);
            const response = await transactionService.findAllInvoices();
            setTransactions(response || []);
        } catch (error) {
            console.error("Error cargando transacciones", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    return (
        <TransactionContext.Provider value={{ transactions, loading, loadTransactions }}>
            {children}
        </TransactionContext.Provider>
    );
};
