import React, { useEffect } from "react";
import PropTypes from "prop-types";
import "./MaterialModalPage.css";

const MaterialModal = ({
    isOpen,
    onClose,
    formData,
    isEditing,
    handleInputChange,
    handleSubmit,
    categories = [],
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
        <div className="material-modal__backdrop" onClick={onBackdropClick}>
            <div
                className="material-modal__dialog"
                role="dialog"
                aria-modal="true"
                onClick={stop}
            >
                <div className="material-modal__content modal-glass">
                    {/* HEADER */}
                    <div className="material-modal__header">
                        <div className="d-flex align-items-center gap-2">
                            <div className="modal-icon">
                                <i className="bi bi-box-seam"></i>
                            </div>
                            <h5 className="modal-title m-0">
                                {isEditing ? "Editar Material" : "Nuevo Material"}
                            </h5>
                        </div>

                        <button
                            type="button"
                            className="material-modal__close"
                            aria-label="Cerrar"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit}>
                        <div className="material-modal__body">
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label
                                        className="form-label"
                                        htmlFor="material-code"
                                    >
                                        Código
                                    </label>
                                    <input
                                        id="material-code"
                                        type="text"
                                        name="code"
                                        className="form-control"
                                        value={formData.code ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Ej: MAT-0001"
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label
                                        className="form-label"
                                        htmlFor="material-location"
                                    >
                                        Ubicación
                                    </label>
                                    <input
                                        id="material-location"
                                        type="text"
                                        name="location"
                                        className="form-control"
                                        value={formData.location ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Bodega A - Estante 3"
                                    />
                                </div>

                                <div className="col-12">
                                    <label
                                        className="form-label"
                                        htmlFor="material-name"
                                    >
                                        Nombre del material
                                    </label>
                                    <input
                                        id="material-name"
                                        type="text"
                                        name="materialName"
                                        className="form-control"
                                        value={formData.materialName ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Plástico PET"
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label
                                        className="form-label"
                                        htmlFor="material-description"
                                    >
                                        Descripción
                                    </label>
                                    <textarea
                                        id="material-description"
                                        name="description"
                                        className="form-control"
                                        rows="3"
                                        value={formData.description ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Describe el material"
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label
                                        className="form-label"
                                        htmlFor="material-stock"
                                    >
                                        Stock
                                    </label>
                                    <input
                                        id="material-stock"
                                        type="number"
                                        name="stock"
                                        className="form-control"
                                        value={formData.stock ?? 0}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="1"
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label
                                        className="form-label"
                                        htmlFor="material-price"
                                    >
                                        Precio
                                    </label>
                                    <input
                                        id="material-price"
                                        type="number"
                                        name="price"
                                        className="form-control"
                                        value={formData.price ?? 0}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label
                                        className="form-label"
                                        htmlFor="material-category"
                                    >
                                        Categoría
                                    </label>
                                    <select
                                        id="material-category"
                                        name="categoryId"
                                        className="form-select"
                                        value={formData.categoryId ?? ""}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Sin categoría</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="material-modal__footer">
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

MaterialModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    formData: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        code: PropTypes.string,
        materialName: PropTypes.string,
        description: PropTypes.string,
        stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        categoryId: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
            PropTypes.oneOf([null]),
        ]),
        location: PropTypes.string,
    }).isRequired,
    isEditing: PropTypes.bool.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
                .isRequired,
            name: PropTypes.string.isRequired,
        })
    ),
};

export default MaterialModal;
