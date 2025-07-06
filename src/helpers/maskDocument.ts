export function maskDocument(value: string): string {
  const clean = value.replace(/\D/g, '')

  if (clean.length === 11) {
    // CPF: 000.***.***-00
    return clean
      .replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.***.***-$4')
  }

  if (clean.length === 14) {
    // CNPJ: 00.***.***/****-00
    return clean
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.***.***/****-$5')
  }

  return value
}