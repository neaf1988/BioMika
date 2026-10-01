# BioMika PWA - Especificación General del Proyecto

## 1. Propósito del Producto
BioMika es una aplicación web progresiva (PWA) orientada al seguimiento cuantitativo y cualitativo de la composición corporal (peso, masa grasa, MME, perfiles antropométricos) y del bienestar diario a lo largo del tiempo.

## 2. Principios de Arquitectura
* **Offline-First & Serverless:** Todo el almacenamiento ocurre localmente en el navegador mediante **IndexedDB**. Sin dependencias de backend externo.
* **Privacidad Absoluta:** Los datos biométricos y personales permanecen cifrados/guardados de forma local en el dispositivo.
* **Instalabilidad PWA:** Cumplimiento de estándares W3C PWA para funcionamiento autónomo e instalable en iOS y Android.
* **React Ecosystem:** Interfaz reactiva basada en componentes modulares y gestión de estado local con Dexie hooks.

## 3. Pila Tecnológica (Tech Stack)
* **Build Tool:** Vite
* **Frontend:** React + Tailwind CSS
* **Base de Datos Local:** Dexie.js (Wrapper optimizado sobre IndexedDB)
* **PWA Engine:** `vite-plugin-pwa` (Service Worker + Web App Manifest)
* **Hosting:** GitHub Pages
