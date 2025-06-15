import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("📝 Dados recebidos no proxy:", body)

    // URL do servidor externo
    const externalApiUrl = "https://api.agroderivative.tech/api/users/register/"

    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    // Fazer a requisição para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("📊 Status da resposta externa:", response.status)

    const data = await response.json()
    console.log("📦 Dados da resposta externa:", data)

    // Retornar a resposta com o mesmo status
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("❌ Erro no proxy de registro:", error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
        type: "proxy_error",
      },
      { status: 500 },
    )
  }
}
