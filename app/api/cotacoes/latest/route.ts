import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    if (!supabaseAdmin) {
      throw new Error("Configuração do Supabase não encontrada")
    }

    const { data, error } = await supabaseAdmin
      .from("cotacoes")
      .select("*")
      .order("data_coleta", { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      cotacoes: data,
    })
  } catch (error) {
    console.error("Erro ao buscar cotações:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao buscar cotações", error: error.message },
      { status: 500 },
    )
  }
}
