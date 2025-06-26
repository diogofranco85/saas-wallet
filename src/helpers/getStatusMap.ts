export const getStatusMap = (type: string) => {
  switch (type) {
    case 'active':
      return "Ativo"
    case 'pending':
      return "Pendente"
    case 'inactive':
      return "Inativo"
    case 'created':
      return "Criado"
    case 'cancelled':
      return "Cancelado"
    default: return type
  }
}