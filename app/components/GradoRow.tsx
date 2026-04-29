// components/GradoRow.tsx
"use client";
import { useFormContext } from "react-hook-form";

interface GradoRowProps {
  prefix: string; // e.g. "grados.1°" or "ciclos.Ciclo Básico"
  label: string;  // e.g. "1° Año" or "Ciclo Básico"
}

export function GradoRow({ prefix, label }: GradoRowProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const matricula = Number(watch(`${prefix}.matricula`) ?? 0);
  const notificadas = Number(watch(`${prefix}.notificadas`) ?? 0);
  const acta = Number(watch(`${prefix}.actaSupletoria`) ?? 0);
  const ausentes = Number(watch(`${prefix}.ausentes`) ?? 0);
  const suma = notificadas + acta + ausentes;
  const hayError = matricula > 0 && suma !== matricula;

  const limitarTresCifras = (e: React.FormEvent<HTMLInputElement>) => {
  if (e.currentTarget.value.length > 3) {
    e.currentTarget.value = e.currentTarget.value.slice(0, 3);
  }
};

  // Navegar el objeto de errores dinámicamente
  const parts = prefix.split(".");
  let errObj: unknown = errors;
  for (const p of parts) {
    if (errObj && typeof errObj === "object") {
      errObj = (errObj as Record<string, unknown>)[p];
    } else break;
  }
  const sumaError = errObj && typeof errObj === "object"
    ? (errObj as Record<string, { message?: string }>)["_suma"]?.message
    : undefined;

  return (
    <div
      className={`border rounded-lg p-4 mb-3 transition-colors ${
        hayError
          ? "border-red-500 bg-red-50"
          : "border-gray-200 bg-white hover:border-blue-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-semibold text-sm ${hayError ? "text-red-700" : "text-gray-700"}`}>
          {label}
        </h4>
        {hayError && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            ⚠ Error de suma
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Matrícula total
          </label>
          <input
            type="number"
            min="0"
            {...register(`${prefix}.matricula`)}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              hayError
                ? "border-red-400 focus:ring-red-200 bg-red-50"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            onInput={limitarTresCifras}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Familias notificadas
          </label>
          <input
            type="number"
            min="0"
            {...register(`${prefix}.notificadas`)}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              hayError
                ? "border-red-400 focus:ring-red-200 bg-red-50"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            onInput={limitarTresCifras}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Acta supletoria
          </label>
          <input
            type="number"
            min="0"
            {...register(`${prefix}.actaSupletoria`)}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              hayError
                ? "border-red-400 focus:ring-red-200 bg-red-50"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            onInput={limitarTresCifras}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Familias ausentes
          </label>
          <input
            type="number"
            min="0"
            {...register(`${prefix}.ausentes`)}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              hayError
                ? "border-red-400 focus:ring-red-200 bg-red-50"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            onInput={limitarTresCifras}
          />
        </div>
      </div>

      {/* Verificador en tiempo real */}
      <div
        className={`mt-3 flex items-center gap-2 text-xs rounded-md px-3 py-1.5 ${
          matricula === 0
            ? "bg-gray-50 text-gray-400"
            : hayError
            ? "bg-red-100 text-red-700 font-semibold"
            : "bg-green-50 text-green-700"
        }`}
      >
        <span>Suma: {suma}</span>
        <span>/</span>
        <span>Matrícula: {matricula}</span>
        {matricula > 0 && (
          <span className="ml-auto">
            {hayError ? `❌ Diferencia: ${Math.abs(suma - matricula)}` : "✓ Correcto"}
          </span>
        )}
      </div>

      {sumaError && (
        <p className="text-xs text-red-600 mt-1 font-medium">{sumaError}</p>
      )}
    </div>
  );
}