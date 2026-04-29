// app/secundaria/page.tsx
"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  schemaSecundaria,
  defaultValuesSecundaria,
  type FormValuesSecundaria,
} from "@/schemas/formSchema";
import { FormHeader } from "../components/FormHeader";
import { CamposGenerales } from "../components/CamposGenerales";
import { GradoRow } from "../components/GradoRow";
import { SituacionesRiesgo } from "../components/SituacionesRiesgo";
import { SuccessMessage } from "../components/SuccessMessage";
import { SubmitButton } from "../components/SubmitButton";
import { ResponsablesContacto } from "../components/ResponsableContacto";

const GRADOS = ["1°", "2°", "3°", "4°", "5°", "6°"] as const;

export default function FormularioSecundaria() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const methods = useForm<FormValuesSecundaria>({
    resolver: zodResolver(schemaSecundaria),
    defaultValues: defaultValuesSecundaria,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = methods;

  const hasErrors = Object.keys(errors).length > 0;

  const onSubmit = async (data: FormValuesSecundaria) => {
    setServerError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "secundaria", data }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Error al enviar el formulario");
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Error de conexión. Intente nuevamente.",
      );
    }
  };

  if (submitted) {
    return (
      <SuccessMessage
        nivel="Secundaria"
        onReset={() => {
          reset();
          setSubmitted(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <FormHeader nivel="Secundaria" />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CamposGenerales mostrarModalidad mostrarCorreoElectronico tipoSedes="secundaria"/>

            <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800">
                  Relevamiento por Año
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-5">
                Para cada año: notificadas + acta supletoria + ausentes debe ser
                igual a la matrícula total.
              </p>
              {GRADOS.map((grado) => (
                <GradoRow
                  key={grado}
                  prefix={`grados.${grado}`}
                  label={`${grado} Año`}
                />
              ))}
            </section>

            <div className="mb-6">
              <SituacionesRiesgo />
            </div>

            {/* Situaciones no contempladas */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situaciones no contempladas{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                ¿Identifica en la institución situaciones, conductas o
                dinámicas que generan tensión o preocupación en la
                comunidad educativa, que aún no estén contempladas en los
                protocolos existentes o que todavía no sabés bien cómo
                nombrarlas ni a quién derivarlas? Por favor, relatar con sus palabras.
              </p>
              <textarea
                {...methods.register("situacionesNoContempladas")}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Describí la situación con tus palabras..."
              />
            </section>

            <ResponsablesContacto/>

            {serverError && (
              <div className="mb-4 bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <svg
                  className="w-5 h-5 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">Error al enviar</p>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <SubmitButton isLoading={isSubmitting} hasErrors={hasErrors} />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
