// components/CamposGenerales.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { DEPARTAMENTOS_MENDOZA } from "@/types";

type CamposGeneralesProps = {
  mostrarCorreoElectronico?: boolean;
};

export function CamposGenerales({
  mostrarCorreoElectronico = false,
}: CamposGeneralesProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const tipoGestion = watch("tipoGestion");

  const sedesEstatal = Array.from({ length: 60 }, (_, i) => String(i + 1));
  const sedesPrivada = Array.from({ length: 8 }, (_, i) => String(i + 1));
  const sedes = tipoGestion === "Privada" ? sedesPrivada : sedesEstatal;

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Datos del Establecimiento
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de gestión */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de gestión <span className="text-red-500">*</span>
          </label>
          <select
            {...register("tipoGestion")}
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${
              errors.tipoGestion
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          >
            <option value="">— Seleccione —</option>
            <option value="Estatal">Estatal</option>
            <option value="Privada">Privada</option>
          </select>
          {errors.tipoGestion?.message && (
            <p className="text-xs text-red-600 mt-1">
              {String(errors.tipoGestion.message)}
            </p>
          )}
        </div>

        {/* Sede de supervisión (dinámico) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sede de supervisión <span className="text-red-500">*</span>
          </label>
          <select
            {...register("sedeSupervisión")}
            disabled={!tipoGestion}
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.sedeSupervisión
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          >
            <option value="">
              {!tipoGestion ? "Seleccione primero el tipo de gestión" : "— Seleccione sede —"}
            </option>
            {sedes.map((s) => (
              <option key={s} value={s}>
                Sede {s}
              </option>
            ))}
          </select>
          {errors.sedeSupervisión?.message && (
            <p className="text-xs text-red-600 mt-1">
              {String(errors.sedeSupervisión.message)}
            </p>
          )}
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departamento <span className="text-red-500">*</span>
          </label>
          <select
            {...register("departamento")}
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${
              errors.departamento
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          >
            <option value="">— Seleccione departamento —</option>
            {DEPARTAMENTOS_MENDOZA.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.departamento?.message && (
            <p className="text-xs text-red-600 mt-1">
              {String(errors.departamento.message)}
            </p>
          )}
        </div>

        {/* Escuela */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numero del establecimiento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("escuela")}
            placeholder="Numero sin guiones"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.escuela
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          {errors.escuela?.message && (
            <p className="text-xs text-red-600 mt-1">
              {String(errors.escuela.message)}
            </p>
          )}
        </div>

        {mostrarCorreoElectronico && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electronico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("correoElectronico")}
              placeholder="correo@ejemplo.com"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.correoElectronico
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            />
            {errors.correoElectronico?.message && (
              <p className="text-xs text-red-600 mt-1">
                {String(errors.correoElectronico.message)}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
