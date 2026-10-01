# Prompts de Desarrollo por Fases - BioMika (Vite + React + Dexie)

## Fase 1: Setup del Proyecto e Infraestructura Dexie
> **Prompt para la IA:**
> "Crea un proyecto React con Vite, Tailwind CSS y Dexie.js. Configura la base de datos `BioMikaDB` siguiendo la estructura de `specs/03-data-schema.json`. Incluye la configuración de PWA mediante `vite-plugin-pwa`."

## Fase 2: Formulario de Perfil y Registro de Mediciones
> **Prompt para la IA:**
> "Lee `specs/02-functional-requirements.md`. Crea el formulario de perfil (Fecha de nacimiento, Estatura, Sexo) y el formulario de mediciones con peso obligatorio, perfiles antropométricos opcionales (incluyendo cuello), MME, grasa y la sección cualitativa (energía, sueño, notas)."

## Fase 3: Motor de Cálculos y Comparativa ($M_n$ vs $M_{n-1}$)
> **Prompt para la IA:**
> "Implementa la lógica de cálculo de métricas (IMC, WHR, WHtR y Porcentaje de Grasa por fórmula de la Marina de EE.UU. basada en cuello y cintura). Diseña la pantalla comparativa que confronte el último registro contra el anterior mostrando los deltas en verde/rojo."

## Fase 4: Exportación de Datos y Gráficas de Tendencia
> **Prompt para la IA:**
> "Añade una pestaña con gráficos (Chart.js / Recharts) para ver la evolución del peso, MME, % de grasa y nivel de energía. Incluye botones para exportar e importar la base de datos Dexie en JSON."
