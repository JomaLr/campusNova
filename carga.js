import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Sube gradualmente a 5 usuarios virtuales en 10s
    { duration: '20s', target: 5 },  // Mantiene 5 usuarios concurrentes durante 20s
    { duration: '5s', target: 0 },   // Baja gradualmente a 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // El 95% de las peticiones debe responder en menos de 500ms
    http_req_failed: ['rate<0.01'],   // La tasa de fallos debe ser menor al 1%
  },
};

export default function () {
  const res = http.get('http://host.docker.internal:8080/');
  check(res, {
    'status es 200': (r) => r.status === 200,
  });
  sleep(1);
}