import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import fs from 'fs';

// Plugin para atualizar a versão do service worker automaticamente
function updateServiceWorkerVersion() {
  return {
    name: 'update-sw-version',
    closeBundle() {
      const swPath = path.resolve(__dirname, 'public/sw.js');
      if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, 'utf-8');
        
        // Gerar timestamp único para a versão
        const timestamp = Date.now();
        const version = `v-${timestamp}`;
        
        // Atualizar o CACHE_NAME
        content = content.replace(
          /const CACHE_NAME = 'rspro-v[^']*';/,
          `const CACHE_NAME = 'rspro-${version}';`
        );
        
        // Adicionar comentário com a data de build
        const buildDate = new Date().toISOString();
        if (!content.includes('// Build:')) {
          content = content.replace(
            "const CACHE_NAME = 'rspro-",
            `// Build: ${buildDate}\nconst CACHE_NAME = 'rspro-`
          );
        } else {
          content = content.replace(
            /\/\/ Build: .*/,
            `// Build: ${buildDate}`
          );
        }
        
        fs.writeFileSync(swPath, content);
        console.log(`\x1b[32m✓ Service Worker atualizado para versão: rspro-${version}\x1b[0m`);
      }
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      updateServiceWorkerVersion()
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
