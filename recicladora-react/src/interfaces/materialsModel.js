export const MaterialModel = {
    id: 0,
    code: "",
    materialName: "",
    description: "",
    stock: 0,
    price: 0,
    categoryId: null,
    userId: null,
    userName: "",
    categoryName: "",
    location: "",
    createdAt: null,
    updatedAt: null
}

export const MaterialMapper = {
    toBackend(material) {
        const payload = {
            codigo: material.code,
            nombreMaterial: material.materialName,
            descripcion: material.description,
            stock: material.stock,
            precio: material.price,
            categoriesId: material.categoryId,
            usuarioId: material.userId,
            ubicacion: material.location,
            fechaIngreso: material.createdAt,
        };
        if (material.id) {
            payload.id = material.id;
        }
        return payload;
    },
    fromBackend(dto) {
        return {
            id: dto.id,
            code: dto.codigo,
            materialName: dto.nombreMaterial,
            description: dto.descripcion,
            stock: dto.stock,
            price: dto.precio,
            categoryId: dto.categoriesId,
            userId: dto.usuarioId,
            location: dto.ubicacion,
        }
    }
}
