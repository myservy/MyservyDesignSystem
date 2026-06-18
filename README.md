# Myservy Design System

Este es el repositorio central del **Design System de Myservy**, que compila tokens de diseño exportados de Token Studio a múltiples formatos (CSS, SCSS y JavaScript) usando **Style Dictionary v4**.

El sistema implementa una paleta de **Monochromatic Neutrals** (colores neutros monocromáticos con soporte nativo de tema Claro/Oscuro) y tipografías/formas basadas en **Material Design**.

---

## 🚀 Requisitos e Instalación

Para configurar la compilación de tokens en tu entorno local, asegúrate de tener instalado **Node.js (v24+)** y **pnpm**.

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Compilar los tokens
```bash
pnpm run build
```

Este comando ejecuta `build.js` y genera los archivos de salida en el directorio `/dist`.

---

## 📁 Estructura de Salida (`/dist`)

Después de compilar, se generarán las siguientes carpetas:

```text
dist/
├── css/
│   ├── variables-light.css  # Variables CSS del tema claro (cargadas en :root) + tipografía/formas.
│   └── variables-dark.css   # Variables CSS del tema oscuro (cargadas bajo la clase .dark-theme).
├── scss/
│   ├── _variables.scss      # Variables SCSS de compilación del tema claro (tipografía/formas/colores).
│   └── _variables-dark.scss # Variables SCSS de compilación del tema oscuro.
└── js/
    ├── tokens-light.js      # Definición de tokens en módulos de JS/TS (tema claro).
    └── tokens-dark.js       # Definición de tokens en módulos de JS/TS (tema oscuro).
```

---

## 🅰️ Integración en Proyectos Angular + SCSS

### Opción A: Uso mediante CSS Custom Properties (Recomendado para Temas Dinámicos)

Este método permite alternar entre el tema claro y oscuro dinámicamente en tiempo de ejecución añadiendo la clase `.dark-theme` al elemento `body`.

1. **Importar en `styles.scss` (Global)**:
   Agrega la referencia a los archivos compilados en tu archivo CSS/SCSS global (o agrégalos en el array `styles` de tu `angular.json`):
   ```scss
   @import "path/to/design-system/dist/css/variables-light.css";
   @import "path/to/design-system/dist/css/variables-dark.css";
   ```

2. **Aplicar en tus componentes**:
   ```scss
   .mi-tarjeta {
     background-color: var(--primary-color);
     border: 1px solid var(--secondary-color);
     border-radius: var(--corner-medium);
     color: var(--texto-principales);
     font-family: var(--static-body-large-font);
     font-size: var(--static-body-large-size);
     font-weight: var(--static-body-large-weight);
   }
   ```

3. **Alternar Temas en TS**:
   ```typescript
   toggleTheme() {
     document.body.classList.toggle('dark-theme');
   }
   ```

---

### Opción B: Uso mediante SCSS Variables (Compilación Estática)

Si prefieres usar variables de preprocesador Sass (`$variable`):

1. **Importar en tu archivo SCSS**:
   ```scss
   @import "path/to/design-system/dist/scss/variables"; // Importa variables base/claras
   ```

2. **Aplicar variables**:
   ```scss
   .mi-tarjeta {
     background-color: $primary-color;
     border-radius: $corner-medium;
     font-weight: $static-body-large-weight;
   }
   ```

---

## 🛠️ Personalizaciones en el Compilador (`build.js`)

Durante la compilación, se aplican transformaciones personalizadas para asegurar la compatibilidad con CSS y SCSS:
1. **Unidades (`size/px`)**: Mapea valores numéricos raw (como `24`, `8`, `12`) correspondientes a fuentes, tamaños de línea, tracking y formas, añadiéndoles el sufijo `px` (ej. `24px`, `8px`).
2. **Pesos Tipográficos (`weight/numeric`)**: Traduce palabras clave como `Regular`, `Medium`, `SemiBold` a sus equivalentes numéricos CSS estándar (`400`, `500`, `600`).
