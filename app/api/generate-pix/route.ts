import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { value, cpf } = body

    console.log("📝 Dados recebidos para gerar PIX:", { value, cpf })

    // URL da API externa - ENDPOINT CORRETO
    const externalApiUrl = "https://api.agroderivative.tech/api/generate-fiat-deposit-qrcode/"

    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    const data = {
      value: Number.parseFloat(value),
      cpf: cpf,
    }

    console.log("📋 Dados enviados:", data)
    console.log("📋 Headers:", headers)

    // Fazer a requisição para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })

    console.log("📊 Status da resposta externa:", response.status)

    const responseData = await response.json()
    console.log("📦 Dados da resposta externa:", responseData)

    // Verificar se a resposta tem os campos esperados
    if (responseData.success && responseData.qrCode && responseData.paymentString) {
      console.log("✅ PIX gerado com sucesso!")
      console.log("🔗 QR Code recebido:", responseData.qrCode ? "✅" : "❌")
      console.log("💳 Payment String recebida:", responseData.paymentString ? "✅" : "❌")
    } else {
      console.log("⚠️ Resposta da API não contém todos os campos esperados")
    }

    // Retornar a resposta com o mesmo status
    return NextResponse.json(responseData, { status: response.status })
  } catch (error) {
    console.error("❌ Erro no proxy de geração PIX:", error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
        type: "pix_generation_error",
      },
      { status: 500 },
    )
  }
}
