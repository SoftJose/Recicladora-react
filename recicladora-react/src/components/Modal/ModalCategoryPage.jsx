import React, { useEffect } from "react";
import "./CategoryModalPage.css";

const CategoryModal = ({
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

        // Evita scroll del body cuando el modal está abierto
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
        <div className="category-modal__backdrop" onMouseDown={onBackdropClick}>
            <div className="category-modal__dialog" role="dialog" aria-modal="true" onMouseDown={stop}>
                <div className="category-modal__content modal-glass">
                    {/* HEADER */}
                    <div className="category-modal__header">
                        <div className="d-flex align-items-center gap-2">
                            <div className="modal-icon">
                                <i className="bi bi-recycle"></i>
                            </div>
                            <h5 className="modal-title m-0">
                                {isEditing ? "Editar Categoría" : "Nueva Categoría"}
                            </h5>
                        </div>

                        <button
                            type="button"
                            className="category-modal__close"
                            aria-label="Cerrar"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* NOMBRE */}
                            <div className="form-group">
                                <label className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Plástico, Papel, Vidrio"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe el tipo de residuo"
                                    required
                                />
                            </div>

                            {/* ESTADO */}
                            <div className="form-switch-wrapper">
                                <label className="switch-label">
                                    <input
                                        type="checkbox"
                                        name="status"
                                        checked={formData.status === "active" || formData.status === true}
                                        onChange={handleInputChange}
                                    />
                                    <span className="switch-slider"></span>
                                    <span className="switch-text">Categoría activa</span>
                                </label>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="category-modal__footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                            >
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

export default CategoryModal;