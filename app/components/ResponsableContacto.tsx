"use client";
import { useFormContext } from "react-hook-form";

type ResponsableField = "responsable1" | "responsable2";

const LABELS: Record<1 | 2, string> = {
  1: "Persona responsable de la carga de datos ante situaciones emergentes",
  2: "Persona a cargo de la comunicación institucional frente a situaciones de crisis",
};

function ResponsableBlock({ index }: { index: 1 | 2 }) {
  const field: ResponsableField = `responsable${index}`;
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const err = (errors[field] as Record<string, { message?: string }>) ?? {};

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">
        {LABELS[index]}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre y apellido <span className="text-red-500">*</span>
          </label>
          <input
            id={`${field}.nombre`}
            type="text"
            {...register(`${field}.nombre`)}
            placeholder="Ej: María González"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              err.nombre
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          {err.nombre && (
            <p className="text-xs text-red-600 mt-1">{err.nombre.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            id={`${field}.correo`}
            type="email"
            {...register(`${field}.correo`)}
            placeholder="ejemplo@correo.com"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              err.correo
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          {err.correo && (
            <p className="text-xs text-red-600 mt-1">{err.correo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono de contacto <span className="text-red-500">*</span>
          </label>
          <input
            id={`${field}.telefono`}
            type="tel"
            {...register(`${field}.telefono`)}
            placeholder="Ej: 2614123456"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              err.telefono
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          {err.telefono && (
            <p className="text-xs text-red-600 mt-1">{err.telefono.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResponsablesContacto() {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Responsables de contacto
      </h3>

      <div className="space-y-6">
        <ResponsableBlock index={1} />
        <hr className="border-gray-100" />
        <ResponsableBlock index={2} />
      </div>
    </section>
  );
}