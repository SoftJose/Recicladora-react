import { useState, useEffect } from "react";
import EntityLayout from "../../components/layout/Entity/EntityLayout";
import CategoryModal from "../../components/Modal/ModalCategoryPage";
import Pagination from "../../components/Pagination/Pagination";
import { useCategoryForm } from "../../hooks/useCategoryForm";
import { usePagination } from "../../hooks/usePagination";
import { CategoryModel } from "../../interfaces/category";
import "./CategoryPage.css";

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
        setFormData
    } = useCategoryForm();

    const [searchTerm, setSearchTerm] = useState("");

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const {
        currentPage,
        totalPages,
        paginatedData,
        goToPage,
        resetPage,
        totalItems,
        itemsPerPage
    } = usePagination(filteredCategories, 8);

    // Reset page when search term changes
    useEffect(() => {
        resetPage();
    }, [searchTerm, resetPage]);

    const toggleModal = (show = true) => {
        const modalElement = document.getElementById("categoryModal");
        if (modalElement) {
            const modal = window.bootstrap?.Modal.getOrCreateInstance(modalElement);
            show ? modal.show() : modal.hide();
        }
    };

    const handleOpenModal = () => {
        resetForm();
        setFormData({ ...CategoryModel });
        toggleModal(true);
    };

    const handleEditClick = (category) => {
        startEdit(category);
        toggleModal(true);
    };

    return (
        <EntityLayout
            title="Gestión de Categorías"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            addBtnText="Nueva Categoría"
            onAddClick={handleOpenModal}
        >
            <div className="category-container">
                {/* Marca de agua SVG */}
                <div className="watermark">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="200" height="200">
                        <path d="M5.854 1.146a.5.5 0 0 0-.708.708L6.293 3H2.5A.5.5 0 0 0 2 3.5v3a.5.5 0 0 0 1 0V4.707l1.146 1.147a.5.5 0 0 0 .708-.708l-2-2z"/>
                        <path d="M10.146 14.854a.5.5 0 0 0 .708-.708L9.707 13H13.5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-1 0v2.293l-1.146-1.147a.5.5 0 0 0-.708.708l2 2z"/>
                        <path fillRule="evenodd" d="M8 2a6 6 0 1 0 6 6 6.006 6.006 0 0 0-6-6zm0 1a5 5 0 1 1-5 5 5.006 5.006 0 0 1 5-5z"/>
                    </svg>
                </div>

                {/* Header */}
                <header className="category-header">
                    <div className="category-icon-wrapper">
                        <i className="bi bi-recycle"></i>
                    </div>
                    <div>
                        <h2 className="category-title">Categorías de Residuos</h2>
                        <p className="category-subtitle">Administra los tipos de materiales reciclables y su estado.</p>
                    </div>
                </header>

                {/* Tabla */}
                <div className="category-card">
                    <div className="table-container">
                        <div className="table-responsive">
                            <table className="category-table">
                                <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map(cat => (
                                        <tr key={cat.id}>
                                            <td className={`fw-semibold ${cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 'highlight' : ''}`}>
                                                {cat.name}
                                            </td>
                                            <td className={`text-muted ${cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ? 'highlight' : ''}`}>
                                                {cat.description}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${cat.status ? "active" : "inactive"}`}>
                                                    {cat.status ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn-action edit"
                                                    onClick={() => handleEditClick(cat)}
                                                    title="Editar"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn-action delete"
                                                    onClick={() => deleteCategory(cat.id)}
                                                    title="Eliminar"
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">
                                            {searchTerm ? 'No se encontraron categorías que coincidan con la búsqueda' : 'No hay categorías registradas'}
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {paginatedData.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                            />
                        )}
                    </div>
                </div>

                <CategoryModal
                    formData={formData}
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                    handleSubmit={submitForm}
                />
            </div>
        </EntityLayout>
    );
};

export default CategoryPage;
