# Lectuaria Client

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/lectuaria)

Sistema tipo red social donde los lectores podrán crear reseñas y calificar libros, compartir libros y listas con amigos dentro y fuera del software. Además de buscar libros en las bibliotecas de Medellín y conocer su disponibilidad.

## Contenido

### Características principales

## Requisitos previos

## Instalación y configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Lectuaria-client
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Construir para Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```plain text
Lectuaria-client/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── config/              # Configuración de la aplicación
│   ├── constants/           # Constantes globales
│   ├── context/             # Contextos de React
│   ├── hooks/               # Hooks personalizados
│   ├── pages/               # Páginas de la aplicación
│   ├── routes/              # Configuración de rutas
│   ├── services/            # Servicios de API
│   ├── styles/              # Estilos globales
│   ├── types/               # Tipos TypeScript
│   ├── utils/               # Utilidades
│   ├── App.tsx              # Componente raíz
│   └── main.tsx             # Punto de entrada de la aplicación
├── public/                  # Archivos estáticos
├── .env                     # Variables de entorno
├── index.html               # Página HTML principal
├── package.json             # Dependencias y scripts
└── README.md                # Este archivo
```

## 📦 Dependencias Principales

* Axios
* MUI
* Emotion
* React-hook-form
* React-router-dom
* sass

## 📄 Licencia

Este proyecto es de propiedad privada. Todos los derechos reservados.
