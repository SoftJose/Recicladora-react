import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import "./UsersModal.css";

const emptyForm = {
  cedula: "",
  nombres: "",
  apellidos: "",
  direccion: "",
  email: "",
  telefono: "",
  username: "",
  password: "",
  roleId: "",
  estado: true,
};

const UsersModal = ({ isOpen, onClose, onSubmit, editing, roles }) => {
  const isEditing = Boolean(editing?.id);

  const initialForm = useMemo(() => {
    if (!editing) return emptyForm;
    return {
      ...emptyForm,
      cedula: editing.cedula ?? "",
      nombres: editing.nombres ?? "",
      apellidos: editing.apellidos ?? "",
      direccion: editing.direccion ?? "",
      email: editing.email ?? "",
      telefono: editing.telefono ?? "",
      username: editing.username ?? "",
      roleId: editing.roleId ?? editing?.fkRoles?.id ?? "",
      estado: editing.estado ?? true,
      password: "",
    };
  }, [editing]);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => setForm(initialForm), 0);
    return () => clearTimeout(t);
  }, [initialForm, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const roleOptions = useMemo(() => (Array.isArray(roles) ? roles : []), [roles]);

  if (!isOpen) return null;

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.roleId) {
      // Validación extra por si el navegador no aplica required (custom UI)
      return;
    }

    // Payload “conservador”: enviamos lo que el backend suele esperar
    const payload = {
      cedula: form.cedula,
      nombres: form.nombres,
      apellidos: form.apellidos,
      direccion: form.direccion,
      email: form.email,
      telefono: form.telefono,
      username: form.username,
      password: form.password,
      roleId: Number(form.roleId),
      estado: Boolean(form.estado),
    };

    // En edición, si password vacío no lo enviamos (evita reset involuntario)
    if (isEditing && !payload.password) {
      delete payload.password;
    }

    await onSubmit(payload);
  };

  const onCancel = (e) => {
    e.preventDefault();
    onClose?.();
  };

  return (
    <div className="users-modal__backdrop">
      <button
        type="button"
        className="users-modal__backdrop-btn"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <dialog className="users-modal__dialog" open aria-modal="true" onCancel={onCancel}>
        <div className="users-modal__content">
          <div className="users-modal__header">
            <div className="d-flex align-items-center gap-2">
              <div className="users-modal__icon">
                <i className="bi bi-person-badge"></i>
              </div>
              <h5 className="m-0">{isEditing ? "Editar usuario" : "Nuevo usuario"}</h5>
            </div>
            <button type="button" className="users-modal__close" onClick={onClose} aria-label="Cerrar">×</button>
          </div>

          <form onSubmit={submit}>
            <div className="users-modal__body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="user-cedula">Cédula</label>
                  <input id="user-cedula" className="form-control" name="cedula" value={form.cedula} onChange={onChange} required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="user-username">Usuario</label>
                  <input id="user-username" className="form-control" name="username" value={form.username} onChange={onChange} required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="user-nombres">Nombres</label>
                  <input id="user-nombres" className="form-control" name="nombres" value={form.nombres} onChange={onChange} required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="user-apellidos">Apellidos</label>
                  <input id="user-apellidos" className="form-control" name="apellidos" value={form.apellidos} onChange={onChange} required />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="user-direccion">Dirección</label>
                  <input id="user-direccion" className="form-control" name="direccion" value={form.direccion} onChange={onChange} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="user-email">Email</label>
                  <input id="user-email" className="form-control" type="email" name="email" value={form.email} onChange={onChange} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="user-telefono">Teléfono</label>
                  <input id="user-telefono" className="form-control" name="telefono" value={form.telefono} onChange={onChange} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="user-role">Rol</label>
                  <select
                    id="user-role"
                    className="form-select"
                    name="roleId"
                    value={form.roleId ?? ""}
                    onChange={onChange}
                    required
                    disabled={roleOptions.length === 0}
                  >
                    <option value="">Seleccione un rol</option>
                    {roleOptions.map((r) => (
                      <option key={r.id ?? r.name} value={r.id}>
                        {r.name ?? r.roleName ?? r.id}
                      </option>
                    ))}
                  </select>
                  {roleOptions.length === 0 ? (
                    <div className="alert alert-warning mt-2 mb-0">
                      No se pudieron cargar los roles. Revisa el endpoint de roles antes de crear/editar usuarios.
                    </div>
                  ) : (
                    <div className="form-text">Selecciona el rol del usuario.</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="user-password">{isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}</label>
                  <input id="user-password" className="form-control" type="password" name="password" value={form.password} onChange={onChange} required={!isEditing} />
                </div>

                <div className="col-12">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="users-active" name="estado" checked={Boolean(form.estado)} onChange={onChange} />
                    <label className="form-check-label" htmlFor="users-active">Usuario activo</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="users-modal__footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-success">{isEditing ? "Actualizar" : "Guardar"}</button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

UsersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editing: PropTypes.object,
  roles: PropTypes.array,
};

export default UsersModal;

