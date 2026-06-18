import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';

// Clean up unwanted tokens/folders (M3 and Font theme/Wireframe.json)
function cleanUnwantedTokens() {
  const m3Path = path.join('tokens', 'M3');
  const wireframePath = path.join('tokens', 'Font theme', 'Wireframe.json');
  const metadataPath = path.join('tokens', '$metadata.json');

  console.log('Checking for unwanted token files to clean...');

  let cleanedAny = false;

  if (fs.existsSync(m3Path)) {
    fs.rmSync(m3Path, { recursive: true, force: true });
    console.log(`- Deleted directory: ${m3Path}`);
    cleanedAny = true;
  }

  if (fs.existsSync(wireframePath)) {
    fs.unlinkSync(wireframePath);
    console.log(`- Deleted file: ${wireframePath}`);
    cleanedAny = true;
  }

  if (fs.existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (metadata.tokenSetOrder) {
        const originalLength = metadata.tokenSetOrder.length;
        metadata.tokenSetOrder = metadata.tokenSetOrder.filter(item => 
          !item.startsWith('M3/') && item !== 'Font theme/Wireframe'
        );
        if (metadata.tokenSetOrder.length !== originalLength) {
          fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
          console.log(`- Updated $metadata.json to remove references to deleted tokens.`);
          cleanedAny = true;
        }
      }
    } catch (err) {
      console.warn(`- Warning: Could not update $metadata.json: ${err.message}`);
    }
  }

  if (!cleanedAny) {
    console.log('- No unwanted token files found.');
  }
}

cleanUnwantedTokens();

console.log('Initializing Style Dictionary build...');

// Helper to register custom transforms directly on a Style Dictionary instance (v4 pattern)
function registerCustomTransforms(sdInstance) {
  // 1. Custom Transform: Map Named Font Weights to Numeric CSS Values
  sdInstance.registerTransform({
    name: 'weight/numeric',
    type: 'value',
    transitive: true,
    filter: (token) => {
      const pathStr = token.path.join('-').toLowerCase();
      return pathStr.includes('weight');
    },
    transform: (token) => {
      const valObj = token.value !== undefined ? token.value : token.$value;
      if (valObj === undefined || valObj === null) {
        return valObj;
      }
      const val = valObj.toString().toLowerCase().trim();
      if (val === 'regular' || val === 'normal') return '400';
      if (val === 'medium') return '500';
      if (val === 'semibold' || val === 'semi-bold') return '600';
      if (val === 'bold') return '700';
      return valObj;
    }
  });

  // 2. Custom Transform: Append 'px' unit to numeric values representing dimensions
  sdInstance.registerTransform({
    name: 'size/px',
    type: 'value',
    transitive: true,
    filter: (token) => {
      const valObj = token.value !== undefined ? token.value : token.$value;
      if (valObj === undefined || valObj === null) return false;
      
      const pathStr = token.path.join('-').toLowerCase();
      const isNumeric = typeof valObj === 'number';

      return isNumeric && (
        token.$type === 'number' ||
        token.$type === 'dimension' ||
        pathStr.includes('size') ||
        pathStr.includes('font-size') ||
        pathStr.includes('line-height') ||
        pathStr.includes('tracking') ||
        pathStr.includes('corner') ||
        pathStr.includes('radius')
      );
    },
    transform: (token) => {
      const valObj = token.value !== undefined ? token.value : token.$value;
      if (valObj === undefined || valObj === null) {
        return valObj;
      }
      if (valObj === 0) return '0';
      return `${valObj}px`;
    }
  });
}

// Define common transforms for CSS & SCSS
const cssTransforms = [
  'name/kebab',
  'color/css',
  'weight/numeric',
  'size/px'
];

// Configuration for Light Theme (Base: includes colors, typography, and shapes)
const lightConfig = {
  source: [
    'tokens/Font theme/Baseline.json',
    'tokens/Typescale/Baseline.json',
    'tokens/Shape/Baseline.json',
    'tokens/Monochrome Neutrals/Monochrome LT.json'
  ],
  platforms: {
    css: {
      transforms: cssTransforms,
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'variables-light.css',
          format: 'css/variables',
          options: {
            selector: ':root'
          }
        }
      ]
    },
    scss: {
      transforms: cssTransforms,
      buildPath: 'dist/scss/',
      files: [
        {
          destination: '_variables.scss',
          format: 'scss/variables'
        }
      ]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [
        {
          destination: 'tokens-light.js',
          format: 'javascript/module'
        }
      ]
    }
  }
};

// Configuration for Dark Theme (Overrides: includes only dark color tokens)
const darkConfig = {
  source: [
    'tokens/Monochrome Neutrals/Monochrome DT.json'
  ],
  platforms: {
    css: {
      transforms: cssTransforms,
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'variables-dark.css',
          format: 'css/variables',
          options: {
            selector: '.dark-theme'
          }
        }
      ]
    },
    scss: {
      transforms: cssTransforms,
      buildPath: 'dist/scss/',
      files: [
        {
          destination: '_variables-dark.scss',
          format: 'scss/variables'
        }
      ]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [
        {
          destination: 'tokens-dark.js',
          format: 'javascript/module'
        }
      ]
    }
  }
};

// Compile both themes
try {
  console.log('Compiling Light Theme...');
  const sdLight = new StyleDictionary(lightConfig);
  registerCustomTransforms(sdLight);
  await sdLight.buildAllPlatforms();
  console.log('✔ Light Theme built successfully.');

  console.log('Compiling Dark Theme...');
  const sdDark = new StyleDictionary(darkConfig);
  registerCustomTransforms(sdDark);
  await sdDark.buildAllPlatforms();
  console.log('✔ Dark Theme built successfully.');

  console.log('Design System compiled successfully into dist/');
} catch (error) {
  console.error('Compilation failed:', error);
  process.exit(1);
}
