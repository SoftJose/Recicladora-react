export const PersonModel = {
    id: null,
    identify: "",
    surnames: "",
    name: "",
    address:"",
    email: "",
    phone: "",
    end_Consumer: true,
    supplier: false,
    client:false,
    startDate: null,
    updatedAt: null,
}

export const PersonMapper = {
    toBackend(person) {
        const payload = {
            cedula: person.identify,
            nombre: person.name, // 🔥 corregido
            apellidos: person.surnames,
            direccion: person.address,
            correo: person.email,
            telefono: person.phone,
            consumidorFinal: person.end_Consumer, // 🔥 corregido
            proveedor: person.supplier,
            cliente: person.client,
            fechaIngreso: person.startDate,
        };

        if (person.id) {
            payload.id = person.id;
        }

        return payload;
    },

    fromBackend(dto) {
        return {
            id: dto.id,
            identify: dto.cedula,
            name: dto.nombre, // 🔥 corregido
            surnames: dto.apellidos,
            address: dto.direccion,
            email: dto.correo,
            phone: dto.telefono,
            end_Consumer: dto.consumidorFinal, // 🔥 corregido
            supplier: dto.proveedor,
            client: dto.cliente,
            startDate: dto.fechaIngreso ?? null,
            updatedAt: dto.fechaActualizacion ?? null
        }
    }
}