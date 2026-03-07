import { useEffect, useMemo, useState, Fragment } from "react";
import EntityLayout from "../../components/layout/Entity/EntityLayout";
import { alert } from "../../utils/alert";
import { transactionService } from "../../services/transactionService.js";
import { useClientsContext } from "../../context/Clients/useClientsContext";
import { useMaterialsContext } from "../../context/Material/useMaterialsContext";
import "./transactionDetailsPage.css";

const DetailsPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { clients } = useClientsContext();
    const { materials, loadMaterials } = useMaterialsContext();

    // ...existing code...

    const [transactions, setTransactions] = useState([]);
    const [expanded, setExpanded] = useState(() => new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detailsByTx, setDetailsByTx] = useState(() => new Map());
    const [loadingTxId, setLoadingTxId] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([
                    transactionService.findAllInvoices().then(setTransactions),
                    loadMaterials()
                ]);
            } catch (e) {
                console.error("Error al cargar datos:", e);
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [loadMaterials]);

    // --- MEMOS DE BÚSQUEDA ---
    const clientsById = useMemo(() => {
        const map = new Map();
        (Array.isArray(clients) ? clients : []).forEach((c) => {
            if (c?.id != null) map.set(Number(c.id), c);
        });
        return map;
    }, [clients]);


    const materialsById = useMemo(() => {
        const map = new Map();
        (Array.isArray(materials) ? materials : []).forEach((m) => {
            if (m?.id != null) map.set(Number(m.id), m);
        });
        return map;
    }, [materials]);

    const filteredTransactions = useMemo(() => {
        const list = Array.isArray(transactions) ? transactions : [];
        const query = String(searchQuery || "").trim().toLowerCase();

        if (!query) return list;

        return list.filter((t) => {
            // Buscar por código de factura
            const code = String(t.code || "").toLowerCase();
            if (code.includes(query)) return true;

            // Buscar por datos del cliente
            const person = t.personId != null ? clientsById.get(Number(t.personId)) : null;
            if (person) {
                // Buscar por cédula
                const identify = String(person.identify || "").toLowerCase();
                if (identify.includes(query)) return true;

                // Buscar por nombre completo
                const name = String(person.name || person.nombre || "").toLowerCase();
                const surnames = String(person.surnames || person.apellidos || "").toLowerCase();
                const fullName = `${name} ${surnames}`.trim().toLowerCase();

                if (name.includes(query) || surnames.includes(query) || fullName.includes(query)) {
                    return true;
                }
            }

            return false;
        });
    }, [transactions, searchQuery, clientsById]);

    const invoices = useMemo(() => {
        const list = Array.isArray(filteredTransactions) ? filteredTransactions : [];
        // Cambiar ordenamiento a ascendente (más antiguos primero)
        const sorted = [...list].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));

        return sorted.map((t) => {
            const person = t.personId != null ? clientsById.get(Number(t.personId)) : null;
            const name = person?.name || person?.nombre || "";
            const surnames = person?.surnames || person?.apellidos || "";

            const clientName = (name || surnames)
                ? `${name} ${surnames}`.trim()
                : "Consumidor Final";

            return {
                transactionId: t.id,
                transactionCode: t.code || String(t.id),
                clientName,
                total: t.total != null ? Number(t.total) : 0,
            };
        });
    }, [filteredTransactions, clientsById]);

    const totalGeneral = useMemo(
        () => invoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0),
        [invoices]
    );

    // --- FUNCIONES ---
    const enrichItems = (items) => {
        const safe = Array.isArray(items) ? items : [];
        return safe.map((it) => {
            const matReal = it?.materialId != null ? materialsById.get(Number(it.materialId)) : null;

            // Buscamos cantidad: puede venir del mapper (quantity) o del backend (cantidad)
            const qty = Number(it.quantity ?? it.cantidad ?? 0);

            // Buscamos precio: puede venir del mapper (price) o del backend (precioUnitario)
            const price = Number(it.price ?? it.precioUnitario ?? 0);

            // Calculamos el subtotal si no viene ya calculado
            const subtotal = it.subtotal ?? (qty * price);

            return {
                ...it,
                quantity: qty,
                price: price,
                subtotal: subtotal,
                materialName:
                    it.materialName ||
                    matReal?.materialName ||
                    matReal?.name ||
                    `Material #${it.materialId}`
            };
        });
    };

    const toggleExpanded = async (txId) => {
        const id = Number(txId);
        if (!id) return;

        if (expanded.has(id)) {
            setExpanded(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            return;
        }

        setExpanded(prev => new Set(prev).add(id));
        if (detailsByTx.has(id)) return;

        try {
            setLoadingTxId(id);
            const tx = await transactionService.findInvoiceById(id);
            const items = enrichItems(tx?.detalles ?? tx?.details ?? []);
            setDetailsByTx(prev => new Map(prev).set(id, items));
        } catch (e) {
            console.error(e);
            alert.error("No se pudo cargar el detalle");
        } finally {
            setLoadingTxId(null);
        }
    };

    return (
        <EntityLayout title="Detalles / Reportes" hideControls bodyScroll>
            <div className="details-page container my-3">

                {/* 1. CABECERA: Título y Buscador */}
                <div className="details-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="details-title mb-1">Transacciones / Reportes</h4>
                        <p className="text-muted mb-0">Resumen por factura y búsqueda por cliente.</p>
                    </div>
                    <div className="search-box" style={{ width: "350px" }}>
                        <div className="input-group">
                            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por nombre, cédula o código de factura..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. CARD PRINCIPAL */}
                <div className="details-card shadow-sm border-0">
                    <div className="details-card__header d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                        <span className="text-uppercase fw-bold text-secondary small">Lista de Facturas</span>
                        <span className="fw-bold text-success fs-5">Total General: ${totalGeneral.toFixed(2)}</span>
                    </div>

                    <div className="details-card__body p-3">
                        {/* Estados de Carga y Error */}
                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success" role="status"></div>
                                <p className="mt-2 text-muted">Obteniendo información del servidor...</p>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger py-3" role="alert">
                                <i className="bi bi-exclamation-octagon-fill me-2"></i>
                                <strong>Error al cargar:</strong> {error.message || "Error desconocido"}
                            </div>
                        )}

                        {/* Tabla de Resultados */}
                        {!loading && !error && (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                    <tr>
                                        <th>Factura</th>
                                        <th>Cliente</th>
                                        <th className="text-end">Total</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {invoices.length > 0 ? (
                                        invoices.map((inv) => (
                                            <Fragment key={inv.transactionId}>
                                                <tr>
                                                    <td className="fw-bold">{inv.transactionCode}</td>
                                                    <td>{inv.clientName}</td>
                                                    <td className="text-end fw-bold">${inv.total.toFixed(2)}</td>
                                                    <td className="text-center">
                                                        <button
                                                            className={`btn btn-sm ${expanded.has(inv.transactionId) ? 'btn-success' : 'btn-outline-success'}`}
                                                            onClick={() => toggleExpanded(inv.transactionId)}
                                                            disabled={loadingTxId === inv.transactionId}
                                                        >
                                                            {loadingTxId === inv.transactionId ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : expanded.has(inv.transactionId) ? "Cerrar" : "Ver Detalles"}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* FILA EXPANDIBLE: DETALLES DE MATERIALES */}
                                                {expanded.has(inv.transactionId) && (
                                                    <tr>
                                                        <td colSpan="4" className="bg-light p-0">
                                                            <div className="p-4 border-start border-success border-4 m-2 bg-white shadow-sm">
                                                                <h6 className="fw-bold mb-3"><i className="bi bi-box-seam me-2"></i>Materiales de la transacción</h6>
                                                                <table className="table table-sm table-bordered mb-0">
                                                                    <thead className="table-dark">
                                                                    <tr>
                                                                        <th>Material</th>
                                                                        <th className="text-end">Cant.</th>
                                                                        <th className="text-end">Precio</th>
                                                                        <th className="text-end">Subtotal</th>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {(detailsByTx.get(inv.transactionId) || []).map((it, i) => (
                                                                        <tr key={i}>
                                                                            <td>{it.materialName}</td>
                                                                            <td className="text-end">{it.quantity.toFixed(2)}</td>
                                                                            <td className="text-end">${it.price.toFixed(2)}</td>
                                                                            <td className="text-end fw-bold">${it.subtotal.toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">No se encontraron transacciones.</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </EntityLayout>
    );
};

export default DetailsPage;