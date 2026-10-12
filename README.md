# campusNova

Plataforma web cloud-native para la gestión y consulta centralizada de recursos académicos campusNova.

## Equipo
- Rivera Sánchez Damian / Equipo NOVACAMPUS
- Guzman Gonzalez Abigail / Equipo NOVACAMPUS
- Lopez Rivera Jose Manuel / Equipo NOVACAMPUS
- Velasco Zavala Gerardo Jesus / Equipo NOVACAMPUS
- De Jesus Sánchez Iran David / Equipo NOVACAMPUS

## Tecnologías
- Backend: Supabase (PostgreSQL + REST API)
- Base de datos: PostgreSQL (gestionada en la nube)
- Frontend: HTML5, CSS3, JavaScript Vanilla (ES6+)
- API de terceros: Supabase JS Client (https://supabase.com/docs)

## Requisitos previos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Extensión Live Server en VS Code o cualquier servidor de archivos estáticos

## Instalación
1. Clonar el repositorio: `git clone https://github.com/tu-usuario/campusNova.git`
2. Entrar a la carpeta del proyecto: `cd campusNova`
3. Instalar dependencias del backend (opcional): `cd backend && npm install`
4. Copiar `.env.example` a `.env` y completar los valores
5. Abrir la carpeta `frontend/` y ejecutar `index.html` con Live Server

## Variables de entorno
| Variable | Descripción | Ejemplo |
|----------|---------------------------------|-----------------------------------|
| PORT | Puerto del servidor backend | 3000 |
| SUPABASE_URL | URL del proyecto en Supabase | https://xyzcompany.supabase.co |
| SUPABASE_ANON_KEY| Llave pública de API del cliente| eyJhbGciOiJIUzI1NiIsInR5cCI6... |

## Endpoints

| Método | Ruta | Descripción | Códigos de respuesta |
|--------|--------------------------|----------------------------------------|----------------------|
| GET | /rest/v1/publicaciones | Obtiene el listado de publicaciones | 200 |
| POST | /rest/v1/publicaciones | Crea una nueva publicación | 201, 400 |
| GET | /rest/v1/departamentos | Consulta los departamentos del campus | 200 |
| GET | /rest/v1/salones | Consulta la información de salones | 200 |
| GET | /rest/v1/usuarios | Consulta el perfil de usuarios | 200 |
| POST | /auth/v1/token | Autenticación y generación de tokens | 200, 400 |

## Pruebas
Página 404 personalizada en `frontend/404.html`.

## Licencia
Distribuido bajo licencia MIT. Ver el archivo `LICENSE`.