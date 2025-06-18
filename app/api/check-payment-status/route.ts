import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf } = body

    console.log("🔍 Verificando status do pagamento:", { cpf })

    // URL da API externa - GET endpoint
    const externalApiUrl = `https://api.agroderivative.tech/api/get-deposit-status/?cpf=${cpf}`

    console.log("🔗 Fazendo requisição GET para:", externalApiUrl)

    const headers = {
      "Accept": "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    console.log("📋 Headers:", headers)

    // Fazer a requisição GET para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "GET",
      headers: headers,
    })

    console.log("📊 Status da resposta externa:", response.status)

    const responseData = await response.json()
    console.log("📦 Dados da resposta externa:", responseData)

    // Se status 200, pagamento confirmado
    if (response.status === 200) {
      console.log("✅ Pagamento confirmado!")
      return NextResponse.json(
        {
          success: true,
          confirmed: true,
          message: "Pagamento confirmado",
          data: responseData,
        },
        { status: 200 },
      )
    } else {
      console.log("⏳ Pagamento ainda pendente...")
      return NextResponse.json(
        {
          success: true,
          confirmed: false,
          message: "Pagamento pendente",
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("❌ Erro ao verificar status do pagamento:", error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        success: false,
        confirmed: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "payment_status_error",
      },
      { status: 500 },
    )
  }
}
