import { useEffect, useMemo, useState, Fragment } from "react";
import EntityLayout from "../../components/layout/Entity/EntityLayout";
import { alert } from "../../utils/alert";
import { transactionService } from "../../services/transactionService.js";
import { useClientsContext } from "../../context/Clients/useClientsContext";
import { useMaterialsContext } from "../../context/Material/useMaterialsContext";
import "./transactionDetailsPage.css";

const DetailsPage = () => {
    const [clientIdentify, setClientIdentify] = useState("");

    const { clients } = useClientsContext();
    const { materials } = useMaterialsContext();

    const [transactions, setTransactions] = useState([]);

    const [expanded, setExpanded] = useState(() => new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // detalles cargados bajo demanda por transacción (id -> items[])
    const [detailsByTx, setDetailsByTx] = useState(() => new Map());
    const [loadingTxId, setLoadingTxId] = useState(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const txs = await transactionService.findAllInvoices();
                if (!mounted) return;
                setTransactions(Array.isArray(txs) ? txs : []);
            } catch (e) {
                console.error(e);
                if (!mounted) return;
                setError(e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const clientsById = useMemo(() => {
        const map = new Map();
        (Array.isArray(clients) ? clients : []).forEach((c) => {
            if (c?.id != null) map.set(Number(c.id), c);
        });
        return map;
    }, [clients]);

    const clientsByIdentify = useMemo(() => {
        const map = new Map();
        (Array.isArray(clients) ? clients : []).forEach((c) => {
            const key = c?.identify != null ? String(c.identify) : "";
            if (key) map.set(key, c);
        });
        return map;
    }, [clients]);

    const materialsById = useMemo(() => {
        const map = new Map();
        (Array.isArray(materials) ? materials : []).forEach((m) => {
            if (m?.id == null) return;
            map.set(Number(m.id), m);
        });
        return map;
    }, [materials]);

    const filteredTransactions = useMemo(() => {
        const list = Array.isArray(transactions) ? transactions : [];
        const q = String(clientIdentify || "").trim();
        if (!q) return list;

        const client = clientsByIdentify.get(q);
        if (!client?.id) return [];
        return list.filter((t) => Number(t.personId) === Number(client.id));
    }, [transactions, clientIdentify, clientsByIdentify]);

    const invoices = useMemo(() => {
        const list = Array.isArray(filteredTransactions) ? filteredTransactions : [];
        const sorted = [...list].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

        return sorted.map((t) => {
            const person = t.personId != null ? clientsById.get(Number(t.personId)) : null;

            const clientName =
                person?.name || person?.nombre
                    ? `${person?.name ?? person?.nombre ?? ""} ${person?.surnames ?? person?.apellidos ?? ""}`.trim()
                    : (person?.end_Consumer || person?.endConsumer ? "Consumidor Final" : "Consumidor Final");

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

    const enrichItems = (items) => {
        const safe = Array.isArray(items) ? items : [];
        return safe.map((it) => {
            const mat = it?.materialId != null ? materialsById.get(Number(it.materialId)) : null;

            const qty = Number(it.cantidad ?? it.quantity ?? 0);
            const price = Number(it.precioUnitario ?? it.price ?? 0);

            const hasSubtotal = it.subtotal !== null && it.subtotal !== undefined;
            const subtotalFromBackend = hasSubtotal ? Number(it.subtotal) : null;
            const subtotal = subtotalFromBackend ?? qty * price;

            return {
                ...it,
                quantity: qty,
                price,
                subtotal,
                materialName:
                    it.materialName ||
                    mat?.materialName ||
                    mat?.name ||
                    (it.materialId != null ? `Material #${it.materialId}` : ""),
            };
        });
    };

    const toggleExpanded = async (txId) => {
        const id = Number(txId);
        if (!id) return;

        const isCurrentlyOpen = expanded.has(id);

        // Si está abierto, solo cerramos (no fetch)
        if (isCurrentlyOpen) {
            setExpanded((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            return;
        }

        // Abrir
        setExpanded((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });

        // Si ya lo tenemos cargado, no volvemos a pedir
        if (detailsByTx.has(id)) return;

        try {
            setLoadingTxId(id);
            const tx = await transactionService.findInvoiceById(id);
            const items = enrichItems(tx?.detalles ?? tx?.details ?? []);

            setDetailsByTx((prev) => {
                const next = new Map(prev);
                next.set(id, items);
                return next;
            });
        } catch (e) {
            console.error(e);
            alert.error(e?.message || "No se pudo cargar el detalle de la transacción");
        } finally {
            setLoadingTxId(null);
        }
    };

    const onGeneralPdf = async () => {
        alert.info("Pendiente: conectar Reporte general PDF con el backend");
    };

    const onClientPdf = async () => {
        if (!clientIdentify.trim()) {
            alert.error("Ingresa la cédula/identificación del cliente para generar el reporte");
            return;
        }
        alert.info(`Pendiente: conectar Reporte PDF por cliente (${clientIdentify}) con el backend`);
    };

    const onInvoicePdf = async (txId) => {
        alert.info(`Pendiente: descargar PDF de la transacción/factura ${txId}`);
    };

    return (
        <EntityLayout
            title="Detalles / Reportes"
            hideControls
            bodyScroll
            bodyMaxHeight="calc(100vh - 70px)"
        >
            <div className="details-page container my-3">
                <div className="details-header">
                    <div className="details-header__left">
                        <h4 className="details-title">Transacciones / Reportes</h4>
                        <p className="details-subtitle text-muted mb-0">
                            Resumen por factura (transacción). Para ver los materiales, abre una factura.
                        </p>
                    </div>

                    <div className="details-header__right">
                        <div className="details-client-filter">
                            <label className="form-label mb-1" htmlFor="details-client">
                                Reporte por cliente (cédula)
                            </label>
                            <div className="input-group">
                                <input
                                    id="details-client"
                                    type="text"
                                    className="form-control"
                                    value={clientIdentify}
                                    onChange={(e) => setClientIdentify(e.target.value)}
                                    placeholder="0102030405"
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setClientIdentify("")}
                                    title="Limpiar"
                                >
                                    <i className="bi bi-x-lg" />
                                </button>
                            </div>
                            <small className="text-muted">
                                (Filtro local: usa la lista de clientes ya cargada)
                            </small>
                        </div>
                    </div>
                </div>

                <div className="details-card mt-3">
                    <div className="details-card__header">
                        <div className="details-card__header-title">
                            <span className="badge text-bg-success">Resumen</span>
                            <span className="ms-2 fw-bold">Facturas / Transacciones</span>
                        </div>
                        <div className="details-card__header-total">
                            <span className="text-muted">Total general:</span>
                            <span className="ms-2 fw-bold">{totalGeneral.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="details-card__body">
                        {loading && (
                            <div className="alert alert-info mb-3">Cargando transacciones y detalles...</div>
                        )}

                        {error && (
                            <div className="alert alert-danger mb-3">
                                No se pudieron cargar los datos. {error?.message ? `(${error.message})` : ""}
                            </div>
                        )}

                        {!loading && !error && invoices.length === 0 && (
                            <div className="alert alert-warning mb-3">
                                No hay transacciones para mostrar.
                            </div>
                        )}

                        <div className="table-responsive">
                            <table className="table table-bordered details-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 180 }}>Factura</th>
                                        <th>Cliente</th>
                                        <th style={{ width: 140 }} className="text-end">Total</th>
                                        <th style={{ width: 260 }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => {
                                        const isOpen = expanded.has(inv.transactionId);
                                        const items = detailsByTx.get(inv.transactionId) || [];
                                        const isLoadingThis = loadingTxId === inv.transactionId;

                                        return (
                                            <Fragment key={inv.transactionId}>
                                                <tr>
                                                    <td className="fw-bold">{inv.transactionCode}</td>
                                                    <td>{inv.clientName || "Consumidor Final"}</td>
                                                    <td className="text-end fw-bold">{Number(inv.total || 0).toFixed(2)}</td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm ${isOpen ? "btn-secondary" : "btn-outline-secondary"}`}
                                                                onClick={() => toggleExpanded(inv.transactionId)}
                                                                disabled={isLoadingThis}
                                                            >
                                                                {isLoadingThis ? "Cargando..." : isOpen ? "Ocultar" : "Ver"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => onInvoicePdf(inv.transactionId)}
                                                            >
                                                                PDF
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isOpen && (
                                                    <tr>
                                                        <td colSpan={4} className="p-0">
                                                            <div className="p-3">
                                                                <div className="table-responsive">
                                                                    <table className="table table-sm table-striped mb-0">
                                                                        <thead>
                                                                            <tr>
                                                                                <th style={{ width: 70 }}>#</th>
                                                                                <th>Material</th>
                                                                                <th style={{ width: 110 }} className="text-end">Cantidad</th>
                                                                                <th style={{ width: 110 }} className="text-end">Precio</th>
                                                                                <th style={{ width: 120 }} className="text-end">Subtotal</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {items.length > 0 ? (
                                                                                items.map((it, index) => (
                                                                                    <tr key={it.id ?? `${inv.transactionId}-${it.materialId ?? "mat"}-${index}`}>
                                                                                        <td>{index + 1}</td>
                                                                                        <td>{it.materialName || (it.materialId != null ? `Material #${it.materialId}` : "-")}</td>
                                                                                        <td className="text-end">{Number(it.quantity || 0).toFixed(2)}</td>
                                                                                        <td className="text-end">{Number(it.price || 0).toFixed(2)}</td>
                                                                                        <td className="text-end">{Number(it.subtotal || 0).toFixed(2)}</td>
                                                                                    </tr>
                                                                                ))
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan={5} className="text-center text-muted">
                                                                                        {isLoadingThis
                                                                                            ? "Cargando detalles..."
                                                                                            : "Sin detalles en esta transacción"}
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="details-actions">
                            <button type="button" className="btn btn-danger" onClick={onGeneralPdf}>
                                <i className="bi bi-file-earmark-pdf" /> {" "}
                                <span>Reporte general (PDF)</span>
                            </button>

                            <button type="button" className="btn btn-primary" onClick={onClientPdf}>
                                <i className="bi bi-person-vcard" /> {" "}
                                <span>Reporte por cliente (PDF)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </EntityLayout>
    );
};

export default DetailsPage;
