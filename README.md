<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Rede Script Pro

Sistema de Gestão de Leads e Vendas com funcionalidades PWA (Progressive Web App).

## Funcionalidades

- **Gestão de Leads**: Cadastro, edição e histórico completo de leads
- **Dashboard**: Visualização de métricas e performance de vendas
- **Script de Vendas**: Gerenciamento de perguntas e scripts
- **Sincronização Local**: Exportação/Importação de dados via Excel
- **PWA**: Instalável como aplicativo nativo com ícone personalizado
- **Agenda**: Controle de lives e compromissos

## Executar Localmente

**Pré-requisitos:** Node.js 18+

1. Instalar dependências:
   ```bash
   npm install
   ```

2. Configurar variáveis de ambiente:
   - Copie `.env.example` para `.env.local`
   - Adicione sua chave da API Gemini: `GEMINI_API_KEY=sua_chave_aqui`

3. Executar o app:
   ```bash
   npm run dev
   ```

4. Acesse: http://localhost:3000

---

## Deploy no GitHub Pages

### Pré-requisitos

- Conta no GitHub
- Repositório criado (ex: `seu-usuario/rede-script-pro`)
- Node.js instalado localmente

### Passo 1: Configurar o Vite para GitHub Pages

O arquivo `vite.config.ts` já está configurado com o plugin de atualização automática do service worker. Certifique-se de que o `base` está configurado corretamente:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/nome-do-seu-repositorio/', // Importante para GitHub Pages
  // ... resto da configuração
});
```

> **Nota:** Substitua `/nome-do-seu-repositorio/` pelo nome exato do seu repositório no GitHub.

### Passo 2: Criar Workflow de Deploy

Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Passo 3: Configurar o Repositório no GitHub

1. **Acesse as configurações do repositório:**
   - Vá para `Settings` > `Pages`

2. **Configurar a fonte:**
   - Em "Build and deployment", selecione:
     - **Source:** GitHub Actions

3. **Adicionar variável de ambiente (opcional):**
   - Se usar a API Gemini, vá em `Settings` > `Secrets and variables` > `Actions`
   - Adicione `GEMINI_API_KEY` como repository secret

### Passo 4: Deploy Manual (Alternativa)

Se preferir fazer deploy manualmente sem GitHub Actions:

```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Adicionar scripts no package.json:
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"

# Executar deploy
npm run deploy
```

### Passo 5: Verificar o Deploy

1. Acesse `https://seu-usuario.github.io/nome-do-repositorio/`
2. Aguarde alguns minutos após o push para o deploy completar
3. Verifique a aba "Actions" no GitHub para acompanhar o progresso

---

## Considerações Importantes para PWA no GitHub Pages

### Funcionalidades que Continuam Funcionando

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Instalação PWA | ✅ | Funciona normalmente via HTTPS |
| Ícone Personalizado | ✅ | Mantido no localStorage |
| Banco de Dados (IndexedDB) | ✅ | Persistente no navegador |
| Sincronização Excel | ✅ | Acesso ao sistema de arquivos local |
| Service Worker | ✅ | Atualizado automaticamente a cada build |

### Limitações do GitHub Pages

- **Apenas Frontend**: Não há backend/server
- **Rota 404**: Ao atualizar a página em rotas internas, pode ocorrer erro 404 (solucionado com `_redirects` ou configuração do router)

### Solução para Rotas no GitHub Pages

Crie o arquivo `public/404.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rede Script Pro</title>
  <script>
    // Redireciona para a raiz preservando a rota
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
<body>
</body>
</html>
```

E adicione no `index.html` antes do fechamento do `</head>`:

```html
<script>
  // Recupera a rota após redirecionamento do 404
  (function() {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

---

## Atualização do Aplicativo

O sistema possui atualização automática do service worker:

1. A cada `npm run build`, o `CACHE_NAME` é atualizado automaticamente
2. O service worker limpa caches antigos na ativação
3. Usuários recebem a nova versão na próxima visita

Para forçar atualização imediata:
- Desinstale e reinstale o PWA
- Ou use "Limpar dados do site" nas configurações do navegador

---

## Suporte

Para dúvidas ou problemas:
- Verifique a aba "Issues" do repositório
- Consulte os logs em `chrome://serviceworker-internals/` (Chrome)
- Verifique o console do navegador (F12 > Console)

---

**Desenvolvido com:** React 19 + Vite + TypeScript + Tailwind CSS + Dexie.js
