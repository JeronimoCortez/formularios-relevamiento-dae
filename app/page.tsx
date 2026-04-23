// app/page.tsx
import Link from "next/link";

const formularios = [
  {
    href: "/primaria-form",
    nivel: "Primaria",
    descripcion: "Grados 1° al 7°",
    color: "blue",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/secundaria-form",
    nivel: "Secundaria",
    descripcion: "Años 1° al 6°",
    color: "indigo",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    href: "/adultos-form",
    nivel: "Jóvenes y Adultos",
    descripcion: "Ciclo Básico y Orientado",
    color: "violet",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100 text-blue-700",
  indigo: "bg-indigo-50 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100 text-indigo-700",
  violet: "bg-violet-50 border-violet-200 hover:border-violet-400 hover:bg-violet-100 text-violet-700",
};

const iconBg: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  indigo: "bg-indigo-100 text-indigo-600",
  violet: "bg-violet-100 text-violet-600",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-300 text-xs font-medium uppercase tracking-widest mb-3">
            Ministerio de Educación · Mendoza
          </p>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
            Relevamiento Provincial
          </h1>
          <p className="text-blue-200 text-base">
            Operativo Territorial de Responsabilidad Parental,<br />
            Acuerdos de Convivencia y Seguridad Integral
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 rounded-lg px-4 py-2">
            <svg className="w-4 h-4 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-yellow-200 text-sm font-medium">
              Período de carga: 07 al 13 de mayo de 2026
            </span>
          </div>
        </div>
      </div>

      {/* Formularios */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-center text-gray-600 text-sm font-medium uppercase tracking-wider mb-8">
          Seleccione el nivel educativo
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {formularios.map(({ href, nivel, descripcion, color, icon }) => (
            <Link
              key={href}
              href={href}
              className={`border-2 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-150 group ${colorMap[color]}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBg[color]}`}>
                {icon}
              </div>
              <h3 className="font-bold text-lg mb-1">{nivel}</h3>
              <p className="text-sm opacity-70">{descripcion}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Completar formulario
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Instrucciones */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Instrucciones generales</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              Debe ser completado por el equipo directivo del establecimiento.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              Validar la trazabilidad de los datos antes de enviar.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              Verificar que las sumatorias por año/ciclo sean correctas.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              Este formulario tiene carácter de <strong>Declaración Jurada</strong>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}