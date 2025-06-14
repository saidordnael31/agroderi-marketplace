// Configurações da API
export const API_CONFIG = {
  // Usar rotas internas do Next.js para evitar CORS
  baseUrl: "", // URL vazia para usar rotas relativas
  endpoints: {
    register: "/api/register", // Rota interna do Next.js
    login: "/api/login",
    // Adicione outros endpoints conforme necessário
  },
}

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`
  console.log("🔗 URL gerada:", fullUrl)
  return fullUrl
}

// Helper para fazer requisições com melhor tratamento de erro
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    console.log("📡 Fazendo requisição para:", url)
    console.log("📋 Opções:", options)

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    console.log("📊 Status da resposta:", response.status)
    console.log("📊 Status OK:", response.ok)

    const data = await response.json()
    console.log("📦 Dados recebidos:", data)

    return { response, data }
  } catch (error) {
    console.error("❌ Erro na requisição:", error)
    throw error
  }
}
