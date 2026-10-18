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

## Detener el proyecto
docker compose down

## Licencia
MIT (ver archivo LICENSE)