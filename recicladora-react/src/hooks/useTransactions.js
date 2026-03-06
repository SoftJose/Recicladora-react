import { useEffect, useMemo, useState } from "react";
import { useClientsContext } from "../context/Clients/useClientsContext";
import { useMaterialsContext } from "../context/Material/useMaterialsContext";
import { useCategoriesContext } from "../context/Category/useCategoriesContext";
import { useAuth } from "./useAuth";
import { alert } from "../utils/alert";
import { PersonModel, PersonMapper } from "../interfaces/personModel.js";
import {transactionMapper} from "../interfaces/transactionModel.js";
import {ClientService} from "../services/clientsServices.js";
import {transactionService} from "../services/transactionService.js";

/**
 * Hook tipo "view-model" para la pantalla de facturación.
 * Aquí va TODA la lógica/estado para mantener `InvoicesPage` lo más presentacional posible.
 */
export const useTransactions = ({ defaultType = "VENTA" } = {}) => {
    const { clients } = useClientsContext();
    const { materials } = useMaterialsContext();
    const { categoriesById } = useCategoriesContext();
    const { user } = useAuth();

    const isDev = import.meta?.env?.DEV;
    const debug = (...args) => {
        if (!isDev) return;
        // eslint-disable-next-line no-console
        console.log("[useTransactions]", ...args);
    };


    // TIPO DE TRANSACCIÓN (VENTA | COMPRA)
    const [transactionType, setTransactionType] = useState(defaultType);

    // CLIENTE / PROVEEDOR
    const [clientModeWithData, setClientModeWithData] = useState(false);
    const [clientForm, setClientForm] = useState({ ...PersonModel });

    const consumidorFinal = useMemo(() => {
        const safe = Array.isArray(clients) ? clients : [];

        // Buscamos por la cédula que tu backend espera (9999999999)
        return safe.find((c) =>
            String(c?.identify) === "9999999999" ||
            c?.end_Consumer === true
        ) || null;
    }, [clients]);
    const CONSUMIDOR_FINAL_ID = consumidorFinal?.id ?? null;



    // Si cambio de tipo, limpiamos selección/datos para evitar mezclar cliente/proveedor
    useEffect(() => {
        setClientModeWithData(false);
        setClientForm({ ...PersonModel });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionType]);

    // Si NO se pide con datos y es VENTA, fijamos automáticamente la cédula del consumidor final (si existe)
    useEffect(() => {
        if (transactionType !== "VENTA") return;
        if (clientModeWithData) return;
        if (!consumidorFinal?.identify) return;

        // No pisar si el usuario ya escribió una cédula distinta
        if (clientForm.identify && String(clientForm.identify) !== String(consumidorFinal.identify)) {
            return;
        }

        setClientForm((prev) => ({
            ...prev,
            identify: String(consumidorFinal.identify),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionType, clientModeWithData, consumidorFinal]);

    // CLIENTE

    const onClientChange = (e) => {
        const { name, value } = e.target;
        setClientForm((prev) => ({ ...prev, [name]: value }));
    };

    const clientSelected = useMemo(() => {
        const safeClients = Array.isArray(clients) ? clients : [];
        if (!clientForm.identify) return null;
        return safeClients.find((c) => String(c.identify) === String(clientForm.identify)) || null;
    }, [clients, clientForm.identify]);

    // FACTURA / TRANSACCIÓN
    const sellerName = user?.name ?? user?.username ?? user?.email ?? "";
    const sellerId = user?.id ?? user?.userId ?? null;

    const [invoiceCode, setInvoiceCode] = useState("");
    const [codeError, setCodeError] = useState(null);

    const generateInvoiceCode = async () => {
        try {
            setCodeError(null);
            const code = await transactionService.generatedCode();
            const normalized = String(code || "").trim();
            setInvoiceCode(normalized);
            return normalized;
        } catch (e) {
            console.error(e);
            setInvoiceCode("");

            // Si el token está muerto, api.js lanza { code: SESSION_EXPIRED }
            if (e?.code === "SESSION_EXPIRED") {
                setCodeError("SESSION_EXPIRED");
                return null;
            }

            setCodeError("NO_CODE");
            alert.error("No se pudo generar el código de la transacción");
            return null;
        }
    };

    useEffect(() => {
        // Autogenera el código al entrar a la pantalla
        if (!invoiceCode && codeError !== "SESSION_EXPIRED") {
            generateInvoiceCode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (codeError === "SESSION_EXPIRED") return;
        // solo regenerar si ya existe uno (para distinguir por tipo) o si está vacío
        setInvoiceCode("");
        generateInvoiceCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionType]);

    // ITEMS
    const [materialQuery, setMaterialQuery] = useState("");
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [items, setItems] = useState([]);


    // Flag para no pisar el precio si el usuario lo editó manualmente
    const [isPriceOverridden, setIsPriceOverridden] = useState(false);

    const safeMaterials = useMemo(() => {
        // Nota: aquí no hacemos side-effects (console.log), solo normalizamos
        return Array.isArray(materials) ? materials : [];
    }, [materials]);

    const total = useMemo(() => {
        return items.reduce((acc, it) => acc + Number(it.subtotal || 0), 0);
    }, [items]);

    useEffect(() => {
        debug("materials loaded:", safeMaterials.length, safeMaterials.slice(0, 3));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeMaterials.length]);

    useEffect(() => {
        debug("selectedMaterialId changed:", selectedMaterialId);
    }, [selectedMaterialId]);

    useEffect(() => {
        debug("price changed:", price);
    }, [price]);

    useEffect(() => {
        if (transactionType === "COMPRA") {
            setClientModeWithData(true);
            return;
        }

        setClientModeWithData(total >= 50);
    }, [total, transactionType]);


    const getCategoryNameById = (categoryId) => {
        if (categoryId == null) return "";
        const c = categoriesById?.get?.(Number(categoryId));
        return c?.categoryName ?? c?.name ?? "";
    };

    const selectedMaterial = useMemo(() => {
        return safeMaterials.find((m) => Number(m.id) === Number(selectedMaterialId)) || null;
    }, [safeMaterials, selectedMaterialId]);

    const filteredMaterials = useMemo(() => {
        const q = materialQuery.toLowerCase();
        if (!q) return safeMaterials;
        return safeMaterials.filter((m) => {
            const name = (m?.materialName ?? "").toLowerCase();
            const code = (m?.code ?? "").toLowerCase();
            return name.includes(q) || code.includes(q);
        });
    }, [safeMaterials, materialQuery]);

    const subtotalPreview = useMemo(() => {
        const q = Number(quantity || 0);
        const p = Number(price || 0);
        return q * p;
    }, [quantity, price]);


    const selectMaterial = (material) => {
        if (!material) return;
        setSelectedMaterialId(material.id);
        setMaterialQuery(`${material.materialName} - ${material.code}`);

        // Solo autocompletar precio si el usuario no lo ha sobreescrito
        if (!isPriceOverridden) {
            setPrice(Number(material.price ?? 0));
        }
    };

    // Para usar con MaterialAutocomplete: onChange(valorString)
    const handleMaterialInput = (valueOrEvent) => {
        const value =
            typeof valueOrEvent === "string"
                ? valueOrEvent
                : valueOrEvent?.target?.value;

        debug("handleMaterialInput value:", value);
        setMaterialQuery(value || "");

        const raw = String(value || "").trim();
        if (!raw) {
            setSelectedMaterialId(null);
            return;
        }

    };

    const onPriceChange = (nextValue) => {
        setIsPriceOverridden(true);
        setPrice(nextValue);
    };

    const handleMaterialBlur = () => {
        const raw = String(materialQuery || "").trim();
        if (!raw) return;

        // Si ya hay un seleccionado válido, no hacemos nada
        if (selectedMaterialId) return;

        const lower = raw.toLowerCase();
        const matches = safeMaterials.filter((m) => {
            const name = String(m?.materialName || "").toLowerCase();
            const code = String(m?.code || "").toLowerCase();
            return name.includes(lower) || code.includes(lower);
        });

        // Si hay coincidencias, elegimos la primera (mejor experiencia que dejarlo vacío)
        if (matches.length > 0) {
            selectMaterial(matches[0]);
        }
    };

    const addMaterialItem = () => {
        if (!selectedMaterial) {
            alert.error("Selecciona un material de la lista", "Error");
            return;
        }

        if (transactionType === "VENTA" && Number(selectedMaterial.stock ?? 0) <= 0) {
            alert.error("No se puede vender un material sin stock", "Error");
            return;
        }

        const q = Number(quantity);
        const p = Number(price);

        if (!q || q <= 0) {
            alert.error("Ingresa una cantidad válida", "Error");
            return;
        }

        if (!p || p <= 0) {
            alert.error("Ingresa un precio válido", "Error");
            return;
        }

        if (transactionType === "VENTA" && q > Number(selectedMaterial.stock || 0)) {
            alert.error("Stock insuficiente", "Error");
            return;
        }

        // 🔥 Verificar si ya existe el material en la lista
        const existingItem = items.find(
            (it) => it.materialId === selectedMaterial.id
        );

        if (existingItem) {
            // Actualizamos cantidad y subtotal
            const updatedItems = items.map((it) => {
                if (it.materialId === selectedMaterial.id) {
                    const newQty = it.quantity + q;

                    if (
                        transactionType === "VENTA" &&
                        newQty > Number(selectedMaterial.stock)
                    ) {
                        alert.error("Stock insuficiente", "Error");
                        return it;
                    }

                    return {
                        ...it,
                        quantity: newQty,
                        subtotal: newQty * p,
                    };
                }
                return it;
            });

            setItems(updatedItems);
        } else {
            const newItem = {
                id: items.length + 1,
                materialId: selectedMaterial.id,
                code: selectedMaterial.code,
                materialName: selectedMaterial.materialName,
                categoryId: selectedMaterial.categoryId,
                categoryName: getCategoryNameById(selectedMaterial.categoryId),
                quantity: q,
                price: p,
                subtotal: q * p,
            };


            setItems((prev) => [...prev, newItem]);
        }

        // 🔄 Limpiar formulario
        setQuantity(0);
        setMaterialQuery("");
        setSelectedMaterialId(null);
        setIsPriceOverridden(false);
    };

    const removeItem = (rowId) => {
        setItems((prev) => prev.filter((it) => it.id !== rowId));
    };

    const validateClientSection = () => {
        const totalNumber = Number(total || 0);
        const isMandatory = transactionType === "COMPRA" || (transactionType === "VENTA" && totalNumber >= 50);

        if (isMandatory && !clientModeWithData) {
            alert.error("Para esta transacción es obligatorio ingresar los datos del cliente/proveedor.");
            return false;
        }


        if (!clientModeWithData) return true;

        if (!/^[0-9]{10}$/.test(String(clientForm.identify || ""))) {
            alert.error("La cédula debe tener 10 dígitos");
            return false;
        }
        if (!clientForm.name?.trim() || clientForm.name.trim().length > 45) {
            alert.error("Los nombres son requeridos (máx 45 caracteres)");
            return false;
        }
        if (!clientForm.surnames?.trim() || clientForm.surnames.trim().length > 45) {
            alert.error("Los apellidos son requeridos (máx 45 caracteres)");
            return false;
        }
        if (!clientForm.address?.trim() || clientForm.address.trim().length > 100) {
            alert.error("La dirección es requerida (máx 100 caracteres)");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(clientForm.email || ""))) {
            alert.error("El correo debe tener un formato válido");
            return false;
        }
        if (!/^[0-9]{7,15}$/.test(String(clientForm.phone || ""))) {
            alert.error("El teléfono debe contener entre 7 y 15 dígitos");
            return false;
        }

        return true;
    };

    const resetAll = async () => {
        setClientModeWithData(false);
        setClientForm({ ...PersonModel });
        setMaterialQuery("");
        setSelectedMaterialId(null);
        setQuantity(0);
        setPrice(0);
        setItems([]);

        // nuevo código para la siguiente transacción
        if (codeError !== "SESSION_EXPIRED") {
            await generateInvoiceCode();
        }
    };

    const saveTransaction = async () => {
        if (codeError === "SESSION_EXPIRED") {
            alert.error("Tu sesión expiró. Por favor vuelve a iniciar sesión.");
            return;
        }
        if (!validateClientSection()) return;
        if (!invoiceCode?.trim()) {
            alert.error("Ingresa/genera un código de factura");
            return;
        }
        if (!sellerId) {
            alert.error("No se pudo detectar el vendedor (usuario autenticado)");
            return;
        }
        if (items.length === 0) {
            alert.error("Agrega al menos un material");
            return;
        }

        let personId = clientSelected?.id ?? null;

        /* =====================================
           CREAR PERSONA SOLO SI ES NUEVO (MODO MANUAL)
        ===================================== */

        if (clientModeWithData) {
            // Si ya existe una persona con esa cédula, no permitir duplicado
            if (clientSelected) {
                alert.error("Ya existe un registro con esa cédula.");
                return;
            }

            try {
                const createPayloadFront = {
                    ...clientForm,
                    // Flags según el tipo en el modelo frontend
                    client: transactionType === "VENTA",
                    supplier: transactionType === "COMPRA",
                    end_Consumer: false,
                };

                const createdClient = await ClientService.createClient(
                    PersonMapper.toBackend(createPayloadFront)
                );

                // La API de /clientes/guardar debería devolver PersonDto
                personId = createdClient?.id ?? null;

                if (!personId) {
                    alert.error("No se pudo obtener el ID del registro creado.");
                    return;
                }
            } catch (error) {
                console.error(error);
                alert.error(
                    error?.message ||
                        "Error al guardar los datos. Verifique la cédula y campos requeridos."
                );
                return;
            }
        }

        /* ===========================
           REGLAS POR TIPO
           - VENTA:
             * total < 50: permitido Consumidor Final (si no pide con datos)
             * total >= 50: SI o SI debe ir con datos de cliente
           - COMPRA:
             * SI o SI debe ir con datos de proveedor (independiente del total)
        =========================== */

        const totalNumber = Number(total || 0);
        const requiresDataForVenta = totalNumber >= 50;

        if (transactionType === "VENTA") {
            if (requiresDataForVenta && !clientModeWithData) {
                alert.error("Si la venta es mayor o igual a $50, debes ingresar datos del cliente.");
                return;
            }

            if (!clientModeWithData) {
                /* Si no hay datos, intentamos usar el ID que el frontend encontró.
                   Si el frontend no lo encontró (CONSUMIDOR_FINAL_ID es null),
                   NO lanzamos error. Mandamos null al backend y él usará la cédula 9999999999.
                */
                personId = CONSUMIDOR_FINAL_ID;
            } else {
                if (!personId) {
                    alert.error("La venta con datos requiere seleccionar/crear un cliente.");
                    return;
                }

                if (clientSelected) {
                    const isCliente = clientSelected?.client === true;
                    const isConsumidorFinal = clientSelected?.end_Consumer === true;
                    if (!isCliente && !isConsumidorFinal) {
                        alert.error("Debes seleccionar un cliente válido para la venta.");
                        return;
                    }
                }
            }
        }

        if (transactionType === "COMPRA") {
            // Compra: siempre con datos
            if (!clientModeWithData && !personId) {
                alert.error("La compra requiere datos del proveedor (no se permite Consumidor Final).");
                return;
            }

            if (!personId) {
                alert.error("La compra requiere seleccionar/crear un proveedor.");
                return;
            }

            const selectedPerson = (Array.isArray(clients) ? clients : []).find(
                (c) => Number(c.id) === Number(personId)
            );

            if (!selectedPerson?.supplier) {
                alert.error("Debes seleccionar un proveedor válido para la compra.");
                return;
            }
        }

        // Solo bloquear compras sin proveedor
        if (transactionType === "COMPRA" && !personId) {
            alert.error("La compra requiere un proveedor.");
            return;
        }

        try {
            // Crear el objeto con los nombres que tu mapper espera
            const transactionData = {
                code: invoiceCode.trim(),  // El mapper lo ignora en toBackend (no se envía)
                type: transactionType,
                personId: personId,
                userId: sellerId,
                details: items.map((it) => ({
                    materialId: it.materialId,
                    quantity: it.quantity,
                    price: it.price
                }))
            };

            console.log("Transaction Data:", transactionData);

            // El mapper convierte a español automáticamente
            const backendPayload = transactionMapper.toBackend(transactionData);
            console.log("Backend Payload:", backendPayload);

            // Enviar usando el servicio
            await transactionService.createInvoice(transactionData); // El servicio debe usar el mapper internamente


            alert.success("Transacción y detalles guardados correctamente");
            await resetAll();
        } catch (e) {
            console.error(e);
            alert.error(e?.message || "No se pudo guardar la transacción");
        }
    };

    return {
        // tipo
        transactionType,
        setTransactionType,

        // cliente
        clientModeWithData,
        setClientModeWithData,
        clientForm,
        setClientForm,
        onClientChange,
        clientSelected,

        // vendedor/transacción
        sellerName,
        sellerId,
        invoiceCode,
        setInvoiceCode,
        generateInvoiceCode,

        // materiales/items
        filteredMaterials,
        materialQuery,
        setMaterialQuery,
        handleMaterialInput,
        handleMaterialBlur,
        selectMaterial,
        selectedMaterial,
        selectedMaterialId,
        setSelectedMaterialId,
        quantity,
        setQuantity,
        price,
        setPrice: onPriceChange,
        subtotalPreview,
        items,
        setItems,
        addMaterialItem,
        removeItem,
        total,

        // acción
        saveTransaction,

        // categorías
        getCategoryNameById,
    };
};
