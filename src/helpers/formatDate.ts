export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  date.setHours(date.getHours() - 3) // Ajusta para o horário de Brasília (UTC-3)
  return date.toLocaleString("pt-BR")
}