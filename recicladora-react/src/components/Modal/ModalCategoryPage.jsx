import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import "./CategoryModalPage.css";
import { canCategoryMutate } from "../../utils/permissions";

const CategoryModal = ({
    isOpen,
    onClose,
    formData,
    isEditing,
    handleInputChange,
    handleSubmit,
}) => {
    const canMutate = useMemo(() => canCategoryMutate(), []);

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

    return (
        <div className="category-modal__backdrop">
            <button
              type="button"
              className="category-modal__backdrop-btn"
              aria-label="Cerrar"
              onClick={onClose}
            />
            <dialog className="category-modal__dialog" open aria-modal="true">
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
                                <label className="form-label" htmlFor="category-name">Nombre</label>
                                <input
                                    id="category-name"
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Plástico, Papel, Vidrio"
                                    required
                                    autoFocus
                                    disabled={!canMutate}
                                />
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="category-description">Descripción</label>
                                <textarea
                                    id="category-description"
                                    name="description"
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe el tipo de residuo"
                                    required
                                    disabled={!canMutate}
                                />
                            </div>

                            {/* ESTADO */}
                            <div className="form-switch-wrapper">
                                <label className="switch-label" htmlFor="category-status">
                                    <input
                                        id="category-status"
                                        type="checkbox"
                                        name="status"
                                        checked={formData.status === "active" || formData.status === true}
                                        onChange={handleInputChange}
                                        disabled={!canMutate}
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
                                {canMutate ? "Cancelar" : "Cerrar"}
                            </button>
                            {canMutate && (
                                <button type="submit" className="btn btn-success">
                                    {isEditing ? "Actualizar" : "Guardar"}
                                </button>
                            )}
                        </div>
                    </form>

                </div>
            </dialog>
        </div>
    );
};

CategoryModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  formData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default CategoryModal;