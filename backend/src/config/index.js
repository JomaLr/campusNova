require('dotenv').config();

// Validación de arranque
const requeridas = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const faltantes = requeridas.filter((v) => !process.env[v]);

if (faltantes.length > 0) {
  console.error(`❌ Faltan variables de entorno: ${faltantes.join(', ')}`);
  process.exit(1);
}

// Exportación centralizada
module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  corsOrigin: process.env.CORS_ORIGIN,
  logLevel: process.env.LOG_LEVEL,
};