# MiniLang Analizador Lexico

Este proyecto es un analizador lexico para el lenguaje MiniLang. Incluye:
- Frontend web para escribir codigo y ver resultados.
- Backend con una API REST que analiza el texto y devuelve tokens y errores.

## Resumen muy corto (para exponer)
1. El analizador lexico es la primera fase de un compilador.
2. Toma texto y lo convierte en tokens (palabras con tipo y linea).
3. Si hay un caracter invalido, marca un error lexico y se detiene.

## Que hace el analizador (explicacion simple)
Imagina que el programa es una frase. El analizador lexico separa la frase en
palabras y les pone una etiqueta. Por ejemplo:
- "int" -> PALABRA_RESERVADA
- "contador" -> IDENTIFICADOR
- "10" -> NUMERO_ENTERO

### Que es un token
Un token es una palabra o simbolo con una etiqueta. Esa etiqueta dice que tipo
de cosa es. Por ejemplo:
- "int" es una palabra reservada.
- "contador" es el nombre de una variable.
- "=" es un operador de asignacion.
- "10" es un numero.

Entonces, el analizador toma el texto y lo convierte en una lista ordenada de
tokens. Cada token guarda:
- el tipo (que es),
- el lexema (el texto exacto),
- y la linea donde aparecio.

Ejemplo (texto):
int contador = 10;

Ejemplo (tokens):
- (PALABRA_RESERVADA, "int", linea 1)
- (IDENTIFICADOR, "contador", linea 1)
- (ASIGNACION, "=", linea 1)
- (NUMERO_ENTERO, "10", linea 1)
- (DELIMITADOR, ";", linea 1)

### Analogia facil (etiquetas en una oracion)
Piensa que el texto es una oracion y cada palabra lleva una etiqueta:

Texto:
int contador = 10;

Etiquetas:
[PALABRA_RESERVADA] [IDENTIFICADOR] [ASIGNACION] [NUMERO_ENTERO] [DELIMITADOR]

El analizador solo pone esas etiquetas y anota en que linea aparecieron.

### Diagrama simple del proceso
```mermaid
flowchart LR
  A[Texto del programa] --> B[Analizador lexico]
  B --> C[Lista de tokens]
  B --> D[Error lexico (si aparece)]
```

El analizador lee el codigo de izquierda a derecha y va creando tokens.
- Ignora espacios, tabulaciones y saltos de linea.
- Cuenta la linea actual para reportar resultados.
- Si encuentra un caracter invalido, registra un error lexico y se detiene.

### Reglas (prioridad)
1. PALABRA_RESERVADA: int, float, if, else, while, for, print, true, false, return
2. NUMERO_DECIMAL: 3.14
3. NUMERO_ENTERO: 10
4. CADENA: "Hola Mundo"
5. IDENTIFICADOR: contador_1
6. OP_LOGICO: &&, ||
7. OP_RELACIONAL: ==, !=, >=, <=, >, <
8. ASIGNACION: =
9. OP_ARITMETICO: +, -, *, /
10. DELIMITADOR: ;, ,, (, ), {, }

## Estructura del proyecto
- backend/ -> API REST en Node.js + Express + TypeScript
- frontend/ -> Interfaz web (React + Vite + TypeScript + Tailwind)

## Archivos clave
Estos archivos contienen el funcionamiento principal. Las lineas pueden variar
si se edita el codigo, pero sirven como guia:

Backend (logica del analizador):
- backend/src/services/analyzerService.ts
  - Reglas y diccionario: lineas 4-33
  - Bucle principal y lectura del texto: lineas 35-88
  - Regla de error lexico (se detiene): lineas 79-86

Backend (API y validacion):
- backend/src/controllers/analyzeController.ts
  - Validacion de la entrada: lineas 11-23
  - Respuesta final con tokens/errores: lineas 25-26
- backend/src/routes/analyzeRoutes.ts
  - Ruta POST /analyze: linea 6
- backend/src/server.ts
  - Configuracion Express + CORS: lineas 1-15
  - Arranque del servidor: lineas 17-19

Tipos compartidos:
- backend/src/types/analysis.ts
  - Interfaces Token, LexicalError, AnalyzeRequest, AnalyzeResponse: lineas 1-17

Frontend (interfaz y consumo de API):
- frontend/src/App.tsx
  - Llamada al backend y manejo de errores: aprox lineas 62-95
  - Editor Monaco y boton Analizar: aprox lineas 140-205

## API (Backend)
Endpoint principal:
- POST /api/analyze

Body de ejemplo:
{
  "sourceCode": "int contador = 10;\nprint(contador);"
}

Respuesta:
{
  "tokens": [ { "id": "...", "line": 1, "type": "NUMERO_ENTERO", "lexeme": "10" } ],
  "errors": []
}

## Como instalar y ejecutar (Windows / Mac / Linux)
Requisitos:
- Node.js 18 o superior
- Git

Paso 1: Clonar el repo
- git clone <TU_REPO>
- cd analizador-lexico

Paso 2: Iniciar Backend
- cd backend
- npm install
- npm run dev

El backend queda en: http://localhost:3000

Paso 3: Iniciar Frontend
En otra terminal:
- cd frontend
- npm install
- npm run dev

El frontend queda en: http://localhost:5173

## Como usar
1. Abre el frontend.
2. Escribe o pega codigo MiniLang.
3. Presiona "Analizar Codigo".
4. Revisa los tabs de Resumen, Tokens y Errores.

## Ejemplo de flujo (para exponer)
1. El usuario escribe codigo en la web.
2. El frontend envia el texto al backend con POST /api/analyze.
3. El backend analiza el texto con reglas regex (AFD simulado).
4. El backend responde con tokens o errores.
5. El frontend muestra los resultados.

## Notas para exposicion
- El analizador lexico es la primera fase de un compilador.
- Convierte el texto fuente en una lista de tokens con tipo y linea.
- Si un caracter no pertenece al lenguaje, marca un error lexico y se detiene.
- Es un proyecto educativo: muestra claramente el flujo de un compilador simple.
