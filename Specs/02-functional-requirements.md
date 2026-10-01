# Requisitos Funcionales y Reglas de Negocio - BioMika

## RF-01: Configuración de Perfil de Usuario
* **RF-01.1:** Guardar Fecha de Nacimiento (YYYY-MM-DD), Estatura (cm) y Sexo Biológico (Masculino / Femenino).
* **RF-01.2:** Calcular la Edad de forma dinámica a partir de la Fecha de Nacimiento.
* **RF-01.3:** Permitir la actualización de estos parámetros base en cualquier momento.

## RF-02: Registro de Mediciones y Bienestar (Periódico)
* **RF-02.1: Campo Obligatorio:**
  * Peso (kg)
* **RF-02.2: Perímetros Corporales (Opcionales - cm):**
  * Espalda, Cintura, Cola (Cadera), Pierna, Brazo, Cuello.
* **RF-02.3: Composición Corporal Directa (Opcionales):**
  * Masa Grasa (kg o %), Masa Muscular Esquelética - MME (kg).
* **RF-02.4: Registro de Contexto y Bienestar (Cualitativo - Opcionales):**
  * Nivel de Energía (Escala 1 a 5).
  * Calidad de Sueño (Escala 1 a 5).
  * Notas / Contexto (ej. "Día de ayuno", "Inicio de período menstrual", "Post-entrenamiento").

## RF-03: Indicadores y Métricas Calculadas Automáticamente
A partir del perfil y la medición ingresada, la app calcula en tiempo real:
* **IMC (Índice de Masa Corporal):** $IMC = \frac{Peso (kg)}{Estatura (m)^2}$
* **RCE / WHtR (Relación Cintura-Estatura):** $RCE = \frac{Cintura (cm)}{Estatura (cm)}$
* **RCC / WHR (Relación Cintura-Cadera):** $RCC = \frac{Cintura (cm)}{Cola (cm)}$
* **Porcentaje de Grasa Corporal Calculado (Fórmula US Navy):**
  * *Hombres:* $\%Grasa = 86.010 \times \log_{10}(Cintura - Cuello) - 70.041 \times \log_{10}(Estatura) + 36.76$
  * *Mujeres:* $\%Grasa = 163.205 \times \log_{10}(Cintura + Cola - Cuello) - 97.684 \times \log_{10}(Estatura) - 78.387$
  *(Nota: Se calculará automáticamente si los campos de Cintura y Cuello [y Cola en mujeres] están presentes).*

## RF-04: Dashboard Comparativo ($M_n$ vs $M_{n-1}$)
* **RF-04.1:** Comparativa directa entre el último registro ($M_n$) y el inmediatamente anterior ($M_{n-1}$).
* **RF-04.2:** Diferenciales numéricos ($\Delta$) resaltados visualmente según la tendencia (disminución de grasa/cintura o aumento de MME).
