// components/SituacionesRiesgo.tsx
"use client";
import { useFormContext } from "react-hook-form";

export function SituacionesRiesgo() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const sr = watch("situacionesRiesgo");
  const total =
    Number(sr?.retosVirales ?? 0) +
    Number(sr?.amenazas ?? 0) +
    Number(sr?.conflictosPares ?? 0) +
    Number(sr?.conflictividadDigital ?? 0) +
    Number(sr?.otrosRiesgos ?? 0);

  const srErrors = errors.situacionesRiesgo as Record<string, { message?: string }> | undefined;

  const campos = [
    { name: "situacionesRiesgo.retosVirales", label: "Retos virales peligrosos: cantidad de desafios de redes sociales que pongan en riesgo la integridad." },
    { name: "situacionesRiesgo.amenazas", label: "Amenazas de intimidación pública: Cantidad de casos de falsa alarma o situaciones de alteración de la convivencia escolar." },
    { name: "situacionesRiesgo.conflictosPares", label: "Conflictos graves entre pares: Cantidad de casos de acoso entre pares o uso indebido de grupos de WhatsApp/redes." },
    { name: "situacionesRiesgo.conflictividadDigital", label: "Conflictividad en entornos digitales: Cantidad de casos de acoso entre pares o uso indebido de grupos de WhatsApp/redes." },
    { name: "situacionesRiesgo.otrosRiesgos", label: "Otros riesgos institucionales: Cantidad de situaciones no contempladas en las anteriores que alteren la paz institucional." },
  ];

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-amber-900 mb-1">
        Situaciones de Riesgo
      </h3>
      <p className="text-sm text-amber-700 mb-5">
        Ingrese la cantidad de casos detectados para cada categoría (0 si no hubo casos).
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

      {/* Descripción obligatoria si total > 0 */}
      {total > 0 && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción cualitativa{" "}
            <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-1">
              (requerido porque hay casos registrados)
            </span>
          </label>
          <textarea
            rows={4}
            {...register("situacionesRiesgo.descripcion")}
            placeholder="Describa brevemente las situaciones de riesgo detectadas..."
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none ${
              srErrors?.descripcion?.message
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-amber-200"
            }`}
          />
          {srErrors?.descripcion?.message && (
            <p className="text-xs text-red-600 mt-1">
              {srErrors.descripcion.message}
            </p>
          )}
        </div>
      )}

      {total === 0 && (
        <p className="text-xs text-amber-600 mt-1 italic">
          Si registra casos, deberá agregar una descripción cualitativa.
        </p>
      )}
    </section>
  );
}