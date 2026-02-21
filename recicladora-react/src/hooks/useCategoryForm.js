import { useState } from "react";
import { useCategoriesContext } from "../context/Category/useCategoriesContext";
import { categoryService } from "../services/categoryService";
import { CategoryModel } from "../interfaces/category";
import { alert } from "../utils/alert";

export const useCategoryForm = () => {
    const { categories, loadCategories } = useCategoriesContext();

    const [formData, setFormData] = useState({ ...CategoryModel });
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 📌 Manejo de inputs
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // 📌 Validaciones simples
    const validateForm = () => {
        if (!formData.name.trim()) {
            alert.error("El nombre de la categoría es obligatorio");
            return false;
        }

        if (!formData.description.trim()) {
            alert.error("La descripción es obligatoria");
            return false;
        }

        return true;
    };

    // 📌 Guardar (crear / editar)
    const submitForm = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            if (isEditing) {
                await categoryService.updateCategory(formData.id, formData);
                alert.success("Categoría actualizada con éxito", "Éxito");
            } else {
                await categoryService.createCategory(formData);
                alert.success("Categoría creada con éxito", "Éxito");
            }

            resetForm();
            loadCategories();

        } catch (error) {
            console.error(error);
            alert.error(error.message || "No se pudo realizar la operación");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 📌 Preparar edición
    const startEdit = (category) => {
        setFormData({ ...category });
        setIsEditing(true);
    };

    // 📌 Eliminar
    const deleteCategory = async (id) => {
        try {
            const result = await alert.confirm(
                "¿Eliminar categoría?",
                "Esta acción no se puede deshacer"
            );

            if (!result.isConfirmed) return;

            await categoryService.remove(id);
            alert.success("Categoría eliminada con éxito", "Éxito");
            loadCategories();

        } catch (error) {
            console.error(error);
            alert.error("No se pudo eliminar la categoría");
        }
    };

    // 📌 Reset
    const resetForm = () => {
        setFormData({ ...CategoryModel });
        setIsEditing(false);
    };

    return {
        // data
        categories,
        formData,
        isEditing,
        isSubmitting,

        // actions
        handleInputChange,
        submitForm,
        startEdit,
        deleteCategory,
        resetForm,
        setFormData,
    };
};
