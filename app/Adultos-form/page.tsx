// app/adultos/page.tsx
"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaAdultos, defaultValuesAdultos, type FormValuesAdultos } from "@/schemas/formSchema";
import { FormHeader } from "../components/FormHeader";
import { CamposGenerales } from "../components/CamposGenerales";
import { GradoRow } from "../components/GradoRow";
import { SituacionesRiesgo } from "../components/SituacionesRiesgo";
import { SubmitButton } from "../components/SubmitButton";
import { SuccessMessage } from "../components/SuccessMessage";

const CICLOS = ["Ciclo Básico", "Ciclo Orientado"] as const;

export default function FormularioAdultos() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const methods = useForm<FormValuesAdultos>({
    resolver: zodResolver(schemaAdultos),
    defaultValues: defaultValuesAdultos,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = methods;

  const hasErrors = Object.keys(errors).length > 0;

  const onSubmit = async (data: FormValuesAdultos) => {
    setServerError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "adultos", data }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Error al enviar el formulario");
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Error de conexión. Intente nuevamente."
      );
    }
  };

  if (submitted) {
    return (
      <SuccessMessage
        nivel="Jóvenes y Adultos"
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
        <FormHeader nivel="Jóvenes y Adultos" />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CamposGenerales />

            <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800">
                  Relevamiento por Ciclo
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Verificar sumatorias
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-5">
                Para cada ciclo: notificadas + acta supletoria + ausentes debe ser igual a la matrícula total.
              </p>
              {CICLOS.map((ciclo) => (
                <GradoRow
                  key={ciclo}
                  prefix={`ciclos.${ciclo}`}
                  label={ciclo}
                />
              ))}
            </section>

            <div className="mb-6">
              <SituacionesRiesgo />
            </div>

            {serverError && (
              <div className="mb-4 bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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