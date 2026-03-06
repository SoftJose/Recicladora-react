import { useEffect, useMemo, useState } from "react";
import EntityLayout from "../../components/layout/Entity/EntityLayout.jsx";
import { useAuth } from "../../hooks/useAuth";
import { WorkerServices } from "../../services/worker.services";
import { AuthService } from "../../services/auth.services";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, logout } = useAuth();

  const userId = useMemo(() => {
    const candidate = user?.id ?? user?.workerId ?? user?.usuariosId ?? user?.usuarioId;
    const n = Number(candidate);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [user]);

  const [form, setForm] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    direccion: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      cedula: user.cedula ?? "",
      nombres: user.nombres ?? "",
      apellidos: user.apellidos ?? "",
      direccion: user.direccion ?? "",
      email: user.email ?? "",
      telefono: user.telefono ?? "",
      username: user.username ?? "",
      password: "",
    }));
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);
    setErr(null);

    if (!userId) {
      setErr("No se pudo detectar tu ID de usuario.");
      setIsSaving(false);
      return;
    }

    try {
      // payload alineado a tu backend WorkersDto
      const payload = {
        cedula: form.cedula,
        nombres: form.nombres,
        apellidos: form.apellidos,
        direccion: form.direccion,
        email: form.email,
        telefono: form.telefono,
        username: form.username,
      };

      // Cambiar contraseña solo si escribe una nueva
      if (form.password?.trim()) payload.password = form.password;

      const updated = await WorkerServices.updateWorker(userId, payload);

      // Actualizar usuario en storage para que header muestre cambios
      AuthService.setUser(updated);
      setMsg("Perfil actualizado.");
      setForm((p) => ({ ...p, password: "" }));
    } catch (error_) {
      const message = error_?.message || "No se pudo actualizar el perfil";
      setErr(message);

      if (/401|unauthorized|sesión expirada/i.test(message)) {
        logout?.();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EntityLayout title="Mi perfil" icon="bi-person" showSearch={false} bodyClassName="entity-layout__body--scroll">
      <div className="profile-page">
        <div className="profile-page__card">
          <div className="profile-page__header">
            <div>
              <div className="profile-page__title">Tu información</div>
              <div className="profile-page__subtitle text-muted">
                Actualiza tus datos. La contraseña es opcional.
              </div>
            </div>
          </div>

          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-danger">{err}</div>}

          <form onSubmit={onSubmit} className="profile-page__form">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="profile-cedula">Cédula</label>
                <input id="profile-cedula" className="form-control" name="cedula" value={form.cedula} onChange={onChange} disabled />
                <div className="form-text">Por seguridad, la cédula no se edita aquí.</div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="profile-username">Usuario</label>
                <input id="profile-username" className="form-control" name="username" value={form.username} onChange={onChange} required />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="profile-nombres">Nombres</label>
                <input id="profile-nombres" className="form-control" name="nombres" value={form.nombres} onChange={onChange} required />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="profile-apellidos">Apellidos</label>
                <input id="profile-apellidos" className="form-control" name="apellidos" value={form.apellidos} onChange={onChange} required />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="profile-direccion">Dirección</label>
                <input id="profile-direccion" className="form-control" name="direccion" value={form.direccion} onChange={onChange} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="profile-email">Email</label>
                <input id="profile-email" className="form-control" type="email" name="email" value={form.email} onChange={onChange} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="profile-telefono">Teléfono</label>
                <input id="profile-telefono" className="form-control" name="telefono" value={form.telefono} onChange={onChange} />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="profile-password">Nueva contraseña (opcional)</label>
                <input id="profile-password" className="form-control" type="password" name="password" value={form.password} onChange={onChange} />
              </div>
            </div>

            <div className="profile-page__actions">
              <button className="btn btn-success" type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </EntityLayout>
  );
};

export default ProfilePage;

