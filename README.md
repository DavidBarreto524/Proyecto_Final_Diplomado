# Proyecto Final Unidad 1 - Frontend + Backend Desacoplados

Este repositorio contiene dos componentes separados:

- `frontend/`: maqueta funcional en una sola página HTML con navegación por DOM.
- `backend/`: API REST en Node.js + Express + MongoDB (Mongoose).

## 1) Estructura

```text
ProyectoFinalUnidad1/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── config/db.js
│       ├── models/
│       │   ├── User.js
│       │   └── Service.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   └── serviceController.js
│       └── routes/
│           ├── authRoutes.js
│           ├── userRoutes.js
│           └── serviceRoutes.js
└── README.md
```

## 2) Requisitos de ejecución

### Frontend

Puedes abrir `frontend/index.html` con Live Server o con servidor local simple:

```bash
cd frontend
python -m http.server 5500
```

Abrir en navegador: `http://localhost:5500/index.html`

### Backend

1. Instala dependencias:

```bash
cd backend
npm install
```

2. Crea `.env` desde `.env.example`:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/proyecto_superbiker
```

3. Inicia servidor:

```bash
npm run dev
```

API base: `http://localhost:4000`

## 3) Diccionario de endpoints

### Health

- `GET /api/health`

Respuesta:

```json
{
  "ok": true,
  "message": "API activa"
}
```

### Auth

- `POST /api/auth/login`

Body esperado:

```json
{
  "identifier": "admin o celular/email",
  "password": "tu_clave"
}
```

Respuesta OK:

```json
{
  "message": "Login exitoso",
  "user": {
    "id": "660000000000000000000001",
    "name": "Admin",
    "email": "admin@demo.com",
    "phone": "3178735151",
    "role": "admin"
  }
}
```

### Usuarios (CRUD)

- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Ejemplo `POST /api/users`:

```json
{
  "name": "David Barreto",
  "email": "david@correo.com",
  "phone": "3178735151",
  "password": "Sencho524**",
  "role": "admin"
}
```

Notas de negocio usuarios:

- `email` y `phone` son únicos.
- `phone` se normaliza y valida (mínimo 10 dígitos).
- `password` se guarda hasheada con `bcryptjs`.

### Servicios (CRUD)

- `POST /api/services`
- `GET /api/services`
- `GET /api/services/:id`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

Ejemplo `POST /api/services`:

```json
{
  "name": "Medio",
  "variant": "Alto c.c.",
  "vehicleType": "moto",
  "identifier": "ABC123",
  "description": "Shampoo PH neutro y desengrasado de arrastre",
  "price": 30000,
  "couponCode": "DESC50",
  "status": "pendiente",
  "active": true
}
```

Reglas de negocio servicios:

- Catálogo y precios oficiales estrictos:
  - Basico: bajo `18000`, alto `25000`
  - Medio: bajo `23000`, alto `30000`
  - Completo: bajo `28000`, alto `35000`
  - Deluxe: bajo `60000`, alto `70000`
  - Ciclas/Bicicletas: `10000`
- Si `name` es `Ciclas`, `vehicleType` debe ser `bicicleta`.
- Para el resto, `vehicleType` debe ser `moto`.
- `identifier` es obligatorio (placa o documento/referencia).
- Cupón `DESC50` calcula automáticamente:
  - `discountPercent = 50`
  - `finalPrice = price * 0.5` (redondeado)
- Estados permitidos: `pendiente`, `en_proceso`, `finalizado`, `entregado`.

## 4) Evidencia de pruebas en Postman

Para la entrega, agrega en esta sección capturas de:

- Login correcto y fallido (`POST /api/auth/login`).
- Usuarios: `POST`, `GET`, `GET by id`, `PUT`, `DELETE`.
- Servicios: `POST`, `GET`, `GET by id`, `PUT`, `DELETE`.

Puedes incluir imágenes en una carpeta `docs/postman/` y enlazarlas aquí.

## 5) Explicación de manipulación del DOM (Frontend)

El frontend se diseñó como una SPA simple de una sola página:

- Todas las vistas viven en `frontend/index.html` como secciones:
  - `#view-home`
  - `#view-login`
  - `#view-register`
  - `#view-dashboard`
  - `#view-services`
- `frontend/js/app.js` controla navegación con la función `showView(view)`, que oculta y muestra secciones sin recargar la página.
- Se aplican validaciones en cliente:
  - Campos vacíos
  - Formato de correo con regex
  - Celular de 10 dígitos
  - Contraseña mínima
- El módulo de servicios incluye CRUD visual local (sin `fetch`, como exige la consigna de frontend).