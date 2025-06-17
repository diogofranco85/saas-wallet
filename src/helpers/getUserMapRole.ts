export const getUserRoleMap = (type: string) => {
    switch (type) {
        case 'owner':
            return "Proprietário"
        case 'employee':
            return "Colaborador"
        case 'admin':
            return "Administrador"
        default: return type
    }
}