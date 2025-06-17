import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { value, cpf } = body

    console.log("📝 Dados recebidos para gerar PIX:", { value, cpf })

    // URL da API externa
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
    console.log("📊 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    const responseData = await response.json()
    console.log("📦 Dados da resposta externa completos:", JSON.stringify(responseData, null, 2))

    if (response.ok) {
      // Verificar se os campos necessários estão presentes
      console.log("🔍 Verificando campos da resposta:")
      console.log("- qrCode:", responseData.qrCode ? "✅ Presente" : "❌ Ausente")

      console.log("- paymentString:", responseData.paymentString ? "✅ Presente" : "❌ Ausente")

      // Retornar resposta padronizada
      return NextResponse.json(
        {
          success: true,
          qrCode:`data:image/png;base64,${responseData.qrCode}`,
          paymentString:
            responseData.paymentString ||
            responseData.payment_string ||
            responseData.pix_code ||
            responseData.code ||
            null,
          originalData: responseData,
        },
        { status: 200 },
      )
    } else {
      console.error("❌ Erro na API externa:", responseData)
      return NextResponse.json(responseData, { status: response.status })
    }
  } catch (error) {
    console.error("❌ Erro no proxy de geração PIX:", error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "pix_generation_error",
      },
      { status: 500 },
    )
  }
}
