import {useClientsContext} from "../context/Clients/useClientsContext.jsx";
import {useState} from "react";
import {PersonModel} from "../interfaces/personModel.js";
import {alert} from "../utils/alert.js";
import {ClientService as clientsService} from "../services/clientsServices.js";
import { canClientCreate, canClientEdit } from "../utils/permissions";

export const useClientsForms = () => {
    const { clients, loadClients } = useClientsContext();

    const [formData, setFormData] = useState({ ...PersonModel });
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manejo de inputs
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Validaciones
    const validateForm = () => {
        if (!formData.name.trim()) {
            alert.error("El nombre del cliente es obligatorio");
            return false;
        }
        if (!formData.surnames.trim()) {
            alert.error("Los apellidos del cliente son obligatorios","Error");
            return false;
        }
        if (!formData.identify.trim()) {
            alert.error("La cedula del cliente es obligatorio","Error");
            return false;
        }
        if (!formData.email.trim()) {
            alert.error("El correo electrónico del cliente es obligatorio","Error");
            return false;
        }
        if (!formData.address.trim()) {
            alert.error("La dirección del cliente es obligatorio","Error");
            return false;
        }
        if (!formData.phone.trim()) {
            alert.error("El teléfono del cliente es obligatorio","Error");
            return false;
        }

        return true;
    };

    // Guardar (crear / editar)
    const submitForm = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            if (isEditing){
                if (!canClientEdit()) {
                    alert.error("No tienes permisos para editar clientes", "Error");
                    return;
                }
                await clientsService.updateClient(formData.id, formData);
                alert.success("Cliente actualizado con éxito", "Éxito");
            }
            else{
                if (!canClientCreate()) {
                    alert.error("No tienes permisos para crear clientes", "Error");
                    return;
                }
                await clientsService.createClient(formData);
                alert.success("Cliente Guardado con éxito", "Éxito");
            }
            resetForm();
            loadClients();
        }catch (error){
            alert.error(error.message || " No se pudo realizar la operación", "Error");
        }finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (client) => {
        setFormData({ ...client });
        setIsEditing(true);
    };



    const resetForm = () => {
        setFormData({ ...PersonModel });
        setIsEditing(false);
    };

    return {
        // Datos
        clients,
        formData,
        isEditing,
        isSubmitting,
        handleInputChange,
        submitForm,
        startEdit,
        resetForm,
    }
}