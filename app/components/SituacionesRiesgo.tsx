// components/SituacionesRiesgo.tsx
"use client";
import { useFormContext, useWatch } from "react-hook-form";

export function SituacionesRiesgo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const descripcionValue =
    useWatch({ name: "situacionesRiesgo.descripcion" }) || "";

  const palabras =
    descripcionValue.trim() === ""
      ? 0
      : descripcionValue.trim().split(/\s+/).filter(Boolean).length;

  const retosVirales = Number(
    useWatch({ name: "situacionesRiesgo.retosVirales" }) ?? 0,
  );
  const amenazas = Number(
    useWatch({ name: "situacionesRiesgo.amenazas" }) ?? 0,
  );
  const conflictosPares = Number(
    useWatch({ name: "situacionesRiesgo.conflictosPares" }) ?? 0,
  );
  const conflictividadDigital = Number(
    useWatch({ name: "situacionesRiesgo.conflictividadDigital" }) ?? 0,
  );
  const otrosRiesgos = Number(
    useWatch({ name: "situacionesRiesgo.otrosRiesgos" }) ?? 0,
  );

  const total =
    retosVirales +
    amenazas +
    conflictosPares +
    conflictividadDigital +
    otrosRiesgos;

  const srErrors = errors.situacionesRiesgo as
    | Record<string, { message?: string }>
    | undefined;

  const campos = [
    {
      name: "situacionesRiesgo.retosVirales",
      label:
        "Retos virales peligrosos: cantidad de desafios de redes sociales que pongan en riesgo la integridad.",
    },
    {
      name: "situacionesRiesgo.amenazas",
      label:
        "Amenazas de intimidación pública: Cantidad de casos de falsa alarma o situaciones de alteración de la convivencia escolar.",
    },
    {
      name: "situacionesRiesgo.conflictividadDigital",
      label:
        "Conflictividad en entornos digitales: Cantidad de casos de acoso entre pares o uso indebido de grupos de WhatsApp/redes.",
    },
    {
      name: "situacionesRiesgo.otrosRiesgos",
      label:
        "Otros riesgos institucionales: Cantidad de situaciones no contempladas en las anteriores que alteren la paz institucional.",
    },
  ];

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-amber-900 mb-1">
        Situaciones de Riesgo detectadas desde el 15/04/2026
      </h3>
      <p className="text-sm text-amber-700 mb-5">
        Ingrese la cantidad de casos detectados para cada categoría (0 si no
        hubo casos).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 items-start">
        {campos.map(({ name, label }) => {
          const fieldKey = name.split(".")[1];
          const fieldError = srErrors?.[fieldKey]?.message;
          return (
            <div key={name} className="flex flex-col justify-between h-full">
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
                {label}
              </label>
              <div>
                <input
                  type="number"
                  min="0"
                  {...register(name)}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    fieldError
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:ring-amber-200"
                  }`}
                />
                {fieldError && (
                  <p className="text-xs text-red-600 mt-1">{fieldError}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

     
    </section>
  );
}
