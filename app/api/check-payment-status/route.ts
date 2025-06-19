import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf } = body

    console.log("🔍 Verificando status do pagamento para CPF:", cpf)

    // URL da nova API - buscar perfil por CPF
    const externalApiUrl = `https://api.agroderivative.tech/api/users/profile-by-cpf/?cpf=${cpf}`

    console.log("🔗 Fazendo requisição GET para:", externalApiUrl)

    const headers = {
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    console.log("📋 Headers enviados:", headers)

    // Fazer a requisição GET para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "GET",
      headers: headers,
    })

    console.log("📊 Status da resposta externa:", response.status)
    console.log("📊 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    let responseData
    try {
      responseData = await response.json()
      console.log("📦 Dados da resposta externa:", JSON.stringify(responseData, null, 2))
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse da resposta:", parseError)
      const textResponse = await response.text()
      console.log("📄 Resposta como texto:", textResponse)

      return NextResponse.json(
        {
          success: false,
          confirmed: false,
          error: "Erro ao processar resposta da API",
          details: textResponse,
        },
        { status: 200 },
      )
    }

    // Verificar diferentes cenários de resposta
    if (response.status === 200 && responseData) {
      console.log("✅ Perfil do usuário encontrado!")

      // Verificar se há valor de depósito registrado
      const depositValue = responseData.deposit_value
      console.log("💰 Valor do depósito encontrado:", depositValue)

      if (depositValue && Number.parseFloat(depositValue) > 0) {
        console.log("✅ Pagamento confirmado! Valor do depósito:", depositValue)

        return NextResponse.json(
          {
            success: true,
            confirmed: true,
            message: "Pagamento confirmado",
            data: {
              user_id: responseData.id,
              username: responseData.username,
              email: responseData.email,
              first_name: responseData.first_name,
              last_name: responseData.last_name,
              cpf: responseData.cpf,
              whatsapp: responseData.whatsapp,
              rg: responseData.rg,
              deposit_value: responseData.deposit_value,
              contract_generated_successfully: responseData.contract_generated_successfully,
            },
          },
          { status: 200 },
        )
      } else {
        console.log("⏳ Usuário encontrado, mas sem depósito confirmado ainda")
        return NextResponse.json(
          {
            success: true,
            confirmed: false,
            message: "Usuário encontrado, mas pagamento ainda não foi processado",
            data: {
              user_id: responseData.id,
              email: responseData.email,
              deposit_value: responseData.deposit_value,
            },
          },
          { status: 200 },
        )
      }
    } else if (response.status === 404) {
      console.log("🔍 Usuário não encontrado (CPF não cadastrado)")
      return NextResponse.json(
        {
          success: true,
          confirmed: false,
          message: "Usuário não encontrado. Verifique se o CPF está correto.",
          data: null,
        },
        { status: 200 },
      )
    } else {
      console.log("❌ Erro na API externa:", response.status, responseData)
      return NextResponse.json(
        {
          success: false,
          confirmed: false,
          error: `Erro na API externa: ${response.status}`,
          data: responseData,
        },
        { status: 200 }, // Retornar 200 para não quebrar o fluxo
      )
    }
  } catch (error) {
    console.error("❌ Erro ao verificar status do pagamento:", error)

    // Retornar erro mas com status 200 para não quebrar o fluxo
    return NextResponse.json(
      {
        success: false,
        confirmed: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "payment_status_error",
      },
      { status: 200 },
    )
  }
}
