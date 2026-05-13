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
  descripcion?: string;
};

type VulneracionData = {
  detectados: "si" | "no";
  cantidadCasos?: number;
  descripcion?: string;
};

type BaseFormData = Record<string, unknown> & {
  tipoGestion: string;
  departamento: string;
  nombreEstablecimiento: string;
  escuela: string;
  responsable1: { nombre: string; correo: string; telefono: string };
  responsable2: { nombre: string; correo: string; telefono: string };
};

type FormDataPrimaria = BaseFormData & {
  correoElectronico: string;
  grados: Record<string, GradoData>;
  situacionesRiesgo: SituacionesData;
  vulneracion: VulneracionData;
  situacionesNoContempladas?: string;
};

type FormDataSecundaria = BaseFormData & {
  grados: Record<string, GradoData>;
  situacionesRiesgo: SituacionesData;
  vulneracion: VulneracionData;
  situacionesNoContempladas?: string;
  modalidad?: string;
  correoElectronico: string;
};

type FormDataAdultos = BaseFormData & {
  correoElectronico: string;
  modalidad?: string;
  ciclos: Record<string, GradoData>;
  situacionesRiesgo: SituacionesData;
  vulneracion: VulneracionData;
  situacionesNoContempladas?: string;
};

type FormDataEducacionEspecial = BaseFormData & {
  correoElectronico: string;
  grados: Record<string, GradoData>;
  situacionesRiesgo: SituacionesData;
  vulneracion: VulneracionData;
  situacionesNoContempladas?: string;
};

const SHEET_NAMES: Record<TipoFormulario, string> = {
  primaria: "primaria",
  secundaria: "Secundaria",
  adultos: "Adultos",
  "educacion-especial": "educacion-especial",
};

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRY_ATTEMPTS = 4;
const writeQueueByFormType = new Map<TipoFormulario, Promise<void>>();

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getHttpStatusFromError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const maybeError = error as {
    code?: unknown;
    response?: {
      status?: unknown;
    };
  };

  if (typeof maybeError.response?.status === "number") {
    return maybeError.response.status;
  }

  if (typeof maybeError.code === "number") {
    return maybeError.code;
  }

  return undefined;
}

function isRetryableError(error: unknown) {
  const status = getHttpStatusFromError(error);
  return typeof status === "number" && RETRYABLE_STATUS_CODES.has(status);
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let attempt = 0;
  let delayMs = 200;

  while (true) {
    attempt += 1;
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableError(error) || attempt >= MAX_RETRY_ATTEMPTS) {
        throw error;
      }

      await sleep(delayMs);
      delayMs *= 2;
    }
  }
}

async function runQueuedWrite<T>(
  tipo: TipoFormulario,
  operation: () => Promise<T>
): Promise<T> {
  const previous = writeQueueByFormType.get(tipo) ?? Promise.resolve();

  const current = previous
    .catch(() => undefined)
    .then(operation);

  const settled = current.then(
    () => undefined,
    () => undefined
  );

  writeQueueByFormType.set(tipo, settled);

  try {
    return await current;
  } finally {
    if (writeQueueByFormType.get(tipo) === settled) {
      writeQueueByFormType.delete(tipo);
    }
  }
}

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
    situaciones.descripcion ?? "",
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

  const response = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    })
  );

  const headers = response.data.values?.[0]?.map((value) => String(value).trim()) ?? [];

  if (headers.length === 0) {
    throw new Error(`La hoja "${sheetName}" no tiene encabezados en la fila 1`);
  }

  return headers;
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getColumnLetter(index: number) {
  let dividend = index + 1;
  let column = "";

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    column = String.fromCharCode(65 + modulo) + column;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return column;
}

function findEmailHeaderIndex(headers: string[]) {
  return headers.findIndex((header) => {
    const normalizedHeader = normalizeText(header);

    return (
      normalizedHeader.includes("correo") ||
      normalizedHeader.includes("email") ||
      normalizedHeader.includes("e-mail")
    );
  });
}

export async function existsRowByEmail(
  tipo: TipoFormulario,
  email: string
): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = SHEET_NAMES[tipo];
  const headers = await getSheetHeaders(sheetName);
  const emailHeaderIndex = findEmailHeaderIndex(headers);

  if (emailHeaderIndex === -1) {
    throw new Error(
      `No se encontró una columna de correo electrónico en la hoja "${sheetName}"`
    );
  }

  const emailColumn = getColumnLetter(emailHeaderIndex);
  const response = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${emailColumn}2:${emailColumn}`,
    })
  );

  const values = response.data.values?.flat().map((value) => String(value)) ?? [];

  return values.some((value) => normalizeEmail(value) === normalizedEmail);
}

export async function appendRow(
  tipo: TipoFormulario,
  values: CellValue[]
): Promise<void> {
  await runQueuedWrite(tipo, async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();
    const sheetName = SHEET_NAMES[tipo];

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:ZZ`,
        insertDataOption: "INSERT_ROWS",
        valueInputOption: "RAW",
        requestBody: {
          values: [values],
        },
      })
    );
  });
}

export async function appendRowByHeaders(
  tipo: TipoFormulario,
  valuesByHeader: Record<string, CellValue>
): Promise<void> {
  await runQueuedWrite(tipo, async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();
    const sheetName = SHEET_NAMES[tipo];
    const headers = await getSheetHeaders(sheetName);

    const row = headers.map((header) => valuesByHeader[header] ?? "");

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:ZZ`,
        insertDataOption: "INSERT_ROWS",
        valueInputOption: "RAW",
        requestBody: {
          values: [row],
        },
      })
    );
  });
}

export async function appendRowByHeadersUniqueEmail(
  tipo: TipoFormulario,
  email: string,
  valuesByHeader: Record<string, CellValue>
): Promise<"appended" | "duplicate"> {
  return runQueuedWrite(tipo, async () => {
    const duplicated = await existsRowByEmail(tipo, email);
    if (duplicated) {
      return "duplicate";
    }

    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();
    const sheetName = SHEET_NAMES[tipo];
    const headers = await getSheetHeaders(sheetName);
    const row = headers.map((header) => valuesByHeader[header] ?? "");

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:ZZ`,
        insertDataOption: "INSERT_ROWS",
        valueInputOption: "RAW",
        requestBody: {
          values: [row],
        },
      })
    );

    return "appended";
  });
}

export function buildPrimariaSheetRow(data: FormDataPrimaria): Record<string, CellValue> {
  const sedeSupervision = formatSedeSupervision(
    data.tipoGestion,
    getSedeSupervision(data)
  );

  const row: Record<string, CellValue> = {
    "Marca temporal": getTimestamp(),
    "Dirección de correo electrónico": data.correoElectronico,
    "Gestión a la que pertenece la institución educativa": data.tipoGestion,
    "Departamento en la que está ubicada la institución educativa": data.departamento,
    "Sección de supervisión a la que pertene la institución educativa": sedeSupervision,
    "Nombre del establecimiento": data.nombreEstablecimiento,
    "Número de la institución (solo número sin guión)": data.escuela,
  };

  const gradosPrimaria = [
    {
      key: "1°",
      matricula: "Matrícula total de 1º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 1",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 1",
      ausentes: "Familias ausentes 1",
    },
    {
      key: "2°",
      matricula: "Matrícula total de 2º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 2",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 2",
      ausentes: "Familias ausentes 2",
    },
    {
      key: "3°",
      matricula: "Matrícula total de 3º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 3",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 3",
      ausentes: "Familias ausentes 3",
    },
    {
      key: "4°",
      matricula: "Matrícula total de 4º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 4",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 4",
      ausentes: "Familias ausentes 4",
    },
    {
      key: "5°",
      matricula: "Matrícula total de 5º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 5",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 5",
      ausentes: "Familias ausentes 5",
    },
    {
      key: "6°",
      matricula: "Matrícula total de 6º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 6",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 6",
      ausentes: "Familias ausentes 6",
    },
    {
      key: "7°",
      matricula: "Matrícula total de 7º GRADO: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 7",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 7",
      ausentes: "Familias ausentes 7",
    },
  ] as const;

  for (const gradoInfo of gradosPrimaria) {
    const grado = data.grados[gradoInfo.key];
    row[gradoInfo.matricula] = grado.matricula;
    row[gradoInfo.notificadas] = grado.notificadas;
    row[gradoInfo.acta] = grado.actaSupletoria;
    row[gradoInfo.ausentes] = grado.ausentes;
  }

  row["Retos Virales Peligrosos: Cantidad de desafíos de redes sociales que pongan en riesgo la integridad."] =
    data.situacionesRiesgo.retosVirales;
  row["Amenazas de Intimidación Pública: Cantidad de casos de falsa alarma o situaciones de alteración de la convivencia escolar."] =
    data.situacionesRiesgo.amenazas;
  row["Conflictividad en Entornos Digitales: Cantidad de casos de acoso entre pares o uso indebido de grupos de WhatsApp/redes."] =
    data.situacionesRiesgo.conflictosPares + data.situacionesRiesgo.conflictividadDigital;
  row["Otros Riesgos Institucionales: Cantidad de situaciones no contempladas en las anteriores que alteren la paz institucional."] =
    data.situacionesRiesgo.otrosRiesgos;
  row["Situaciones no contempladas en protocolos: Describí con tus palabras situaciones, conductas o dinámicas que generan tensión o preocupación en la comunidad educativa y que aún no sabés cómo nombrarlas o a quién derivarlas."] =
    data.situacionesNoContempladas ?? "";

  row["Persona responsable de la carga de datos ante situaciones emergentes: Nombre y apellido"] = data.responsable1.nombre;
  row["Persona responsable de la carga de datos ante situaciones emergentes: Correo electrónico"] = data.responsable1.correo;
  row["Persona responsable de la carga de datos ante situaciones emergentes: Teléfono de contacto"] = data.responsable1.telefono;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Nombre y apellido"] = data.responsable2.nombre;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Correo electrónico"] = data.responsable2.correo;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Teléfono de contacto"] = data.responsable2.telefono;

  return row;
}
export function buildRowEducacionEspecial(
  data: FormDataEducacionEspecial
): Record<string, CellValue> {
  const sedeSupervision = formatSedeSupervision(
    data.tipoGestion,
    getSedeSupervision(data)
  );

  const row: Record<string, CellValue> = {
    "Marca temporal": getTimestamp(),
    "Dirección de correo electrónico": data.correoElectronico,
    "Gestión a la que pertenece la institución educativa": data.tipoGestion,
    "Departamento en la que está ubicada la institución educativa": data.departamento,
    "Sección de supervisión a la que pertene la institución educativa": sedeSupervision,
    "Nombre del establecimiento": data.nombreEstablecimiento,
    "Número de la institución (solo número sin guión)": data.escuela,
  };

  const grado = data.grados["1\u00B0"];
  row["Matrícula total de 1º GRADO: (Tener en cuenta todas las secciones y turnos)"] =
    grado?.matricula ?? 0;
  row["Familias efectivamente notificadas (Firma de Circular) 1"] =
    grado?.notificadas ?? 0;
  row["Familias notificadas por Acta Supletoria (Negativa de firma) 1"] =
    grado?.actaSupletoria ?? 0;
  row["Familias ausentes 1"] = grado?.ausentes ?? 0;

  row["Retos Virales Peligrosos: Cantidad de desafíos de redes sociales que pongan en riesgo la integridad."] =
    data.situacionesRiesgo.retosVirales;
  row["Amenazas de Intimidación Pública: Cantidad de casos de falsa alarma o situaciones de alteración de la convivencia escolar."] =
    data.situacionesRiesgo.amenazas;
  row["Conflictividad en Entornos Digitales: Cantidad de casos de acoso entre pares o uso indebido de grupos de WhatsApp/redes."] =
    data.situacionesRiesgo.conflictosPares + data.situacionesRiesgo.conflictividadDigital;
  row["Otros Riesgos Institucionales: Cantidad de situaciones no contempladas en las anteriores que alteren la paz institucional."] =
    data.situacionesRiesgo.otrosRiesgos;
  row["Situaciones no contempladas en protocolos: Describí con tus palabras situaciones, conductas o dinámicas que generan tensión o preocupación en la comunidad educativa y que aún no sabés cómo nombrarlas o a quién derivarlas."] =
    data.situacionesNoContempladas ?? "";

  row["Persona responsable de la carga de datos ante situaciones emergentes: Nombre y apellido"] = data.responsable1.nombre;
  row["Persona responsable de la carga de datos ante situaciones emergentes: Correo electrónico"] = data.responsable1.correo;
  row["Persona responsable de la carga de datos ante situaciones emergentes: Teléfono de contacto"] = data.responsable1.telefono;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Nombre y apellido"] = data.responsable2.nombre;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Correo electrónico"] = data.responsable2.correo;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Teléfono de contacto"] = data.responsable2.telefono;

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


export function buildRowSecundaria(data: FormDataSecundaria): Record<string, CellValue> {
  const sedeSupervision = formatSedeSupervision(
    data.tipoGestion,
    getSedeSupervision(data)
  );

  const row: Record<string, CellValue> = {
    "Marca temporal": getTimestamp(),
    "Dirección de correo electrónico": data.correoElectronico ?? "",
    "Gestión a la que pertenece la institución educativa": data.tipoGestion,
    "Modalidad": data.modalidad ?? "",
    "Departamento en la que está ubicada la institución educativa": data.departamento,
    "Sección de supervisión a la que pertene la institución educativa": sedeSupervision,
    "Nombre del establecimiento": data.nombreEstablecimiento,
    "Número de la institución (solo número sin guión)": data.escuela,
  };

  const gradosSecundaria = [
    {
      key: "1°",
      matricula: "Matrícula total de 1º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 1",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 1",
      ausentes: "Familias ausentes 1",
    },
    {
      key: "2°",
      matricula: "Matrícula total de 2º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 2",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 2",
      ausentes: "Familias ausentes 2",
    },
    {
      key: "3°",
      matricula: "Matrícula total de 3º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 3",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 3",
      ausentes: "Familias ausentes 3",
    },
    {
      key: "4°",
      matricula: "Matrícula total de 4º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 4",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 4",
      ausentes: "Familias ausentes 4",
    },
    {
      key: "5°",
      matricula: "Matrícula total de 5º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 5",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 5",
      ausentes: "Familias ausentes 5",
    },
    {
      key: "6°",
      matricula: "Matrícula total de 6º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 6",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 6",
      ausentes: "Familias ausentes 6",
    },
  ] as const;

  for (const gradoInfo of gradosSecundaria) {
    const grado = data.grados[gradoInfo.key];
    row[gradoInfo.matricula] = grado.matricula;
    row[gradoInfo.notificadas] = grado.notificadas;
    row[gradoInfo.acta] = grado.actaSupletoria;
    row[gradoInfo.ausentes] = grado.ausentes;
  }

  row["Retos Virales Peligrosos: Cantidad de desafíos de redes sociales que pongan en riesgo la integridad."] =
    data.situacionesRiesgo.retosVirales;
  row["Amenazas de Intimidación Pública: Cantidad de casos de falsa alarma o situaciones de alteración de la convivencia escolar."] =
    data.situacionesRiesgo.amenazas;
  row["Conflictividad en Entornos Digitales: Cantidad de casos de acoso entre pares o uso indebido de grupos de WhatsApp/redes."] =
    data.situacionesRiesgo.conflictosPares + data.situacionesRiesgo.conflictividadDigital;
  row["Otros Riesgos Institucionales: Cantidad de situaciones no contempladas en las anteriores que alteren la paz institucional."] =
    data.situacionesRiesgo.otrosRiesgos;
  row["Situaciones no contempladas en protocolos: Describí con tus palabras situaciones, conductas o dinámicas que generan tensión o preocupación en la comunidad educativa y que aún no sabés cómo nombrarlas o a quién derivarlas."] =
    data.situacionesNoContempladas ?? "";
  row["Persona responsable de la carga de datos ante situaciones emergentes: Nombre y apellido"] = data.responsable1.nombre;
  row["Persona responsable de la carga de datos ante situaciones emergentes: Correo electrónico"] = data.responsable1.correo;
  row["Persona responsable de la carga de datos ante situaciones emergentes: Teléfono de contacto"] = data.responsable1.telefono;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Nombre y apellido"] = data.responsable2.nombre;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Correo electrónico"] = data.responsable2.correo;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Teléfono de contacto"] = data.responsable2.telefono;

  return row;
}


export function buildRowAdultos(data: FormDataAdultos): Record<string, CellValue> {
  const sedeSupervision = formatSedeSupervision(
    data.tipoGestion,
    getSedeSupervision(data)
  );

  const row: Record<string, CellValue> = {
    "Marca temporal": getTimestamp(),
    "Dirección de correo electrónico": data.correoElectronico ?? "",
    "Gestión a la que pertenece la institución educativa": data.tipoGestion,
    "Nivel": data.modalidad ?? "",
    "Departamento en la que está ubicada la institución educativa": data.departamento,
    "Sección de supervisión a la que pertene la institución educativa": sedeSupervision,
    "Nombre del establecimiento": data.nombreEstablecimiento,
    "Número de la institución (solo número sin guión)": data.escuela,
  };

  const ciclosAdultos = [
    {
      key: "1°",
      matricula: "Matrícula total de 1º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 1",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 1",
      ausentes: "Familias ausentes 1",
    },
    {
      key: "2°",
      matricula: "Matrícula total de 2º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 2",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 2",
      ausentes: "Familias ausentes 2",
    },
    {
      key: "3°",
      matricula: "Matrícula total de 3º Año: (Tener en cuenta todas las secciones y turnos)",
      notificadas: "Familias efectivamente notificadas (Firma de Circular) 3",
      acta: "Familias notificadas por Acta Supletoria (Negativa de firma) 3",
      ausentes: "Familias ausentes 3",
    },
  ] as const;

  for (const cicloInfo of ciclosAdultos) {
    const ciclo = data.ciclos[cicloInfo.key];
    row[cicloInfo.matricula] = ciclo.matricula;
    row[cicloInfo.notificadas] = ciclo.notificadas;
    row[cicloInfo.acta] = ciclo.actaSupletoria;
    row[cicloInfo.ausentes] = ciclo.ausentes;
  }

  row["Retos Virales Peligrosos: Cantidad de desafíos de redes sociales que pongan en riesgo la integridad."] =
    data.situacionesRiesgo.retosVirales;
  row["Amenazas de Intimidación Pública: Cantidad de casos de falsa alarma o situaciones de alteración de la convivencia escolar."] =
    data.situacionesRiesgo.amenazas;
  row["Conflictividad en Entornos Digitales: Cantidad de casos de acoso entre pares o uso indebido de grupos de WhatsApp/redes."] =
    data.situacionesRiesgo.conflictosPares + data.situacionesRiesgo.conflictividadDigital;
  row["Otros Riesgos Institucionales: Cantidad de situaciones no contempladas en las anteriores que alteren la paz institucional."] =
    data.situacionesRiesgo.otrosRiesgos;
  row["Situaciones no contempladas en protocolos: Describí con tus palabras situaciones, conductas o dinámicas que generan tensión o preocupación en la comunidad educativa y que aún no sabés cómo nombrarlas o a quién derivarlas."] =
    data.situacionesNoContempladas ?? "";

  row["Persona responsable de la carga de datos ante situaciones emergentes: Nombre y apellido"] = data.responsable1.nombre;
  row["Persona responsable de la carga de datos ante situaciones emergentes: Correo electrónico"] = data.responsable1.correo;
  row["Persona responsable de la carga de datos ante situaciones emergentes: Teléfono de contacto"] = data.responsable1.telefono;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Nombre y apellido"] = data.responsable2.nombre;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Correo electrónico"] = data.responsable2.correo;
  row["Persona a cargo de la comunicación institucional frente a situaciones de crisis: Teléfono de contacto"] = data.responsable2.telefono;
  return row;
}

