import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Configuração do Supabase não encontrada")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar se a tabela existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("cotacoes")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (tableCheckError && !tableCheckError.message.includes("does not exist")) {
      throw new Error(`Erro ao verificar tabela: ${tableCheckError.message}`)
    }

    // Se a tabela não existir ou estiver vazia, retornar dados mockados
    if (tableCheckError || !tableExists) {
      console.log("Tabela não encontrada ou vazia, retornando dados mockados")
      return NextResponse.json({
        success: true,
        cotacoes: getMockCotacoes(),
        isMock: true,
      })
    }

    // Buscar cotações reais
    const { data, error } = await supabase
      .from("cotacoes")
      .select("*")
      .order("data_coleta", { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      cotacoes: data || [],
    })
  } catch (error) {
    console.error("Erro ao buscar cotações:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Erro ao buscar cotações: ${error.message}`,
        cotacoes: getMockCotacoes(),
        isMock: true,
      },
      { status: 200 }, // Retornamos 200 mesmo com erro para não quebrar a UI
    )
  }
}

// Função para gerar dados mockados para desenvolvimento
function getMockCotacoes() {
  const today = new Date().toISOString().split("T")[0]

  return [
    {
      id: 1,
      produto: "Soja (60kg)",
      local: "Sorriso - MT",
      preco: 125.5,
      data_coleta: today,
    },
    {
      id: 2,
      produto: "Milho (60kg)",
      local: "Chapadão do Sul - MS",
      preco: 65.3,
      data_coleta: today,
    },
    {
      id: 3,
      produto: "Café Arábica (60kg)",
      local: "Patrocínio - MG",
      preco: 1250.75,
      data_coleta: today,
    },
    {
      id: 4,
      produto: "Boi Gordo (@)",
      local: "São Paulo - SP",
      preco: 285.2,
      data_coleta: today,
    },
    {
      id: 5,
      produto: "Trigo (60kg)",
      local: "Cascavel - PR",
      preco: 78.45,
      data_coleta: today,
    },
  ]
}
