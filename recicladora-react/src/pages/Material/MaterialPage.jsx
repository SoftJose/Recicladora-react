import { useEffect, useMemo, useState } from "react";
import EntityLayout from "../../components/layout/Entity/EntityLayout";
import MaterialModal from "../../components/Modal/ModalMaterialPage";
import { useMaterialForm } from "../../hooks/useMaterialForm";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination/Pagination";
import { MaterialModel } from "../../interfaces/materialsModel";
import { useCategoriesContext } from "../../context/Category/useCategoriesContext";
import { materialsService } from "../../services/materialsService";
import { alert } from "../../utils/alert";
import { canMaterialMutate } from "../../utils/permissions";
import "./MaterialPage.css";
import materialIcon from "../../assets/img/logistica-de-materiales.png";

const ITEMS_PER_PAGE = 10;

const MaterialPage = () => {
    const {
        materials,
        formData,
        isEditing,
        handleInputChange,
        submitForm,
        startEdit,
        deleteMaterial,
        resetForm,
        setFormData,
        generateMaterialCode,
    } = useMaterialForm();


    const { categories } = useCategoriesContext();

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reporte
    const [reportLocation, setReportLocation] = useState("");
    const [reportLote, setReportLote] = useState("");

    const filteredMaterials = useMemo(() => {
        const q = searchTerm.toLowerCase();
        const safeMaterials = Array.isArray(materials) ? materials : [];

        return safeMaterials.filter((m) => {
            const name = (m?.materialName ?? "").toLowerCase();
            const code = (m?.code ?? "").toLowerCase();
            const desc = (m?.description ?? "").toLowerCase();
            const location = (m?.location ?? "").toLowerCase();
            return name.includes(q) || code.includes(q) || desc.includes(q) || location.includes(q);
        });
    }, [materials, searchTerm]);

    const reportFiltered = useMemo(() => {
        const safeMaterials = Array.isArray(materials) ? materials : [];
        const loc = reportLocation.trim().toLowerCase();
        const lote = reportLote.trim().toLowerCase();

        if (!loc && !lote) return safeMaterials;

        return safeMaterials.filter((m) => {
            const mLoc = String(m?.location ?? "").toLowerCase();
            // Nota: si tu modelo no tiene lote aún, este filtro simplemente no aplica.
            const mLote = String(m?.lote ?? m?.batch ?? "").toLowerCase();

            const okLoc = !loc || mLoc.includes(loc);
            const okLote = !lote || mLote.includes(lote);
            return okLoc && okLote;
        });
    }, [materials, reportLocation, reportLote]);

    const reportStats = useMemo(() => {
        const list = reportFiltered;
        const totalItems = list.length;
        const totalStock = list.reduce((acc, m) => acc + Number(m?.stock ?? 0), 0);
        const totalValue = list.reduce((acc, m) => acc + Number(m?.stock ?? 0) * Number(m?.price ?? 0), 0);
        return { totalItems, totalStock, totalValue };
    }, [reportFiltered]);

    const {
        paginatedData,
        currentPage,
        totalPages,
        goToPage,
        totalItems,
        itemsPerPage,
    } = usePagination(filteredMaterials, ITEMS_PER_PAGE);

    // Pre-generar el código para el próximo material
    useEffect(() => {
        if (!formData?.code) {
            generateMaterialCode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenModal = async () => {
        await resetForm({ withCode: false });
        const code = formData?.code ? formData.code : await generateMaterialCode();
        setFormData({ ...MaterialModel, code: code ?? "" });
        setIsModalOpen(true);
    };

    const handleEditClick = (material) => {
        startEdit(material);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (e) => {
        const ok = await submitForm(e);
        if (ok) setIsModalOpen(false);
    };

    const handleExportByLote = async () => {
        const lote = reportLote.trim();
        if (!lote) {
            alert.error("Ingresa un lote para exportar");
            return;
        }

        try {

            alert.success("Solicitud de reporte enviada. Ajusta la descarga según tu backend.");
        } catch (e) {
            alert.error(e.message || "No se pudo generar el reporte por lote");
        }
    };

    const handleExportPdf = async () => {
        try {
            await materialsService.downloadReportPdf({ location: reportLocation, lote: reportLote });
        } catch (e) {
            alert.error(e.message || "No se pudo descargar el PDF");
        }
    };

    const canMutate = canMaterialMutate();

    return (
        <EntityLayout
            title="Gestión de Materiales"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            addBtnText={canMutate ? "Nuevo Material" : null}
            onAddClick={canMutate ? handleOpenModal : undefined}
            headerIcon={materialIcon}
            bodyScroll
            bodyMaxHeight="calc(100vh - 210px)"
        >
            <div className="material-page">
                {/* TABLA */}
                <div className="material-page__table-wrapper">
                    <div className="material-page__table-scroll">
                        <table className="material-table">
                            <thead className="material-table__header">
                                <tr>
                                    <th className="material-table__th">Código</th>
                                    <th className="material-table__th">Material</th>
                                    <th className="material-table__th">Descripción</th>
                                    <th className="material-table__th">Ubicación</th>
                                    <th className="material-table__th">Stock</th>
                                    <th className="material-table__th">Precio</th>
                                    {canMutate && (
                                      <th className="material-table__th text-center">Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="material-table__body">
                                {paginatedData.length > 0
                                    ? paginatedData.map((m) => (
                                          <tr key={m.id} className="material-table__tr">
                                              <td data-label="Código" className="material-table__td fw-semibold">
                                                  <div className="d-flex align-items-center">
                                                      <div className="material-icon me-3">
                                                          <i className="bi bi-box-seam"></i>
                                                      </div>
                                                      {m.code || "-"}
                                                  </div>
                                              </td>

                                              <td data-label="Material" className="material-table__td">
                                                  {m.materialName}
                                              </td>

                                              <td data-label="Descripción" className="material-table__td">
                                                  <span className="text-muted">{m.description}</span>
                                              </td>

                                              <td data-label="Ubicación" className="material-table__td">
                                                  {m.location || "-"}
                                              </td>

                                              <td data-label="Stock" className="material-table__td">
                                                  <span className={`material-stock ${Number(m.stock) <= 0 ? "is-empty" : ""}`}>
                                                      {m.stock ?? 0}
                                                  </span>
                                              </td>

                                              <td data-label="Precio" className="material-table__td">
                                                  {typeof m.price === "number" ? m.price.toFixed(2) : Number(m.price || 0).toFixed(2)}
                                              </td>

                                              {canMutate && (
                                                <td data-label="Acciones" className="material-table__td text-center">
                                                  <div className="btn-group">
                                                      <button
                                                          className="btn-action edit"
                                                          onClick={() => handleEditClick(m)}
                                                          title="Editar material"
                                                      >
                                                          <i className="bi bi-pencil-square"></i>
                                                      </button>
                                                      <button
                                                          className="btn-action delete"
                                                          onClick={() => deleteMaterial(m.id)}
                                                          title="Eliminar material"
                                                      >
                                                          <i className="bi bi-trash3"></i>
                                                      </button>
                                                  </div>
                                                </td>
                                              )}
                                          </tr>
                                      ))
                                    : null}
                            </tbody>
                        </table>
                    </div>

                    <div className="material-page__pagination">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                </div>

                {paginatedData.length === 0 && (
                    <div className="material-empty-state">
                        <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                        <p className="text-muted mb-0">
                            {searchTerm
                                ? "No se encontraron materiales que coincidan con la búsqueda"
                                : "No hay materiales registrados"}
                        </p>
                        {!searchTerm && <small className="text-muted">Comienza agregando un nuevo material</small>}
                    </div>
                )}

                {/* REPORTE (debajo de la tabla) */}
                <section className="material-report">
                    <div className="material-report__header">
                        <div className="material-report__title">
                            <i className="bi bi-file-earmark-bar-graph"></i>
                            <h2 className="m-0">Reportes</h2>
                        </div>
                    </div>

                    <div className="material-report__filters row g-3 align-items-end">
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="reportLocation">Ubicación</label>
                            <input
                                id="reportLocation"
                                className="form-control"
                                value={reportLocation}
                                onChange={(e) => setReportLocation(e.target.value)}
                                placeholder="Ej: Lote A, Bodega 1, Estante 3"
                            />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label" htmlFor="reportLote">Lote</label>
                            <input
                                id="reportLote"
                                className="form-control"
                                value={reportLote}
                                onChange={(e) => setReportLote(e.target.value)}
                                placeholder="Ej: A-2026-03"
                            />
                        </div>
                        <div className="col-12 col-md-2 d-grid">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setReportLocation("");
                                    setReportLote("");
                                }}
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    <div className="material-report__stats row g-3 mt-2">
                        <div className="col-12 col-md-4">
                            <div className="material-report__stat">
                                <span className="material-report__stat-label">Materiales (filtrados)</span>
                                <span className="material-report__stat-value">{reportStats.totalItems}</span>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="material-report__stat">
                                <span className="material-report__stat-label">Stock total (filtrado)</span>
                                <span className="material-report__stat-value">{reportStats.totalStock}</span>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="material-report__stat">
                                <span className="material-report__stat-label">Valor total (filtrado)</span>
                                <span className="material-report__stat-value">{reportStats.totalValue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones al final */}
                    <div className="material-report__actions">
                        <button type="button" className="btn btn-outline-primary" onClick={handleExportByLote}>
                            Reporte por lote
                        </button>
                        <button type="button" className="btn btn-success" onClick={handleExportPdf}>
                            Exportar PDF
                        </button>
                    </div>
                </section>

                <MaterialModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    formData={formData}
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    categories={categories || []}
                    canMutate={canMutate}
                />
            </div>
        </EntityLayout>
    );
};

export default MaterialPage;

