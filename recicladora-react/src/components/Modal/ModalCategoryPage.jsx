import React from 'react';

import  './CategoryModalPage.css'

const CategoryModal = ({ formData, isEditing, handleInputChange, handleSubmit }) => {
    return (
        <div className="modal fade" id="categoryModal" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content modal-glass">

                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-recycle me-2"></i>
                            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">

                            <div className="mb-3">
                                <label className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control form-control-lg"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Descripción</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-check form-switch mt-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="status"
                                    checked={formData.status === 'active'}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label fw-semibold">
                                    Categoría activa
                                </label>
                            </div>

                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-success">
                                {isEditing ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;