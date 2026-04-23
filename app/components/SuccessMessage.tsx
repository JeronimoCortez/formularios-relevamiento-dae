// components/SuccessMessage.tsx
"use client";

interface SuccessMessageProps {
  nivel: string;
  onReset: () => void;
}

export function SuccessMessage({ nivel, onReset }: SuccessMessageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white border border-green-200 rounded-2xl p-10 max-w-lg w-full text-center shadow-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Relevamiento enviado!
        </h2>
        <p className="text-gray-500 text-sm mb-1">
          El formulario del nivel <strong>{nivel}</strong> fue guardado correctamente.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Los datos quedaron registrados en el sistema provincial.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cargar otro establecimiento
          </button>
          <a
            href="/"
            className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}