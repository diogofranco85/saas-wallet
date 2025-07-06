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
    case 'paid':
      return "Pago"
    default: return type
  }
}

export const getStatusDescriptionMap = (type: string) => {
  switch (type) {
    case 'active':
      return "Cobrança ativa, aguardando pagamento"
    case 'pending':
      return "Pagamento pendente, aguarde o cliente pagar"
    case 'inactive':
      return "Pagamento inativo, não será mais aceito"
    case 'created':
      return "Pagamento criado, aguardando ação do cliente"
    case 'cancelled':
      return "Pagamento cancelado, não será mais aceito"
    case 'paid':
      return "Pagamento realizado com sucesso"
    default: return type
  }
}