// components/VulneracionDerechos.tsx
"use client";
import { useFormContext } from "react-hook-form";

export function VulneracionDerechos() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const detectados = watch("vulneracion.detectados");
  const vuln = errors.vulneracion as
    | Record<string, { message?: string }>
    | undefined;

  return (
    <section className="bg-rose-50 border border-rose-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-rose-900 mb-1">
        Vulneración de Derechos
      </h3>
      <p className="text-sm text-rose-700 mb-5">
        Indique si se detectaron casos de vulneración de derechos durante el operativo.
      </p>

      {/* Radio Si/No */}
      <fieldset className="mb-4">
        <legend className="text-sm font-medium text-gray-700 mb-2">
          ¿Se detectaron casos de vulneración de derechos?{" "}
          <span className="text-red-500">*</span>
        </legend>
        <div className="flex gap-6">
          {[
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                value={value}
                {...register("vulneracion.detectados")}
                className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-300"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-rose-700">
                {label}
              </span>
            </label>
          ))}
        </div>
        {vuln?.detectados?.message && (
          <p className="text-xs text-red-600 mt-1">{vuln.detectados.message}</p>
        )}
      </fieldset>

      {/* Campos adicionales si detectados = "si" */}
      {detectados === "si" && (
        <div className="space-y-4 border-t border-rose-200 pt-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de casos <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              {...register("vulneracion.cantidadCasos")}
              className={`w-full md:w-40 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                vuln?.cantidadCasos?.message
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-rose-200"
              }`}
            />
            {vuln?.cantidadCasos?.message && (
              <p className="text-xs text-red-600 mt-1">
                {vuln.cantidadCasos.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción de los casos <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              {...register("vulneracion.descripcion")}
              placeholder="Describa brevemente los casos de vulneración detectados..."
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none ${
                vuln?.descripcion?.message
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-rose-200"
              }`}
            />
            {vuln?.descripcion?.message && (
              <p className="text-xs text-red-600 mt-1">
                {vuln.descripcion.message}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}