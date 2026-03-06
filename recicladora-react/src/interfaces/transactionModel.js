import {detailsMapper} from "./transactionDetailsModel.js";

export const transactionModel = {
    code: null,
    userId: null,
    personId: null,
    type: "",
    createdAt: null,
    details: []
}

export const transactionMapper = {

    toBackend(transaction) {
        return {
            tipo: transaction.type,
            personaId: transaction.personId,
            usuarioId: transaction.userId,
            detalles: (transaction.details ?? []).map(d =>
                detailsMapper.toBackend(d)
            )
        };
    },

    fromBackend(dto) {
        return {
            id: dto.id,
            code: dto.codigo,
            type: dto.tipo,
            total: dto.total,
            personId: dto.personaId,
            userId: dto.usuariosId,
            createdAt: dto.fecha ?? null,
            details: (dto.detalles ?? dto.details ?? []).map(detailsMapper.fromBackend),
        };
    }
};