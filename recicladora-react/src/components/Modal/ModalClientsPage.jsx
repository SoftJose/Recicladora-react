import React, { useEffect } from "react";
import "./ClientsModalPage.css";

const ClientsModal = ({
    isOpen,
    onClose,
    formData,
    isEditing,
    handleInputChange,
    handleSubmit,
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };

        document.addEventListener("keydown", onKeyDown);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const onBackdropClick = () => onClose?.();
    const stop = (e) => e.stopPropagation();

    return (
        <div className="clients-modal__backdrop" onMouseDown={onBackdropClick}>
            <div className="clients-modal__dialog" role="dialog" aria-modal="true" onMouseDown={stop}>
                <div className="clients-modal__content">
                    <div className="clients-modal__header">
                        <div className="d-flex align-items-center gap-2">
                            <div className="clients-modal__icon">
                                <i className="bi bi-person-badge"></i>
                            </div>
                            <h5 className="clients-modal__title m-0">
                                {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
                            </h5>
                        </div>

                        <button
                            type="button"
                            className="clients-modal__close"
                            aria-label="Cerrar"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="clients-modal__body">
                            <div className="clients-modal__grid">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="client-identify">Identificación</label>
                                    <input
                                        id="client-identify"
                                        type="text"
                                        name="identify"
                                        className="form-control"
                                        value={formData.identify ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Cédula/RUC"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="client-name">Nombres</label>
                                    <input
                                        id="client-name"
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={formData.name ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Nombres"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="client-surnames">Apellidos</label>
                                    <input
                                        id="client-surnames"
                                        type="text"
                                        name="surnames"
                                        className="form-control"
                                        value={formData.surnames ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Apellidos"
                                        required
                                    />
                                </div>

                                <div className="form-group clients-modal__col-span-2">
                                    <label className="form-label" htmlFor="client-address">Dirección</label>
                                    <input
                                        id="client-address"
                                        type="text"
                                        name="address"
                                        className="form-control"
                                        value={formData.address ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Dirección"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="client-email">Correo</label>
                                    <input
                                        id="client-email"
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="correo@dominio.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="client-phone">Teléfono</label>
                                    <input
                                        id="client-phone"
                                        type="text"
                                        name="phone"
                                        className="form-control"
                                        value={formData.phone ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="0999999999"
                                    />
                                </div>

                                <div className="clients-modal__switch clients-modal__col-span-2">
                                    <label className="switch-label">
                                        <input
                                            type="checkbox"
                                            name="end_Consumer"
                                            checked={Boolean(formData.end_Consumer)}
                                            onChange={handleInputChange}
                                        />
                                        <span className="switch-slider"></span>
                                        <span className="switch-text">Factura con datos (no consumidor final)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="clients-modal__footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-success">
                                {isEditing ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClientsModal;

