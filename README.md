# campusNova

Plataforma y portal escolar integrando arquitectura distribuida con Docker Compose, NGINX como servidor web y API REST documentada con Swagger UI / OpenAPI.

## Requisitos
- [Docker Desktop](https://www.docker.com/) (incluye Docker Compose)
- [Git](https://git-scm.com/)

## Instalación y ejecución
1. Clonar el repositorio:
   git clone https://github.com/JomaLr/campusNova.git
   cd campusNova

2. Configurar las variables de entorno:
   cp .env.example .env
   (Editar el archivo .env agregando las credenciales correspondientes de Supabase/MySQL)

3. Levantar la aplicación con Docker Compose:
   docker compose up -d --build

## Accesos
- Frontend (NGINX): http://localhost:8080
- API Backend: http://localhost:3000
- Documentación Swagger UI: http://localhost:3000/api-docs

## Variables de entorno

| Variable | Descripción | Valor por defecto / Ejemplo |
| --- | --- | --- |
| PORT | Puerto de escucha del backend Express | 3000 |
| NODE_ENV | Entorno de ejecución de Node.js | development |
| SUPABASE_URL | URL del proyecto Supabase | https://tu-proyecto.supabase.co |
| SUPABASE_ANON_KEY | Clave pública anónima de Supabase | tu-anon-key |
| CORS_ORIGIN | Orígenes permitidos para peticiones CORS | * |
| LOG_LEVEL | Nivel de logs de la aplicación | info |

# Auditoría de Calidad y Distribución - campusNova

| Ítem | Criterio de Evaluación | Estado Inicial | Estado después de Práctica 2 | Evidencia / Ruta |
| --- | --- | --- | --- | --- |
| 1 | Dockerfile de Backend | Pendiente | OK | `backend/Dockerfile` |
| 2 | Uso de `.dockerignore` | Pendiente | OK | `backend/.dockerignore` |
| 3 | Orquestación con Docker Compose | Pendiente | OK | `docker-compose.yml` |
| 14 | Gestión de variables `.env` | Pendiente | OK | `.env.example` y `.gitignore` |
| 15 | Especificación OpenAPI | Pendiente | OK | `backend/openapi.yaml` |
| 16 | Documentación interactiva Swagger UI | Pendiente | OK | `http://localhost:3000/api-docs` |
| 17 | README.md con guía de instalación | Pendiente | OK | `README.md` |
| 18 | Versionado y Release | Pendiente | OK | Release `v1.0.0` en GitHub |

## Detener el proyecto
docker compose down

## Licencia
MIT (ver archivo LICENSE)