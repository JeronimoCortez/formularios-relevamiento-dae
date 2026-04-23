// components/SubmitButton.tsx
"use client";

interface SubmitButtonProps {
  isLoading: boolean;
  hasErrors: boolean;
}

export function SubmitButton({ isLoading, hasErrors }: SubmitButtonProps) {
  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 py-4 px-6 -mx-6 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-gray-500 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verifique las sumatorias antes de enviar. Este formulario tiene carácter de Declaración Jurada.
        </div>

        <button
          type="submit"
          disabled={isLoading || hasErrors}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm transition-all shadow-md ${
            isLoading || hasErrors
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-blue-700 hover:bg-blue-800 active:scale-95 text-white shadow-blue-200"
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Enviar Relevamiento
            </>
          )}
        </button>
      </div>

      {hasErrors && (
        <p className="text-xs text-red-600 mt-2 text-right">
          ⚠ Hay errores en el formulario. Corrija antes de enviar.
        </p>
      )}
    </div>
  );
}