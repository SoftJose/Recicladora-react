import React from "react";
import PropTypes from "prop-types";

const InvoiceModal = ({
    formData,
    isEditing,
    handleInputChange,
    handleSubmit,
    clients = [],
}) => {
    return (
        <div className="modal fade" id="invoiceModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title m-0">
                            {isEditing ? "Editar Transacción" : "Nueva Transacción"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="invoice-code">Código</label>
                                    <input
                                        id="invoice-code"
                                        type="text"
                                        name="code"
                                        className="form-control"
                                        value={formData.code ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Ej: FAC-0001"
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="invoice-total">Total</label>
                                    <input
                                        id="invoice-total"
                                        type="number"
                                        name="total"
                                        className="form-control"
                                        value={formData.total ?? 0}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label" htmlFor="invoice-client">Cliente</label>
                                    <select
                                        id="invoice-client"
                                        name="personId"
                                        className="form-select"
                                        value={formData.personId ?? ""}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="" disabled>
                                            Selecciona un cliente
                                        </option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.names ?? c.name ?? `Cliente #${c.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
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

InvoiceModal.propTypes = {
    formData: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        code: PropTypes.string,
        total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        personId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        usersId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        type: PropTypes.string,
        createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    }).isRequired,
    isEditing: PropTypes.bool.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    clients: PropTypes.array,
};

export default InvoiceModal;
