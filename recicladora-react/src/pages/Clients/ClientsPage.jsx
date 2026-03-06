import {useClientsForms} from "../../hooks/useClientsForms.js";
import {useEffect, useState} from "react";
import {usePagination} from "../../hooks/usePagination.js";
import EntityLayout from "../../components/layout/Entity/EntityLayout.jsx";
import clientsIcon from "../../assets/img/gestion-de-clientes.png";
import "./ClientsPage.css";

const ClientsPage = () => {
    const {
        clients,
    } = useClientsForms();

    const [searchTerm, setSearchTerm] = useState("");

    const q = searchTerm.toLowerCase();
    const safeClients = Array.isArray(clients) ? clients : [];

    const filteredClients = safeClients.filter((client) => {
        const name = (client?.name ?? "").toLowerCase();
        const identify = (client?.identify ?? "").toLowerCase();
        const surnames = (client?.surnames ?? "").toLowerCase();

        return name.includes(q) || identify.includes(q) || surnames.includes(q);
    });

    const {
        paginatedData,
        resetPage,
    } = usePagination(filteredClients, 10);

    useEffect(() => {
        resetPage();
    }, [searchTerm, resetPage]);

    return (
        <EntityLayout
            title="Gestión de Clientes"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            addBtnText={null}
            onAddClick={undefined}
            headerIcon={clientsIcon}
        >
            <div className="clients-page">
                <div className="clients-page__table-wrapper">
                    <table className="clients-table">
                        <thead className="clients-table__header">
                        <tr>
                            <th className="clients-table__th">Identificación</th>
                            <th className="clients-table__th">Nombres y Apellidos</th>
                            <th className="clients-table__th">Dirección</th>
                            <th className="clients-table__th">Correo</th>
                            <th className="clients-table__th">Teléfono</th>
                            <th className="clients-table__th">Consumidor Final</th>
                            <th className="clients-table__th">Fecha de Registro</th>
                        </tr>
                        </thead>
                        <tbody className="clients-table__body">
                        {paginatedData.length > 0 ? (
                            paginatedData.map(client => (
                                <tr key={client.id} className="clients-table__tr">
                                    <td
                                        data-label="Identificación"
                                        className={`clients-table__td fw-semibold ${client.identify.toLowerCase().includes(searchTerm.toLowerCase()) ? 'highlight' : ''}`}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className="category-icon me-3">
                                                <i className="bi bi-person-badge"></i>
                                            </div>
                                            {client.identify}
                                        </div>
                                    </td>

                                    <td
                                        data-label="Nombres y Apellidos"
                                        className={`clients-table__td ${(client.name + ' ' + client.surnames).toLowerCase().includes(searchTerm.toLowerCase()) ? 'highlight' : ''}`}
                                    >
                                        <span className="text-muted">{client.name} {client.surnames}</span>
                                    </td>

                                    <td data-label="Dirección" className="clients-table__td">{client.address}</td>
                                    <td data-label="Correo" className="clients-table__td">{client.email}</td>
                                    <td data-label="Teléfono" className="clients-table__td">{client.phone}</td>

                                    <td data-label="Consumidor Final" className="clients-table__td">
                                        <span className={`status-badge ${client.end_Consumer ? "active" : "inactive"}`}>
                                            <i className={`bi ${client.end_Consumer ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                            {client.end_Consumer ? "Sí" : "No"}
                                        </span>
                                    </td>

                                    <td data-label="Fecha de Registro" className="clients-table__td">
                                        {client.startDate ? new Date(client.startDate).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))
                        ) : null}
                        </tbody>
                    </table>
                </div>

                {paginatedData.length === 0 && (
                    <div className="clients-empty-state">
                        <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                        <p className="text-muted mb-0">
                            {searchTerm
                                ? 'No se encontraron clientes que coincidan con la búsqueda'
                                : 'No hay clientes registrados'}
                        </p>
                        {!searchTerm && (
                            <small className="text-muted">
                                Los clientes se registran desde la pantalla de Ventas/Transacciones.
                            </small>
                        )}
                    </div>
                )}
            </div>
        </EntityLayout>
    );
};

export default ClientsPage;
