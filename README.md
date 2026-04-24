# Relevamiento Provincial - Sistema de Formularios Educativos

## Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Zod + React Hook Form
- Google Sheets API

## Variables de entorno (.env.local)

```env
GOOGLE_CLIENT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1ABC...xyz
```

## Setup Google Cloud (paso a paso)

### 1. Crear proyecto en Google Cloud
1. Ir a https://console.cloud.google.com
2. Crear nuevo proyecto: "relevamiento-educativo"

### 2. Habilitar Google Sheets API
1. APIs & Services → Library
2. Buscar "Google Sheets API" → Enable

### 3. Crear Service Account
1. APIs & Services → Credentials
2. Create Credentials → Service Account
3. Nombre: "relevamiento-sa"
4. Role: Editor
5. Crear y descargar clave JSON

### 4. Obtener credenciales del JSON descargado
- `client_email` → GOOGLE_CLIENT_EMAIL
- `private_key` → GOOGLE_PRIVATE_KEY (incluir las comillas y \n)

### 5. Configurar Google Sheet
1. Crear nueva Google Sheet
2. Crear 3 hojas: "Primaria", "Secundaria", "Adultos"
3. Agregar encabezados en fila 1 de cada hoja (ver sección abajo)
4. Compartir la Sheet con el email del Service Account (rol: Editor)
5. Copiar el ID de la URL: docs.google.com/spreadsheets/d/**[ESTE_ES_EL_ID]**/edit

### 6. Encabezados de cada hoja Google Sheets

**Hoja "Primaria" - Fila 1:**
```
Timestamp | Tipo Gestión | Sede Supervisión | Departamento | Escuela | [Año 1°] Matrícula | [Año 1°] Notificadas | [Año 1°] Acta Supl. | [Año 1°] Ausentes | [Año 2°] Matrícula | [Año 2°] Notificadas | [Año 2°] Acta Supl. | [Año 2°] Ausentes | [Año 3°] Matrícula | [Año 3°] Notificadas | [Año 3°] Acta Supl. | [Año 3°] Ausentes | [Año 4°] Matrícula | [Año 4°] Notificadas | [Año 4°] Acta Supl. | [Año 4°] Ausentes | [Año 5°] Matrícula | [Año 5°] Notificadas | [Año 5°] Acta Supl. | [Año 5°] Ausentes | [Año 6°] Matrícula | [Año 6°] Notificadas | [Año 6°] Acta Supl. | [Año 6°] Ausentes | [Año 7°] Matrícula | [Año 7°] Notificadas | [Año 7°] Acta Supl. | [Año 7°] Ausentes | Retos Virales | Amenazas | Conflictos Pares | Conflictividad Digital | Otros Riesgos | Descripción Riesgos | Vulneración Derechos | Cantidad Casos | Descripción Vulneración
```

## Deploy en Vercel

1. Push el proyecto a GitHub
2. Ir a https://vercel.com → New Project → importar repo
3. En "Environment Variables" agregar las 3 variables:
   - GOOGLE_CLIENT_EMAIL
   - GOOGLE_PRIVATE_KEY
   - GOOGLE_SHEET_ID
4. Deploy

> ⚠️ Para GOOGLE_PRIVATE_KEY en Vercel: copiar el valor completo incluyendo
> los saltos de línea como \n, sin comillas externas.

## Estructura del proyecto

```
/app
  /page.tsx                    ← Landing con links a formularios
  /primaria/page.tsx
  /secundaria/page.tsx
  /adultos/page.tsx
  /api/submit/route.ts         ← API unificada
/components
  /FormWrapper.tsx
  /GradoRow.tsx
  /SituacionesRiesgo.tsx
  /VulneracionDerechos.tsx
  /SubmitButton.tsx
/hooks
  /useFormWithValidation.ts
/lib
  /googleSheets.ts
/schemas
  /formSchema.ts
/types
  /index.ts
```
