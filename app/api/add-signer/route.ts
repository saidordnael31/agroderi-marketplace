import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userData } = body

    console.log("✍️ Adicionando signatário para:", userData.name)

    // Converter data de DD/MM/YYYY para YYYY-MM-DD
    const convertDateFormat = (dateString: string): string => {
      const [day, month, year] = dateString.split("/")
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }

    // URL da API externa
    const externalApiUrl =
      "https://api.agroderivative.tech/api/contracts/documents/d32a0375-2fce-4608-87c6-c521bd4ab591/add_signer_to_envelope_on_clicksign/"

    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    // Preparar dados do signatário
    const signerData = {
      name: userData.name,
      email: userData.email,
      birthday: convertDateFormat(userData.birthday), // Converter para YYYY-MM-DD
      phone_number: userData.phone.replace(/\D/g, ""), 
      documentation: userData.cpf,
    }

    console.log("📋 Dados do signatário:", JSON.stringify(signerData, null, 2))

    // Fazer a requisição para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(signerData),
    })

    console.log("📊 Status da resposta externa:", response.status)

    const responseData = await response.json()
    console.log("📦 Dados da resposta externa:", JSON.stringify(responseData, null, 2))

    if (response.ok) {
      console.log("✅ Signatário adicionado com sucesso!")

      return NextResponse.json(
        {
          success: true,
          message: "Signatário adicionado com sucesso",
          signer: responseData,
          signerData: signerData,
        },
        { status: 200 },
      )
    } else {
      console.error("❌ Erro ao adicionar signatário:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao adicionar signatário",
          details: responseData,
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("❌ Erro no proxy de adição de signatário:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "signer_addition_error",
      },
      { status: 500 },
    )
  }
}
