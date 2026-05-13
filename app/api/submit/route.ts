import { NextRequest, NextResponse } from "next/server";
import {
  schemaPrimaria,
  schemaSecundaria,
  schemaAdultos,
  schemaEducacionEspecial,
} from "@/schemas/formSchema";
import {
  appendRow,
  appendRowByHeaders,
  appendRowByHeadersUniqueEmail,
  buildPrimariaSheetRow,
  buildRowSecundaria,
  buildRowAdultos,
  buildRowEducacionEspecial,
} from "@/googleSheets";
import type { TipoFormulario } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo, data } = body as {
      tipo?: TipoFormulario;
      data?: Record<string, unknown>;
    };

    if (!tipo || !data) {
      return NextResponse.json(
        { success: false, message: "Datos invalidos: falta tipo o data" },
        { status: 400 }
      );
    }

    let row: (string | number)[] | null = null;
    let rowByHeaders: Record<string, string | number> | null = null;
    let uniqueEmailForDedup: string | null = null;

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

      rowByHeaders = buildPrimariaSheetRow(
        parsed.data as Parameters<typeof buildPrimariaSheetRow>[0]
      );
      uniqueEmailForDedup = parsed.data.correoElectronico;
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
      uniqueEmailForDedup = parsed.data.correoElectronico;
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

      rowByHeaders = buildRowAdultos(
        parsed.data as Parameters<typeof buildRowAdultos>[0]
      );
      uniqueEmailForDedup = parsed.data.correoElectronico;
    } else if (tipo === "educacion-especial") {
      const parsed = schemaEducacionEspecial.safeParse(data);
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

      rowByHeaders = buildRowEducacionEspecial(
        parsed.data as Parameters<typeof buildRowEducacionEspecial>[0]
      );
      uniqueEmailForDedup = parsed.data.correoElectronico;
    } else {
      return NextResponse.json(
        { success: false, message: `Tipo de formulario desconocido: ${tipo}` },
        { status: 400 }
      );
    }

    if (rowByHeaders && uniqueEmailForDedup) {
      const writeResult = await appendRowByHeadersUniqueEmail(
        tipo,
        uniqueEmailForDedup,
        rowByHeaders
      );

      if (writeResult === "duplicate") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ya existe un registro con ese correo electronico. Verifique el email.",
          },
          { status: 409 }
        );
      }
    } else if (rowByHeaders) {
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
