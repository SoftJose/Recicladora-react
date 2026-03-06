export const transactionDetailsModel = {
    id: null,
    transactionId: null,
    transactionCode: "",
    clientName: "",
    endConsumer: null,
    materialId: null,
    materialName: "",
    quantity: null,
    price: null,
    subtotal: null,
};

export const detailsMapper = {
    toBackend(detail) {
        return {
            // El backend espera estos nombres (según tu Transaction mapper)
            materialId: detail.materialId,
            cantidad: detail.quantity,
            precioUnitario: detail.price,
        };
    },

    fromBackend(dto) {
        if (!dto) return { ...transactionDetailsModel };

        const quantity = dto.cantidad ?? dto.quantity ?? dto.cant ?? null;

        const price = dto.precioUnitario ?? dto.priceUnit ?? dto.price ?? null;

        const subtotal =
            dto.subtotal ??
            dto.totalLinea ??
            (quantity != null && price != null ? Number(quantity) * Number(price) : null);

        // ---------
        // Soporte para DTOs anidados (muy común en Spring/JPA)
        // ---------
        const tx =
            dto.transaccion ??
            dto.transaction ??
            dto.factura ??
            dto.invoice ??
            dto.fkTransacciones ??
            dto.fkTransaccion ??
            dto.fkFactura ??
            null;

        const person =
            dto.persona ??
            dto.person ??
            dto.cliente ??
            dto.proveedor ??
            tx?.persona ??
            tx?.person ??
            tx?.cliente ??
            tx?.proveedor ??
            null;

        const mat =
            dto.material ??
            dto.materiales ??
            dto.fkMateriales ??
            dto.fkMaterial ??
            null;

        const transactionId =
            dto.transactionId ??
            dto.facturaId ??
            dto.transaccionId ??
            dto.invoicesId ??
            tx?.id ??
            tx?.transactionId ??
            tx?.facturaId ??
            tx?.transaccionId ??
            null;

        const transactionCode =
            dto.transactionCode ??
            dto.codigo ??
            dto.invoiceCode ??
            dto.facturaCodigo ??
            dto.transaccionCodigo ??
            dto.codigoFactura ??
            tx?.codigo ??
            tx?.code ??
            tx?.transactionCode ??
            tx?.codigoFactura ??
            "";

        const clientName =
            dto.clientName ??
            dto.nombreCliente ??
            dto.personName ??
            dto.personaNombre ??
            person?.nombreCompleto ??
            person?.fullName ??
            (person?.nombre || person?.apellidos
                ? `${person?.nombre ?? ""} ${person?.apellidos ?? ""}`.trim()
                : "");

        const endConsumer =
            dto.endConsumer ??
            dto.consumidorFinal ??
            dto.end_Consumer ??
            person?.consumidorFinal ??
            person?.endConsumer ??
            null;

        const materialId =
            dto.materialId ??
            dto.materialesId ??
            dto.fkMaterialesId ??
            mat?.id ??
            mat?.materialId ??
            null;

        const materialName =
            dto.materialName ??
            dto.nombreMaterial ??
            dto.materialNombre ??
            mat?.materialName ??
            mat?.nombreMaterial ??
            mat?.nombre ??
            "";

        return {
            id: dto.id ?? null,
            transactionId,
            transactionCode,
            clientName,
            endConsumer,
            materialId,
            materialName,
            quantity,
            price,
            subtotal,
        };
    },
};