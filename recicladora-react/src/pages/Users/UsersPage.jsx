import { useMemo, useState } from "react";
import EntityLayout from "../../components/layout/Entity/EntityLayout.jsx";
import { useWorkers } from "../../hooks/useWorkers";
import UsersModal from "./UsersModal";
import "./UsersPage.css";
import Permissions from "../../utils/permissions";

const safeStr = (v) => String(v ?? "");

const UsersPage = () => {
  const { workers, roles, isLoading, error, createWorker, updateWorker, deleteWorker } = useWorkers();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workers;

    return (workers || []).filter((w) => {
      const hay = [w?.username, w?.nombres, w?.apellidos, w?.cedula, w?.email, w?.fkRoles?.name, w?.roleName]
        .map((x) => safeStr(x).toLowerCase())
        .join("|");
      return hay.includes(q);
    });
  }, [workers, search]);

  const onNew = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const onEdit = (w) => {
    setEditing(w);
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async (payload) => {
    if (editing?.id) {
      await updateWorker(editing.id, payload);
    } else {
      await createWorker(payload);
    }
    setIsOpen(false);
  };

  const onDelete = async (w) => {
    if (!w?.id) return;
    const ok = confirm(`¿Eliminar usuario "${w.username || w.email || w.id}"?`);
    if (!ok) return;
    await deleteWorker(w.id);
  };

  void Permissions;

  return (
    <EntityLayout
      title="Usuarios"
      icon="bi-person-vcard"
      showSearch={true}
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="Nuevo Usuario"
      onAddClick={onNew}
      bodyClassName="entity-layout__body--scroll"
    >
      <div className="users-page">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="users-page__table-wrap table-responsive">
          <table className="table table-striped align-middle users-page__table">
            <thead className="table-success">
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Cargando...
                  </td>
                </tr>
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((w) => (
                  <tr key={w.id ?? w.username}>
                    <td>
                      <div className="fw-bold">{w.username}</div>
                      <div className="text-muted small">{w.email}</div>
                    </td>
                    <td>
                      {w.nombres} {w.apellidos}
                      <div className="text-muted small">{w.cedula}</div>
                    </td>
                    <td>
                      <span className="badge text-bg-success">
                        {w?.roleName ?? w?.fkRoles?.name ?? "SIN_ROL"}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => onEdit(w)}>
                          Editar
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(w)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <UsersModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        editing={editing}
        roles={roles}
      />
    </EntityLayout>
  );
};

export default UsersPage;

