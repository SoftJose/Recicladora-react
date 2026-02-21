export const CategoryModel = {
    id: null,
    name: "",
    description: "",
    status: true,       // boolean, no string
    createdAt: null,    // solo lectura
};


export const CategoryMapper = {
    toBackend(category) {
        const payload = {
            nombre: category.name,
            descripcion: category.description,
            estado: category.status,
        };

        if (category.id) {
            payload.id = category.id;
        }

        return payload;
    },


    fromBackend(dto) {
        return {
            id: dto.id,
            name: dto.nombre,
            description: dto.descripcion,
            status: dto.estado,
            createdAt: dto.fechaIngreso,
        };
    },
};
