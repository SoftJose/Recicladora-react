
export const mapWorkerResponse = (data) => ({
    id: data.id,
    dni: data.cedula,
    firstName: data.nombres,
    lastName: data.apellidos,
    email: data.email,
    phone: data.telefono,
    address: data.direccion,
    username: data.username,
    roleId: data.roleId,
    roleName: data.roleName,
    active: data.estado,
    createdAt: data.fechaIngreso,
})

