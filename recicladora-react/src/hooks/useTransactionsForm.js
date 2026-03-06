import { useMemo, useState } from "react";
import { transactionModel } from "../interfaces/transactionModel.js";
import { transactionService } from "../services/transactionService.js";
import { useTransactionContext } from "../context/Transaction/useTransactionContext";
import { alert } from "../utils/alert";
import { useAuth } from "./useAuth";

const isEmpty = (v) => v === null || v === undefined || v === "";

export const useTransactionForm = () => {
    const { transactions, loadTransactions } = useTransactionContext();
    const { user } = useAuth();

    const [formData, setFormData] = useState({ ...transactionModel });
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canAutoSetUser = useMemo(() => !!(user?.id || user?.userId), [user]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validateForm = () => {
        if (!formData.code?.trim()) {
            alert.error("El código de la transacción es obligatorio");
            return false;
        }

        if (isEmpty(formData.personId) || Number.isNaN(Number(formData.personId))) {
            alert.error("Debes seleccionar una persona/cliente válido");
            return false;
        }

        if (isEmpty(formData.total) || Number.isNaN(Number(formData.total))) {
            alert.error("El total debe ser un número válido");
            return false;
        }

        return true;
    };

    const normalizePayload = () => {
        const userId = formData.usersId ?? (user?.id ?? user?.userId ?? 0);

        return {
            ...formData,
            total: Number(formData.total ?? 0),
            personId: Number(formData.personId ?? 0),
            usersId: Number(userId ?? 0),
            type: formData.type ?? "VENTA",
            createdAt: formData.createdAt ?? new Date().toISOString(),
        };
    };

    const submitForm = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = normalizePayload();

            if (isEditing) {
                await transactionService.update(payload.id, payload);
                alert.success("Transacción actualizada con éxito", "Éxito");
            } else {
                await transactionService.create(payload);
                alert.success("Transacción creada con éxito", "Éxito");
            }

            resetForm();
        } catch (error) {
            console.error(error);
            alert.error(error.message || "No se pudo realizar la operación");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (transaction) => {
        setFormData({ ...transaction });
        setIsEditing(true);
    };

    const deleteTransaction = async (id) => {
        try {
            const result = await alert.confirm(
                "¿Eliminar transacción?",
                "Esta acción no se puede deshacer"
            );

            if (!result.isConfirmed) return;

            await transactionService.remove(id);
            alert.success("Transacción eliminada con éxito", "Éxito");
            loadTransactions();
        } catch (error) {
            console.error(error);
            alert.error("No se pudo eliminar la transacción");
        }
    };

    const resetForm = () => {
        const userId = canAutoSetUser ? (user?.id ?? user?.userId ?? 0) : 0;
        setFormData({ ...transactionModel, usersId: userId, type: "VENTA" });
        setIsEditing(false);
    };

    return {
        transactions,
        formData,
        isEditing,
        isSubmitting,

        handleInputChange,
        submitForm,
        startEdit,
        deleteTransaction,
        resetForm,
        setFormData,
    };
};
