import { NextRequest, NextResponse } from "next/server";
import {
  schemaPrimaria,
  schemaSecundaria,
  schemaAdultos,
} from "@/schemas/formSchema";
import {
  appendRow,
  appendRowByHeaders,
  buildPrimariaSheetRow,
  buildRowSecundaria,
  buildRowAdultos,
  existsRowByEmail,
} from "@/googleSheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo, data } = body;

    if (!tipo || !data) {
      return NextResponse.json(
        { success: false, message: "Datos invalidos: falta tipo o data" },
        { status: 400 }
      );
    }

    let row: (string | number)[] | null = null;
    let rowByHeaders: Record<string, string | number> | null = null;

    if (tipo === "primaria") {
      const parsed = schemaPrimaria.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Error de validacion en servidor",
            errors: parsed.error.flatten(),
          },
          { status: 422 }
        );
      }

      const duplicatedEmail = await existsRowByEmail(
        tipo,
        parsed.data.correoElectronico
      );

      if (duplicatedEmail) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ya existe un registro con ese correo electrónico. Verifique el email.",
          },
          { status: 409 }
        );
      }

      rowByHeaders = buildPrimariaSheetRow(
        parsed.data as Parameters<typeof buildPrimariaSheetRow>[0]
      );
    } else if (tipo === "secundaria") {
      const parsed = schemaSecundaria.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Error de validacion en servidor",
            errors: parsed.error.flatten(),
          },
          { status: 422 }
        );
      }

      rowByHeaders = buildRowSecundaria(
        parsed.data as Parameters<typeof buildRowSecundaria>[0]
      );
    } else if (tipo === "adultos") {
      const parsed = schemaAdultos.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Error de validacion en servidor",
            errors: parsed.error.flatten(),
          },
          { status: 422 }
        );
      }

      rowByHeaders = buildRowAdultos(  // 👈 rowByHeaders, no row
        parsed.data as Parameters<typeof buildRowAdultos>[0]
      );
    } else {
      return NextResponse.json(
        { success: false, message: `Tipo de formulario desconocido: ${tipo}` },
        { status: 400 }
      );
    }

    if (rowByHeaders) {
      await appendRowByHeaders(tipo, rowByHeaders);
    } else if (row) {
      await appendRow(tipo, row);
    } else {
      throw new Error("No se pudo construir la fila para Google Sheets");
    }

    return NextResponse.json({
      success: true,
      message: "Datos guardados correctamente",
    });
  } catch (error) {
    console.error("[API /submit] Error:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
