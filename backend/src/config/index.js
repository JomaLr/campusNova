require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

// 1. Validación de arranque
const requeridas = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const faltantes = requeridas.filter((v) => !process.env[v]);

if (faltantes.length > 0) {
  console.error(`❌ Faltan variables de entorno: ${faltantes.join(', ')}`);
  process.exit(1);
}

// 2. Exportación centralizada
const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  corsOrigin: process.env.CORS_ORIGIN,
  logLevel: process.env.LOG_LEVEL,
};

module.exports = config;

// 3. Servidor Express con Swagger UI
const app = express();
app.use(express.json());

// Cargar especificación OpenAPI (subiendo dos niveles desde src/config a la raíz de backend)
const openapiPath = path.join(__dirname, '../../openapi.yaml');
let openapiDoc = {};
if (fs.existsSync(openapiPath)) {
  openapiDoc = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));
}

// Ruta para la documentación Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

// Endpoints documentados en OpenAPI
app.get('/api/noticias', (req, res) => {
  res.json([{ id: 1, titulo: "Anuncio de reinscripciones campusNova", contenido: "Se abren las fechas oficiales." }]);
});

app.get('/api/noticias/:id', (req, res) => {
  res.json({ id: parseInt(req.params.id), titulo: "Detalle Noticia", contenido: "Contenido del aviso." });
});

app.post('/api/noticias', (req, res) => {
  res.status(201).json({ id: 2, ...req.body });
});

// Arrancar servidor Express en el puerto 3000
app.listen(config.port, () => {
  console.log(`✅ Backend de campusNova iniciado correctamente en el puerto: ${config.port}`);
  console.log(`📄 Swagger UI disponible en http://localhost:${config.port}/api-docs`);
});