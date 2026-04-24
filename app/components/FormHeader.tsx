// components/FormHeader.tsx
interface FormHeaderProps {
  nivel: string;
}

export function FormHeader({ nivel }: FormHeaderProps) {
  return (
    <div className="bg-blue-900 text-white rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="shrink-0 bg-white/10 rounded-lg p-3">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-blue-300 text-xs font-medium uppercase tracking-widest mb-1">
            Dirección General de Escuelas · Mendoza
          </p>
          <h1 className="text-xl md:text-2xl font-bold leading-tight mb-2">
            Relevamiento Provincial: Operativo Territorial de Responsabilidad Parental,
            Acuerdos de Convivencia y Seguridad Integral
          </h1>
          <p className="text-blue-200 text-sm font-semibold">
            Formulario — Nivel {nivel}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-blue-700 pt-5 space-y-3">
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-3">
          <p className="text-yellow-200 text-xs font-bold uppercase tracking-wide mb-1">
            ⚖ Declaración Jurada
          </p>
          <p className="text-white/80 text-sm">
            El presente formulario tiene carácter de Declaración Jurada y tiene como objetivo
            relevar el cumplimiento del operativo de notificación de la Circular Institucional
            Obligatoria en todos los establecimientos educativos de la provincia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <p className="text-blue-300 text-xs font-medium mb-0.5">Responsable</p>
            <p className="text-white text-xs">Equipo directivo del establecimiento</p>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <p className="text-blue-300 text-xs font-medium mb-0.5">Período de carga</p>
            <p className="text-white text-xs font-semibold">07 al 13 de mayo de 2026</p>
          </div>
        </div>
      </div>
      <a href="/" className="inline-flex items-center justify-center gap-2 text-white-300 hover:text-blue-200 transition-colors mt-3">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al inicio
      </a>
    </div>
  );
}