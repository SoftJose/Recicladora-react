// src/pages/Category/CategoryPage.jsx
import { useState, useEffect, useMemo } from "react";
import EntityLayout from "../../components/layout/Entity/EntityLayout";
import CategoryModal from "../../components/Modal/ModalCategoryPage";
import { useCategoryForm } from "../../hooks/useCategoryForm";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination/Pagination";
import { CategoryModel } from "../../interfaces/category";
import "./CategoryPage.css";
import categoryIcon from "../../assets/img/papelera-de-reciclaje.png";

const ITEMS_PER_PAGE = 10;

const CategoryPage = () => {
  const {
    categories,
    formData,
    isEditing,
    handleInputChange,
    submitForm,
    startEdit,
    deleteCategory,
    resetForm,
    setFormData,
  } = useCategoryForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const safe = Array.isArray(categories) ? categories : [];

    return safe.filter((cat) =>
      (cat?.name ?? "").toLowerCase().includes(q) ||
      (cat?.description ?? "").toLowerCase().includes(q)
    );
  }, [categories, searchTerm]);

  const {
    paginatedData,
    resetPage,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination(filteredCategories, ITEMS_PER_PAGE);

  useEffect(() => {
    resetPage();
  }, [searchTerm, filteredCategories.length, resetPage]);

  const handleOpenModal = () => {
    resetForm();
    setFormData({ ...CategoryModel });
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    startEdit(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    await submitForm(e);
    setIsModalOpen(false);
  };

  return (
    <EntityLayout
      title="Gestión de Categorías"
      searchTerm={searchTerm}
      onSearch={setSearchTerm}
      addBtnText="Nueva Categoría"
      onAddClick={handleOpenModal}
      headerIcon={categoryIcon}
      bodyScroll
      bodyMaxHeight="calc(100vh - 210px)"
    >
      <div className="category-page">
        <div className="category-page__table-wrapper">
          <div className="category-page__table-scroll">
            <table className="category-table">
              <thead className="category-table__header">
              <tr>
                <th className="category-table__th">Material</th>
                <th className="category-table__th">Descripción</th>
                <th className="category-table__th">Estado</th>
                <th className="category-table__th text-center">Acciones</th>
              </tr>
              </thead>

              <tbody className="category-table__body">
              {paginatedData.length > 0 ? (
                paginatedData.map((cat) => (
                  <tr key={cat.id} className="category-table__tr">
                    <td data-label="Material" className="category-table__td fw-semibold">
                      <div className="d-flex align-items-center gap-2">
                        <div className="category-icon">
                          <i className="bi bi-tags"></i>
                        </div>
                        {cat.name}
                      </div>
                    </td>

                    <td data-label="Descripción" className="category-table__td">
                      <span className="text-muted">{cat.description}</span>
                    </td>

                    <td data-label="Estado" className="category-table__td">
                      <span className={`status-badge status-badge--${cat.status ? "active" : "inactive"}`}>
                        <i className={`bi ${cat.status ? "bi-check-circle" : "bi-x-circle"}`}></i>
                        {cat.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td data-label="Acciones" className="category-table__td text-center">
                      <div className="btn-group">
                        <button
                          className="btn-action edit"
                          onClick={() => handleEditClick(cat)}
                          title="Editar categoría"
                          type="button"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>

                        <button
                          className="btn-action delete"
                          onClick={() => deleteCategory(cat.id)}
                          title="Eliminar categoría"
                          type="button"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : null}
              </tbody>
            </table>
          </div>

          <div className="category-page__pagination">
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
          <div className="category-empty-state">
            <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
            <p className="text-muted mb-0">
              {searchTerm
                ? "No se encontraron categorías que coincidan con la búsqueda"
                : "No hay categorías registradas"}
            </p>
            {!searchTerm && (
              <small className="text-muted">
                Comienza agregando una nueva categoría
              </small>
            )}
          </div>
        )}

        <CategoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          formData={formData}
          isEditing={isEditing}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </EntityLayout>
  );
};

export default CategoryPage;

