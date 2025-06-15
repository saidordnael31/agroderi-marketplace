export function maskCPF(value: string): string {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, "")

  // Limita a 11 dígitos
  const limitedValue = cleanValue.slice(0, 11)

  // Aplica a máscara: 000.000.000-00
  if (limitedValue.length <= 3) {
    return limitedValue
  } else if (limitedValue.length <= 6) {
    return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3)}`
  } else if (limitedValue.length <= 9) {
    return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3, 6)}.${limitedValue.slice(6)}`
  } else {
    return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3, 6)}.${limitedValue.slice(6, 9)}-${limitedValue.slice(9)}`
  }
}

export function maskRG(value: string): string {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, "")

  // Limita a 9 dígitos (padrão comum para RG)
  const limitedValue = cleanValue.slice(0, 9)

  // Aplica a máscara: 00.000.000-0
  if (limitedValue.length <= 2) {
    return limitedValue
  } else if (limitedValue.length <= 5) {
    return `${limitedValue.slice(0, 2)}.${limitedValue.slice(2)}`
  } else if (limitedValue.length <= 8) {
    return `${limitedValue.slice(0, 2)}.${limitedValue.slice(2, 5)}.${limitedValue.slice(5)}`
  } else {
    return `${limitedValue.slice(0, 2)}.${limitedValue.slice(2, 5)}.${limitedValue.slice(5, 8)}-${limitedValue.slice(8)}`
  }
}

export function maskPhone(value: string): string {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, "")

  // Limita a 11 dígitos (com DDD)
  const limitedValue = cleanValue.slice(0, 11)

  // Aplica a máscara: (00) 00000-0000 ou (00) 0000-0000
  if (limitedValue.length <= 2) {
    return limitedValue.length ? `(${limitedValue}` : ""
  } else if (limitedValue.length <= 6) {
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2)}`
  } else if (limitedValue.length <= 10) {
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2, 6)}-${limitedValue.slice(6)}`
  } else {
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2, 7)}-${limitedValue.slice(7)}`
  }
}

export function unmaskValue(value: string): string {
  return value.replace(/\D/g, "")
}

export function maskDate(value: string): string {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, "")

  // Limita a 8 dígitos (DDMMAAAA)
  const limitedValue = cleanValue.slice(0, 8)

  // Aplica a máscara: DD/MM/AAAA
  if (limitedValue.length <= 2) {
    return limitedValue
  } else if (limitedValue.length <= 4) {
    return `${limitedValue.slice(0, 2)}/${limitedValue.slice(2)}`
  } else {
    return `${limitedValue.slice(0, 2)}/${limitedValue.slice(2, 4)}/${limitedValue.slice(4)}`
  }
}

export function validateDate(dateString: string): boolean {
  // Remove a máscara para validar
  const cleanDate = unmaskValue(dateString)

  if (cleanDate.length !== 8) return false

  const day = Number.parseInt(cleanDate.slice(0, 2))
  const month = Number.parseInt(cleanDate.slice(2, 4))
  const year = Number.parseInt(cleanDate.slice(4, 8))

  // Validações básicas
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  if (year < 1900 || year > new Date().getFullYear()) return false

  // Criar data para validação mais precisa
  const date = new Date(year, month - 1, day)

  // Verificar se a data é válida (ex: 31/02 seria inválida)
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year
}
