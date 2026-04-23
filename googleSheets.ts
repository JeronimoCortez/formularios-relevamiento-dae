import { google } from "googleapis";
import type { TipoFormulario } from "@/types";

type CellValue = string | number;

type GradoData = {
  matricula: number;
  notificadas: number;
  actaSupletoria: number;
  ausentes: number;
};

type SituacionesData = {
  retosVirales: number;
  amenazas: number;
  conflictosPares: number;
  conflictividadDigital: number;
  otrosRiesgos: number;
  descripcion: string;
};

type VulneracionData = {
  detectados: "si" | "no";
  cantidadCasos?: number;
  descripcion?: string;
};

type BaseFormData = Record<string, unknown> & {
  tipoGestion: string;
  departamento: string;
  escuela: string;
};

type FormDataPrimaria = BaseFormData & {
  correoElectronico: string;
  grados: Record<string, GradoData>;
  situacionesRiesgo: SituacionesData;
  vulneracion: VulneracionData;
};

type FormDataSecundaria = BaseFormData & {
  grados: Record<string, GradoData>;
  situacionesRiesgo: SituacionesData;
  vulneracion: VulneracionData;
};

type FormDataAdultos = BaseFormData & {
  ciclos: Record<string, GradoData>;
  situacionesRiesgo: SituacionesData;
  vulneracion: VulneracionData;
};

const SHEET_NAMES: Record<TipoFormulario, string> = {
  primaria: "primaria",
  secundaria: "Secundaria",
  adultos: "Adultos",
};

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Faltan variables de entorno: GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY"
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error("Falta variable de entorno: GOOGLE_SHEET_ID");
  }

  return spreadsheetId;
}

function getSheetsClient() {
  const auth = getAuth();

  return google.sheets({
    version: "v4",
    auth,
  });
}

function getTimestamp() {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Mendoza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return formatter.format(new Date()).replace(",", "");
}

function getSedeSupervision(data: Record<string, unknown>) {
  const sede =
    data["sedeSupervisión"] ??
    data["sedeSupervision"] ??
    data["sedeSupervisiÃ³n"];

  if (typeof sede !== "string") {
    return "";
  }

  return sede.trim();
}

function formatSedeSupervision(
  tipoGestion: string,
  sedeSupervision: string
) {
  if (!sedeSupervision) {
    return "";
  }

  if (sedeSupervision.includes("-")) {
    return sedeSupervision;
  }

  return `${sedeSupervision} - ${tipoGestion}`;
}

function validacionSuma(grado: GradoData) {
  return grado.notificadas + grado.actaSupletoria + grado.ausentes === grado.matricula
    ? "Si"
    : "No";
}

function gradoToRow(grado: GradoData): CellValue[] {
  return [
    grado.matricula,
    grado.notificadas,
    grado.actaSupletoria,
    grado.ausentes,
  ];
}

function situacionesToRow(situaciones: SituacionesData): CellValue[] {
  return [
    situaciones.retosVirales,
    situaciones.amenazas,
    situaciones.conflictosPares,
    situaciones.conflictividadDigital,
    situaciones.otrosRiesgos,
    situaciones.descripcion,
  ];
}

function vulneracionToRow(vulneracion: VulneracionData): CellValue[] {
  return [
    vulneracion.detectados === "si" ? "Si" : "No",
    vulneracion.cantidadCasos ?? 0,
    vulneracion.descripcion ?? "",
  ];
}

function camposBase(data: BaseFormData): CellValue[] {
  return [
    getTimestamp(),
    data.tipoGestion,
    getSedeSupervision(data),
    data.departamento,
    data.escuela,
  ];
}

async function getSheetHeaders(sheetName: string) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  const headers = response.data.values?.[0]?.map((value) => String(value).trim()) ?? [];

  if (headers.length === 0) {
    throw new Error(`La hoja "${sheetName}" no tiene encabezados en la fila 1`);
  }

  return headers;
}

export async function appendRow(
  tipo: TipoFormulario,
  values: CellValue[]
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = SHEET_NAMES[tipo];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
    insertDataOption: "INSERT_ROWS",
    valueInputOption: "RAW",
    requestBody: {
      values: [values],
    },
  });
}

export async function appendRowByHeaders(
  tipo: TipoFormulario,
  valuesByHeader: Record<string, CellValue>
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = SHEET_NAMES[tipo];
  const headers = await getSheetHeaders(sheetName);

  const row = headers.map((header) => valuesByHeader[header] ?? "");

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
    insertDataOption: "INSERT_ROWS",
    valueInputOption: "RAW",
    requestBody: {
      values: [row],
    },
  });
}

export function buildPrimariaSheetRow(data: FormDataPrimaria): Record<string, CellValue> {
  const sedeSupervision = formatSedeSupervision(
    data.tipoGestion,
    getSedeSupervision(data)
  );

  const row: Record<string, CellValue> = {
    "Marca temporal": getTimestamp(),
    "Dirección de correo electrónico": "",
    "Gestión a la que pertenece la institución educativa": data.tipoGestion,
    "Departamento en la que está ubicada la institución educativa": data.departamento,
    "Sección de supervisión a la que pertene la institución educativa": sedeSupervision,
    "Número de la institución (solo número sin guión)": data.escuela,
    "Retos Virales Peligrosos: Cantidad de desafíos de redes sociales que pongan en riesgo la integridad.":
      data.situacionesRiesgo.retosVirales,
    "Amenazas de Intimidación Pública: Cantidad de casos de falsa alarma o situaciones de alteración de la convivencia escolar.":
      data.situacionesRiesgo.amenazas,
    "Conflictividad en Entornos Digitales: Cantidad de casos de acoso entre pares o uso indebido de grupos de WhatsApp/redes.":
      data.situacionesRiesgo.conflictosPares + data.situacionesRiesgo.conflictividadDigital,
    "Otros Riesgos Institucionales: Cantidad de situaciones no contempladas en las anteriores que alteren la paz institucional.":
      data.situacionesRiesgo.otrosRiesgos,
    'Esta pregunta es obligatoria para quienes hayan reportado un número mayor a ""0"" en la sección anterior.\nDescriba brevemente las situaciones de riesgo identificadas, mencionando el carácter de la problemática':
      data.situacionesRiesgo.descripcion,
    "¿Se detectaron casos de vulneración de Derechos / Negligencia?":
      data.vulneracion.detectados === "si" ? "Si" : "No",
    "Si la respuesta es sí indicar la cantidad de casos donde se detectó omisión de cuidados y se requirió la intervención al ETI/Organismos de protección.":
      data.vulneracion.cantidadCasos ?? 0,
    "En caso de haber reportado vulneración de derechos, describa brevemente el carácter de las mismas.":
      data.vulneracion.descripcion ?? "",
  };

  const emailHeader = Object.keys(row).find((header) =>
    header.toLowerCase().includes("correo")
  );

  if (emailHeader) {
    row[emailHeader] = data.correoElectronico;
  }

  const gradosPrimaria = [
    {
      key: "1°",
      matricula: "Matrícula total de 1º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular)",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma)",
      ausentes: "Familias ausentes",
      valida:
        "Sume las tres categorías anteriores  (Notificadas + Actas Supletorias + Ausentes) y valide: ¿el número es igual a la matrícula?",
    },
    {
      key: "2°",
      matricula: "Matrícula total de 2º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 2",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 2",
      ausentes: "Familias ausentes 2",
      valida:
        "Sume las tres categorías anteriores  (Notificadas + Actas Supletorias + Ausentes) y valide: ¿el número es igual a la matrícula? 2",
    },
    {
      key: "3°",
      matricula: "Matrícula total de 3º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 3",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 3",
      ausentes: "Familias ausentes 3",
      valida:
        "Sume las tres categorías anteriores  (Notificadas + Actas Supletorias + Ausentes) y valide: ¿el número es igual a la matrícula? 3",
    },
    {
      key: "4°",
      matricula: "Matrícula total de 4º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 4",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 4",
      ausentes: "Familias ausentes 4",
      valida:
        "Sume las tres categorías anteriores  (Notificadas + Actas Supletorias + Ausentes) y valide: ¿el número es igual a la matrícula? 4",
    },
    {
      key: "5°",
      matricula: "Matrícula total de 5º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 5",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 5",
      ausentes: "Familias ausentes 5",
      valida:
        "Sume las tres categorías anteriores  (Notificadas + Actas Supletorias + Ausentes) y valide: ¿el número es igual a la matrícula? 5",
    },
    {
      key: "6°",
      matricula: "Matrícula total de 6º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 6",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 6",
      ausentes: "Familias ausentes 6",
      valida:
        "Sume las tres categorías anteriores  (Notificadas + Actas Supletorias + Ausentes) y valide: ¿el número es igual a la matrícula? 6",
    },
    {
      key: "7°",
      matricula: "Matrícula total de 7º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 7",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 7",
      ausentes: "Familias ausentes 7",
      valida:
        "Sume las tres categorías anteriores  (Notificadas + Actas Supletorias + Ausentes) y valide: ¿el número es igual a la matrícula? 7",
    },
  ] as const;

  for (const gradoInfo of gradosPrimaria) {
    const grado = data.grados[gradoInfo.key];

    row[gradoInfo.matricula] = grado.matricula;
    row[gradoInfo.notificadas] = grado.notificadas;
    row[gradoInfo.acta] = grado.actaSupletoria;
    row[gradoInfo.ausentes] = grado.ausentes;
    row[gradoInfo.valida] = validacionSuma(grado);
  }

  return row;
}

export function buildRowPrimaria(data: FormDataPrimaria): CellValue[] {
  const gradoKeys = ["1°", "2°", "3°", "4°", "5°", "6°", "7°"];
  const gradosRow = gradoKeys.flatMap((gradoKey) => gradoToRow(data.grados[gradoKey]));

  return [
    ...camposBase(data),
    ...gradosRow,
    ...situacionesToRow(data.situacionesRiesgo),
    ...vulneracionToRow(data.vulneracion),
  ];
}

export function buildRowSecundaria(data: FormDataSecundaria): CellValue[] {
  const gradoKeys = ["1°", "2°", "3°", "4°", "5°", "6°"];
  const gradosRow = gradoKeys.flatMap((gradoKey) => gradoToRow(data.grados[gradoKey]));

  return [
    ...camposBase(data),
    ...gradosRow,
    ...situacionesToRow(data.situacionesRiesgo),
    ...vulneracionToRow(data.vulneracion),
  ];
}

export function buildRowAdultos(data: FormDataAdultos): CellValue[] {
  const cicloKeys = ["Ciclo Básico", "Ciclo Orientado"];
  const ciclosRow = cicloKeys.flatMap((cicloKey) => gradoToRow(data.ciclos[cicloKey]));

  return [
    ...camposBase(data),
    ...ciclosRow,
    ...situacionesToRow(data.situacionesRiesgo),
    ...vulneracionToRow(data.vulneracion),
  ];
}
