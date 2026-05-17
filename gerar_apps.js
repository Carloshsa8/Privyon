const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'Apps');
const outputHtml = path.join(appsDir, 'index.html');

console.log('Lendo a pasta Apps...');

if (!fs.existsSync(appsDir)) {
    console.error('A pasta "Apps" não foi encontrada!');
    process.exit(1);
}

if (!fs.existsSync(outputHtml)) {
    console.error('O arquivo "Apps/index.html" da vitrine não foi encontrado!');
    process.exit(1);
}

// Ler as pastas de projeto sob Apps/
const items = fs.readdirSync(appsDir);
const appFolders = items.filter(item => {
  const fullPath = path.join(appsDir, item);
  // Garante que é uma pasta e não é oculta nem pasta de assets
  return fs.statSync(fullPath).isDirectory() && 
         !item.startsWith('.') && 
         item !== 'assets' && 
         item !== 'node_modules';
});

console.log(`Encontrados ${appFolders.length} aplicativos:`, appFolders);

// Função para gerar o card HTML de cada app
function createAppCard(folderName) {
  const encFolder = encodeURIComponent(folderName);
  const appFolderPath = path.join(appsDir, folderName);
  
  // Valores padrão (fallbacks)
  let title = folderName.replace(/-/g, ' ').replace(/_/g, ' ');
  title = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  let description = `Aplicativo adicionado à pasta ${folderName}.`;
  let iconPath = '../logo.svg'; // Fallback padrão
  let tags = ['PWA', 'App'];

  // 1. Tentar ler PWA_manifest.json (específico para PWA isolado)
  const pwaManifestPath = path.join(appFolderPath, 'PWA_manifest.json');
  const standardManifestPath = path.join(appFolderPath, 'manifest.json');
  const webManifestPath = path.join(appFolderPath, 'manifest.webmanifest');
  
  let manifestData = null;

  try {
    if (fs.existsSync(pwaManifestPath)) {
      console.log(`- Lendo PWA_manifest.json para ${folderName}...`);
      manifestData = JSON.parse(fs.readFileSync(pwaManifestPath, 'utf-8'));
    } else if (fs.existsSync(standardManifestPath)) {
      console.log(`- Lendo manifest.json padrão para ${folderName}...`);
      manifestData = JSON.parse(fs.readFileSync(standardManifestPath, 'utf-8'));
    } else if (fs.existsSync(webManifestPath)) {
      console.log(`- Lendo manifest.webmanifest padrão para ${folderName}...`);
      manifestData = JSON.parse(fs.readFileSync(webManifestPath, 'utf-8'));
    }
  } catch (err) {
    console.warn(`! Erro ao analisar o arquivo de manifest do app ${folderName}:`, err.message);
  }

  // 2. Se encontrou metadados, extrair informações
  if (manifestData) {
    if (manifestData.name || manifestData.short_name) {
      title = manifestData.name || manifestData.short_name;
    }
    if (manifestData.description) {
      description = manifestData.description;
    }
    
    // Tenta encontrar um ícone
    if (manifestData.icon) {
      iconPath = manifestData.icon;
    } else if (manifestData.icons && manifestData.icons.length > 0) {
      // Pega o maior ícone ou o primeiro disponível
      const bestIcon = manifestData.icons[manifestData.icons.length - 1];
      iconPath = bestIcon.src;
    }
    
    if (manifestData.tags && Array.isArray(manifestData.tags)) {
      tags = manifestData.tags;
    }
  }

  // Se o ícone for relativo e local à pasta do app, prefixamos com o nome da pasta do app
  // Caso contrário, se for um ícone global do Privyon, mantemos como está
  const finalIconSrc = (iconPath.startsWith('http') || iconPath.startsWith('/') || iconPath.startsWith('../'))
    ? iconPath
    : `${encFolder}/${iconPath}`;

  const tagHtml = tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('\n          ');

  return `
        <!-- Aplicativo Auto-gerado: ${folderName} -->
        <div class="app-card reveal delay-1">
          <div class="app-header-visual">
            <div class="app-icon-wrapper">
              <img class="app-icon" src="${finalIconSrc}" alt="${title} Icon" onerror="this.src='../logo.svg'">
            </div>
          </div>
          <div class="app-content">
            <div class="app-title-row">
              <h3 class="app-title">${title}</h3>
            </div>
            <p class="app-desc">${description}</p>
            <div class="app-footer">
              <div class="tech-stack">
                ${tagHtml}
              </div>
              <a href="${encFolder}/index.html" target="_blank" class="btn-visit">
                Acessar
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </a>
            </div>
          </div>
        </div>`;
}

// Gerar os cartões de cada pasta encontrada
const appCards = appFolders.map(folder => createAppCard(folder)).join('\n');

// Ler o HTML da vitrine e atualizar a grid de aplicativos
let htmlContent = fs.readFileSync(outputHtml, 'utf-8');

const regex = /<div class="apps-grid">([\s\S]*?)<\/div>/;

if (regex.test(htmlContent)) {
  const newHtml = htmlContent.replace(regex, `<div class="apps-grid">\n${appCards}\n      </div>`);
  fs.writeFileSync(outputHtml, newHtml, 'utf-8');
  console.log('✔ Apps/index.html foi atualizado com sucesso!');
} else {
  console.error('Não foi possível encontrar o bloco <div class="apps-grid"> no arquivo Apps/index.html!');
}
