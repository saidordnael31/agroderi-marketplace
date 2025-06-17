import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, value } = body

    console.log("🔍 Verificando status do pagamento:", { cpf, value })

    // URL da API externa
    const externalApiUrl =`https://api.agroderivative.tech/api/get-deposit-status/?cpf=${cpf}`;

    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }


    console.log("📋 Dados enviados:", data)

    // Fazer a requisição para o servidor externo
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
          data: responseData,
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
