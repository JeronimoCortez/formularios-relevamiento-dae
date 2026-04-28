// schemas/formSchema.ts
import { z } from "zod";
import { DEPARTAMENTOS_MENDOZA } from "@/types";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const gradoSchema = z
  .object({
    matricula: z.coerce
      .number({ message: "Requerido" })
      .int("Debe ser entero")
      .min(0, "No puede ser negativo"),
    notificadas: z.coerce
      .number({ message: "Requerido" })
      .int("Debe ser entero")
      .min(0, "No puede ser negativo"),
    actaSupletoria: z.coerce
      .number({ message: "Requerido" })
      .int("Debe ser entero")
      .min(0, "No puede ser negativo"),
    ausentes: z.coerce
      .number({ message: "Requerido" })
      .int("Debe ser entero")
      .min(0, "No puede ser negativo"),
  })
  .superRefine((data, ctx) => {
    const suma = data.notificadas + data.actaSupletoria + data.ausentes;
    if (data.matricula > 0 && suma !== data.matricula) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La suma (${suma}) no coincide con la matrícula (${data.matricula})`,
        path: ["_suma"],
      });
    }
  });

const situacionesRiesgoSchema = z
  .object({
    retosVirales: z.coerce.number().int().min(0, "No puede ser negativo"),
    amenazas: z.coerce.number().int().min(0, "No puede ser negativo"),
    conflictosPares: z.coerce.number().int().min(0, "No puede ser negativo"),
    conflictividadDigital: z.coerce.number().int().min(0, "No puede ser negativo"),
    otrosRiesgos: z.coerce.number().int().min(0, "No puede ser negativo"),

  })
  .superRefine((data, ctx) => {
    const total =
      data.retosVirales +
      data.amenazas +
      data.conflictosPares +
      data.conflictividadDigital +
      data.otrosRiesgos;


  });

const vulneracionSchema = z
  .object({
    detectados: z.enum(["si", "no"]).refine(Boolean, {
      message: "Debe seleccionar una opción",
    }),
    cantidadCasos: z.coerce.number().int().min(0).optional(),
    descripcion: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.detectados === "si") {
      if (!data.cantidadCasos || data.cantidadCasos <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe indicar la cantidad de casos (mínimo 1)",
          path: ["cantidadCasos"],
        });
      }
      if (!data.descripcion || data.descripcion.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe describir los casos detectados (mínimo 10 caracteres)",
          path: ["descripcion"],
        });
      }
    }
  });

// ─── Base campos generales ────────────────────────────────────────────────────

const camposGeneralesSchema = z.object({
  tipoGestion: z.enum(["Estatal", "Privada"]),
  sedeSupervisión: z.string().min(1, "Debe seleccionar la sede de supervisión"),
  departamento: z.enum(DEPARTAMENTOS_MENDOZA),
  nombreEstablecimiento: z
    .string()
    .trim()
    .min(1, "Nombre del establecimiento requerido"),
  escuela: z
    .string()
    .min(2, "Numero de escuela requerido")
    .regex(/^[^-]*$/, "No se permiten guiones en el nombre"),
  situacionesRiesgo: situacionesRiesgoSchema,
  vulneracion: vulneracionSchema,
});

// ─── Esquemas por nivel ───────────────────────────────────────────────────────

const correoElectronicoSchema = z
  .string()
  .trim()
  .min(1, "Correo electronico requerido")
  .email("Debe ingresar un correo electronico valido");

const makeGradosSchema = (grados: readonly string[]) =>
  z.object(
    Object.fromEntries(grados.map((g) => [g, gradoSchema])) as Record<string, typeof gradoSchema>
  );

export const schemaPrimaria = camposGeneralesSchema.extend({
  situacionesNoContempladas: z.string().optional(),
  correoElectronico: correoElectronicoSchema,
  grados: makeGradosSchema(["1°", "2°", "3°", "4°", "5°", "6°", "7°"]),
});

export const schemaSecundaria = camposGeneralesSchema.extend({
  modalidad: z.enum(["Técnica", "Orientada"], { message: "Debe seleccionar una modalidad" }),
  situacionesNoContempladas: z.string().optional(),
  correoElectronico: correoElectronicoSchema,  // ✅ igual que primaria
  grados: makeGradosSchema(["1°", "2°", "3°", "4°", "5°", "6°"]),
});

export const schemaAdultos = camposGeneralesSchema.extend({
  ciclos: makeGradosSchema(["Ciclo Básico", "Ciclo Orientado"]),
});

export type FormValuesPrimaria = z.infer<typeof schemaPrimaria>;
export type FormValuesSecundaria = z.infer<typeof schemaSecundaria>;
export type FormValuesAdultos = z.infer<typeof schemaAdultos>;

// Default values helpers
const defaultGrado = { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 };

const defaultSituaciones = {
  retosVirales: 0,
  amenazas: 0,
  conflictosPares: 0,
  conflictividadDigital: 0,
  otrosRiesgos: 0,
  descripcion: "",
};

const defaultVulneracion = {
  detectados: "no" as const,
  cantidadCasos: 0,
  descripcion: "",
};

const defaultBase = {
  tipoGestion: undefined as unknown as "Estatal" | "Privada",
  sedeSupervisión: "",
  departamento: undefined as unknown as string,
  nombreEstablecimiento: "",
  escuela: "",
  situacionesRiesgo: defaultSituaciones,
  vulneracion: defaultVulneracion,
};

export const defaultValuesPrimaria: FormValuesPrimaria = {
  tipoGestion: "Estatal",
  correoElectronico: "",
  sedeSupervisión: "",
  departamento: DEPARTAMENTOS_MENDOZA[0],
  nombreEstablecimiento: "",
  escuela: "",
  situacionesRiesgo: {
    retosVirales: 0,
    amenazas: 0,
    conflictosPares: 0,
    conflictividadDigital: 0,
    otrosRiesgos: 0,
  },
  vulneracion: {
    detectados: "no",
    cantidadCasos: 0,
    descripcion: "",
  },
  grados: {
    "1°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "2°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "3°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "4°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "5°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "6°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "7°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
  },
  situacionesNoContempladas: "",
};

export const defaultValuesSecundaria: FormValuesSecundaria = {
  tipoGestion: "Estatal",
  sedeSupervisión: "",
  departamento: DEPARTAMENTOS_MENDOZA[0],
  nombreEstablecimiento: "",
  escuela: "",
  situacionesRiesgo: {
    retosVirales: 0,
    amenazas: 0,
    conflictosPares: 0,
    conflictividadDigital: 0,
    otrosRiesgos: 0,
  },
  vulneracion: {
    detectados: "no",
    cantidadCasos: 0,
    descripcion: "",
  },
  grados: {
    "1°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "2°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "3°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "4°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "5°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "6°": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
  },
  situacionesNoContempladas: "",
  modalidad: undefined as unknown as "Técnica" | "Orientada",
  correoElectronico: "",
};

export const defaultValuesAdultos: FormValuesAdultos = {
  tipoGestion: "Estatal",
  sedeSupervisión: "",
  departamento: DEPARTAMENTOS_MENDOZA[0],
  nombreEstablecimiento: "",
  escuela: "",
  situacionesRiesgo: {
    retosVirales: 0,
    amenazas: 0,
    conflictosPares: 0,
    conflictividadDigital: 0,
    otrosRiesgos: 0,
  },
  vulneracion: {
    detectados: "no",
    cantidadCasos: 0,
    descripcion: "",
  },
  ciclos: {
    "Ciclo Básico": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
    "Ciclo Orientado": { matricula: 0, notificadas: 0, actaSupletoria: 0, ausentes: 0 },
  },
};
