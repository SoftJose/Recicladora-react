import EntityLayout from "../../components/layout/Entity/EntityLayout";
import { useTransactions } from "../../hooks/useTransactions.js";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./transactionPage.css";
import MaterialAutocomplete from "../../components/Autocomplete/MaterialAutocomplete.jsx";

const normalizeType = (raw) => {
    const t = String(raw || "").toUpperCase().trim();
    return t === "COMPRA" ? "COMPRA" : "VENTA";
};

const TransactionPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const typeFromQuery = useMemo(() => {
        const sp = new URLSearchParams(location.search);
        return normalizeType(sp.get("type"));
    }, [location.search]);

    const {
        transactionType,
        setTransactionType,

        clientModeWithData,
        setClientModeWithData,
        clientForm,
        onClientChange,
        clientSelected,

        sellerName,
        invoiceCode,
        setInvoiceCode,

        filteredMaterials,
        materialQuery,
        handleMaterialInput,
        selectedMaterial,
        selectMaterial,
        quantity,
        setQuantity,
        price,
        setPrice,
        subtotalPreview,
        addMaterialItem,
        items,
        removeItem,
        total,

        saveTransaction,
        getCategoryNameById,
    } = useTransactions({ defaultType: typeFromQuery });

    useEffect(() => {
        if (transactionType !== typeFromQuery) {
            setTransactionType(typeFromQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeFromQuery]);

    const onChangeType = (nextType) => {
        const safeType = normalizeType(nextType);
        setTransactionType(safeType);

        const sp = new URLSearchParams(location.search);
        sp.set("type", safeType);

        navigate(
            { pathname: location.pathname, search: `?${sp.toString()}` },
            { replace: true }
        );
    };

    const pageTitle = transactionType === "COMPRA" ? "Compras" : "Ventas";
    const cardTitle = transactionType === "COMPRA" ? "Proveedor" : "Cliente";
    const actionLabel =
        transactionType === "COMPRA" ? "Realizar Compra" : "Realizar Venta";

    return (
        <EntityLayout
            title={`Transacciones - ${pageTitle}`}
            hideControls
            bodyScroll
            bodyMaxHeight="calc(100vh - 70px)"
        >
            <div className="invoice-page container my-4">
                {/* Selector de tipo */}
                <div className="d-flex justify-content-end mb-3">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className={`btn ${
                                transactionType === "VENTA"
                                    ? "btn-success"
                                    : "btn-outline-success"
                            }`}
                            onClick={() => onChangeType("VENTA")}
                        >
                            Venta
                        </button>

                        <button
                            type="button"
                            className={`btn ${
                                transactionType === "COMPRA"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                            }`}
                            onClick={() => onChangeType("COMPRA")}
                        >
                            Compra
                        </button>
                    </div>
                </div>

                <div className="invoice-grid">
                    {/* CLIENTE / PROVEEDOR */}
                    <div className="invoice-card">
                        <div className="invoice-card__header invoice-card__header--clients">
                            <h5>{cardTitle}</h5>
                        </div>

                        <div className="invoice-card__body">
                            <form>
                                <div className="mb-2">
                                    <label className="form-label">Cédula</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        name="identify"
                                        value={clientForm.identify}
                                        onChange={onClientChange}
                                        disabled={!clientModeWithData}
                                        minLength={10}
                                        maxLength={10}
                                        placeholder="0102030405"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Nombres</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        name="name"
                                        value={clientForm.name}
                                        onChange={onClientChange}
                                        disabled={!clientModeWithData}
                                        maxLength={45}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Apellidos</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        name="surnames"
                                        value={clientForm.surnames}
                                        onChange={onClientChange}
                                        disabled={!clientModeWithData}
                                        maxLength={45}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        name="address"
                                        value={clientForm.address}
                                        onChange={onClientChange}
                                        disabled={!clientModeWithData}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Correo</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-sm"
                                        name="email"
                                        value={clientForm.email}
                                        onChange={onClientChange}
                                        disabled={!clientModeWithData}
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Teléfono</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        name="phone"
                                        value={clientForm.phone}
                                        onChange={onClientChange}
                                        disabled={!clientModeWithData}
                                        placeholder="0999999999"
                                    />
                                </div>

                                <div className="form-check mt-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={clientModeWithData}
                                        onChange={(e) =>
                                            setClientModeWithData(e.target.checked)
                                        }
                                    />
                                    <label className="form-check-label">
                                        {transactionType === "COMPRA"
                                            ? "Registrar proveedor manualmente"
                                            : "Registrar cliente manualmente"}
                                    </label>
                                </div>

                                {clientSelected && (
                                    <div className="alert alert-info py-2 mt-2">
                                        {cardTitle} encontrado:{" "}
                                        <strong>
                                            {clientSelected.name}{" "}
                                            {clientSelected.surnames}
                                        </strong>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* TRANSACCIÓN */}
                    <div className="invoice-card">
                        <div className="invoice-card__header invoice-card__header--invoice">
                            <h5>
                                {transactionType === "COMPRA"
                                    ? "Compra"
                                    : "Venta"}
                            </h5>
                        </div>

                        <div className="invoice-card__body">
                            <div className="invoice-form-grid invoice-form-grid--2">
                                <div>
                                    <label className="form-label fw-bold text-danger">
                                        VENDEDOR
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={sellerName}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="form-label fw-bold">
                                        Código
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={invoiceCode}
                                        onChange={(e) =>
                                            setInvoiceCode(e.target.value)
                                        }
                                        placeholder={
                                            transactionType === "COMPRA"
                                                ? "COM-0001"
                                                : "VEN-0001"
                                        }
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* MATERIAL */}
                            <div className="invoice-form-grid mt-3">
                                <div>
                                    <label className="form-label fw-bold">
                                        Material
                                    </label>

                                    <MaterialAutocomplete
                                        items={filteredMaterials}
                                        value={materialQuery}
                                        onChange={(val) => handleMaterialInput(val)}
                                        onSelect={(m) => {
                                            selectMaterial(m);
                                        }}
                                        placeholder="Buscar material por nombre o código"
                                        getSubLabel={(m) => {
                                            const category = getCategoryNameById(m.categoryId) || (m.categoryId != null ? `Categoría #${m.categoryId}` : "");
                                            const stock = Number(m.stock ?? 0);
                                            return `${category}${category ? " | " : ""}Stock: ${stock}`;
                                        }}
                                        getBadge={(m) => {
                                            const stock = Number(m.stock ?? 0);
                                            const isZero = stock <= 0;
                                            return (
                                                <span className={`badge ${isZero ? "bg-danger" : "bg-secondary"}`}>
                                                    Stock: {stock}
                                                </span>
                                            );
                                        }}
                                        isItemDisabled={(m) => {
                                            if (transactionType !== "VENTA") return false;
                                            return Number(m.stock ?? 0) <= 0;
                                        }}
                                    />

                                    {selectedMaterial && (
                                        <div className="invoice-form-grid invoice-form-grid--3 mt-3">
                                            <div>
                                                <label className="form-label fw-bold">Categoría</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={getCategoryNameById(selectedMaterial.categoryId) || String(selectedMaterial.categoryId ?? "")}
                                                    disabled
                                                />
                                            </div>

                                            <div>
                                                <label className="form-label fw-bold">Código</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedMaterial.code ?? ""}
                                                    disabled
                                                />
                                            </div>

                                            <div>
                                                <label className="form-label fw-bold">Stock</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedMaterial.stock ?? 0}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CANTIDAD Y PRECIO */}
                            <div className="invoice-form-grid invoice-form-grid--qty mt-3">
                                <div>
                                    <label className="form-label fw-bold">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(e.target.value)
                                        }
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="form-label fw-bold">
                                        Precio
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(e.target.value)
                                        }
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="invoice-inline mt-3">
                                <small className="text-muted">
                                    Subtotal: {subtotalPreview.toFixed(2)}
                                </small>

                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={addMaterialItem}
                                >
                                    Añadir Material
                                </button>
                            </div>

                            {/* TABLA */}
                            <div className="table-responsive mt-3">
                                <table className="table table-bordered">
                                    <thead className="table-success">
                                    <tr>
                                        <th>#</th>
                                        <th>Material</th>
                                        <th>Cantidad</th>
                                        <th>Precio</th>
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {items.length > 0 ? (
                                        items.map((it) => (
                                            <tr key={it.id}>
                                                <td>{it.id}</td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span>{it.materialName}</span>
                                                        <small className="text-muted">
                                                            {it.categoryName || getCategoryNameById(it.categoryId) || (it.categoryId != null ? `Categoría #${it.categoryId}` : "")}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>{it.quantity}</td>
                                                <td>
                                                    {Number(it.price).toFixed(2)}
                                                </td>
                                                <td>
                                                    {Number(it.subtotal).toFixed(
                                                        2
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            removeItem(it.id)
                                                        }
                                                    >
                                                        Quitar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center text-muted"
                                            >
                                                No hay materiales agregados
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="invoice-total mt-3">
                                <strong>
                                    Total: {Number(total).toFixed(2)}
                                </strong>
                            </div>

                            <div className="d-flex justify-content-end mt-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-success"
                                    onClick={saveTransaction}
                                >
                                    {actionLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EntityLayout>
    );
};

export default TransactionPage;

