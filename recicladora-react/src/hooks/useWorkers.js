import { useCallback, useEffect, useMemo, useState } from "react";
import { WorkerServices } from "../services/worker.services";
import { rolesServices } from "../services/rolesServices";

// Contrato:
// - Carga lista de workers + roles
// - Expone CRUD
// - Maneja loading/error

export const useWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWorkers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await WorkerServices.findAllWorkers();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Error cargando usuarios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      // Nota: rolesServices parece estar apuntando a otra base. Si falla, dejamos vacío.
      const data = await rolesServices.findAllRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    loadWorkers();
    loadRoles();
  }, [loadWorkers, loadRoles]);

  const createWorker = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await WorkerServices.createWorker(payload);
      await loadWorkers();
      return created;
    } catch (e) {
      setError(e?.message || "Error creando usuario");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [loadWorkers]);

  const updateWorker = useCallback(async (id, payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await WorkerServices.updateWorker(id, payload);
      await loadWorkers();
      return updated;
    } catch (e) {
      setError(e?.message || "Error actualizando usuario");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [loadWorkers]);

  const deleteWorker = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await WorkerServices.remove(id);
      await loadWorkers();
    } catch (e) {
      setError(e?.message || "Error eliminando usuario");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [loadWorkers]);

  const rolesById = useMemo(() => {
    const map = new Map();
    (roles || []).forEach((r) => {
      if (r?.id != null) map.set(String(r.id), r);
    });
    return map;
  }, [roles]);

  return {
    workers,
    roles,
    rolesById,
    isLoading,
    error,
    reload: loadWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
  };
};
