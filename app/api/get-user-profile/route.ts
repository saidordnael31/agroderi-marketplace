import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cpf = searchParams.get("cpf")

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }

    console.log("🔍 Buscando perfil para CPF:", cpf)

    // URL da API externa
    const externalApiUrl = `https://api.agroderivative.tech/api/users/profile-by-cpf/?cpf=${cpf}`

    console.log("🔗 URL completa da requisição:", externalApiUrl)

    const headers = {
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    console.log("📋 Headers enviados:", headers)

    // Fazer requisição com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

    let response
    try {
      response = await fetch(externalApiUrl, {
        method: "GET",
        headers: headers,
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error("❌ Erro na requisição fetch:", fetchError)

      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Timeout na requisição - API externa demorou para responder" },
          { status: 408 },
        )
      }

      return NextResponse.json(
        { error: "Erro de conexão com a API externa", details: fetchError.message },
        { status: 503 },
      )
    }

    clearTimeout(timeoutId)

    console.log("📊 Status da resposta da API externa:", response.status)

    if (response.ok) {
      const profileData = await response.json()
      console.log("✅ Dados do perfil obtidos com sucesso")

      // Log dos campos de depósito para debug
      console.log("💰 Depósito PIX:", profileData.deposit_value)
      console.log("🪙 Depósito Crypto Value:", profileData.deposit_crypto_value)
      console.log("🪙 Depósito Crypto Name:", profileData.deposit_crypto_name)

      // Retornar todos os dados incluindo os novos campos crypto
      return NextResponse.json({
        ...profileData,
        // Garantir que os campos crypto estejam presentes mesmo que sejam null
        deposit_crypto_value: profileData.deposit_crypto_value || null,
        deposit_crypto_name: profileData.deposit_crypto_name || null,
      })
    } else {
      const errorData = await response.text()
      console.error("❌ Erro na API externa:", response.status, errorData)

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Usuário não encontrado",
            details: "CPF não cadastrado no sistema",
            debug: { url: externalApiUrl, status: response.status },
          },
          { status: 404 },
        )
      }

      return NextResponse.json(
        {
          error: "Erro na API externa",
          details: errorData,
          debug: { url: externalApiUrl, status: response.status },
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("❌ Erro interno:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
        type: "internal_server_error",
      },
      { status: 500 },
    )
  }
}
