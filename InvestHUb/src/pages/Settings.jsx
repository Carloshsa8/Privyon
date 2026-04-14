import React, { useRef, useState } from 'react';
import { usePortfolioContext } from '../context/PortfolioContext';
import { Download, Upload, Trash2, Moon, Sun, Save, FileText, Coffee, Copy, Check, QrCode, Shield, Fingerprint } from 'lucide-react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import PinSetupModal from '../components/Security/PinSetupModal';

const Settings = () => {
  const { settings, updateSettings, transactions, earnings, importData, clearAllData } = usePortfolioContext();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [copied, setCopied] = useState(null);
  const fileInputRef = useRef(null);

  const saveAndShare = async (filename, content, isJson = true) => {
    if (Capacitor.isNativePlatform()) {
      try {
        // Save to cache directory
        const result = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });

        // Open share sheet
        await Share.share({
          title: filename,
          url: result.uri,
          dialogTitle: 'Salvar Backup'
        });
      } catch (e) {
        alert('Erro ao compartilhar arquivo: ' + e.message);
      }
    } else {
      // Browser fallback
      const type = isJson ? "application/json" : "text/markdown";
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", url);
      downloadAnchorNode.setAttribute("download", filename);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSettings({
      investorName: formData.get('investorName'),
      currency: formData.get('currency'),
    });
    alert('Configurações salvas com sucesso!');
  };

  const handleExport = () => {
    const dataToExport = { transactions, earnings, settings };
    const content = JSON.stringify(dataToExport, null, 2);
    const filename = `investhub_backup_${new Date().toISOString().split('T')[0]}.json`;
    saveAndShare(filename, content, true);
  };

  const handleExportMarkdown = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    let md = `# 🛡️ InvestHub - Backup Portfolio\n\n**Data do Backup:** ${date}\n**Investidor:** ${settings.investorName}\n\n---\n\n## 💰 Resumo de Ativos\n\n| Ativo | Classe | Quantidade | Preço Médio |\n| :--- | :--- | :--- | :--- |\n`;
    
    // Simple grouping by ticker for the summary
    const summary = {};
    transactions.forEach(t => {
      if (!summary[t.ticker]) summary[t.ticker] = { qty: 0, cost: 0, class: t.class };
      if (t.type === 'COMPRA') {
        summary[t.ticker].qty += t.quantity;
        summary[t.ticker].cost += (t.quantity * t.price) + (t.fee || 0);
      } else {
        summary[t.ticker].qty -= t.quantity;
      }
    });

    Object.keys(summary).forEach(ticker => {
      const pos = summary[ticker];
      if (pos.qty > 0) {
        const pm = pos.cost / pos.qty;
        md += `| ${ticker} | ${pos.class} | ${pos.qty} | R$ ${pm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} |\n`;
      }
    });

    md += `\n\n---\n\n## 📝 Histórico de Transações\n\n| Data | Tipo | Ativo | Qtd | Preço | Corretora |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    transactions.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(t => {
      md += `| ${t.date.split('-').reverse().join('/')} | ${t.type} | ${t.ticker} | ${t.quantity} | R$ ${t.price.toLocaleString('pt-BR')} | ${t.broker} |\n`;
    });

    md += `\n\n---\n\n## 🏦 Histórico de Proventos\n\n| Data | Ativo | Tipo | Valor Total |\n| :--- | :--- | :--- | :--- |\n`;
    earnings.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(e => {
      md += `| ${e.date.split('-').reverse().join('/')} | ${e.ticker} | ${e.type} | R$ ${e.total.toLocaleString('pt-BR')} |\n`;
    });

    md += `\n\n---\n*Backup gerado automaticamente pelo InvestHub.*`;

    const filename = `investhub_obsidian_${new Date().toISOString().split('T')[0]}.md`;
    saveAndShare(filename, md, false);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.transactions && importedData.earnings && importedData.settings) {
          importData(importedData);
          alert('Dados importados com sucesso!');
          window.location.reload(); 
        } else {
          alert('Arquivo inválido. Certifique-se de usar um backup gerado pelo InvestHub.');
        }
      } catch (error) {
        alert('Erro ao ler o arquivo. ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('⚠️ AVISO CRÍTICO: Você está prestes a APAGAR ABSOLUTAMENTE TUDO. Isso zerará o app e não pode ser desfeito. Tem certeza?')) {
      clearAllData();
      alert('O app foi zerado com sucesso.');
      window.location.reload();
    }
  };

  const toggleTheme = () => {
    // ... theme logic
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    
    const update = () => {
      updateSettings({ theme: newTheme });
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSupportSettings = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSettings({
      pixKey: formData.get('pixKey'),
      btcAddress: formData.get('btcAddress')
    });
    alert('Chaves salvas com sucesso!');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="card space-y-6">
        <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-800 pb-4">Perfil e Preferências</h3>
        
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Investidor</label>
              <input 
                name="investorName"
                type="text" 
                defaultValue={settings.investorName} 
                className="input-field" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Moeda Padrão</label>
              <select name="currency" defaultValue={settings.currency} className="input-field">
                <option value="R$">BRL (R$)</option>
                <option value="US$">USD (US$)</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema da Interface</p>
                <p className="text-sm text-gray-500">Alterne entre o modo claro e escuro.</p>
              </div>
              <button 
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className={`transition-transform duration-500 ${settings.theme === 'dark' ? 'rotate-0' : 'rotate-180'}`}>
                  {settings.theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
                </span>
                {settings.theme === 'dark' ? 'Claro' : 'Escuro'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo Privacidade</p>
                <p className="text-sm text-gray-500">Oculte seus valores em toda a plataforma.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.hideValues || false}
                  onChange={() => updateSettings({ hideValues: !settings.hideValues })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-light-accent dark:peer-checked:bg-dark-accent"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
             <button type="submit" className="btn-primary flex items-center gap-2">
                <Save size={18} /> Salvar Perfil
             </button>
          </div>
        </form>
      </div>
      
      {/* Appearance Section */}
      <div className="card space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Sun size={20} />
          </div>
          <h3 className="font-semibold text-lg">Aparência e Cores</h3>
        </div>
        
        <div className="space-y-6 border-t border-gray-100 dark:border-gray-800 pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Cor de Destaque
            </label>
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { name: 'Emeralda', color: '#00D26A' },
                { name: 'Ocean', color: '#3b82f6' },
                { name: 'Royal', color: '#8b5cf6' },
                { name: 'Rosa (Obsidian)', color: '#ec4899' },
                { name: 'Laranja', color: '#f97316' },
                { name: 'Crimson', color: '#ef4444' },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => updateSettings({ accentColor: c.color })}
                  className={`w-10 h-10 rounded-full transition-all border-4 relative ${
                    settings.accentColor === c.color 
                      ? 'border-gray-300 dark:border-white scale-110 shadow-lg' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                >
                  {settings.accentColor === c.color && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                     </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 min-w-[140px]">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <input
                    type="color"
                    value={settings.accentColor || '#00D26A'}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-bold font-mono tracking-tight">{settings.accentColor?.toUpperCase() || '#00D26A'}</span>
              </div>
              
              <div className="h-px sm:h-8 w-full sm:w-px bg-gray-200 dark:bg-gray-700"></div>
              
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={settings.accentColor || '#00D26A'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(val)) {
                      updateSettings({ accentColor: val });
                    }
                  }}
                  placeholder="HEX: #00D26A"
                  className="w-full bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-600 dark:text-gray-400"
                />
              </div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ajuste Manual</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <Shield size={20} />
          </div>
          <h3 className="font-semibold text-lg">Segurança e Privacidade</h3>
        </div>
        
        <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
          {/* PIN Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Bloqueio por PIN</p>
              <p className="text-sm text-gray-500">Exigir senha de 4 dígitos para abrir o app.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.security?.pinEnabled || false}
                onChange={() => {
                  if (!settings.security?.pinEnabled) {
                    setIsPinModalOpen(true);
                  } else {
                    updateSettings({ 
                      security: { ...settings.security, pinEnabled: false, biometryEnabled: false } 
                    });
                  }
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-light-accent dark:peer-checked:bg-dark-accent"></div>
            </label>
          </div>

          {/* Change PIN Button */}
          {settings.security?.pinEnabled && (
            <div className="flex justify-start">
              <button 
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className="text-xs font-bold text-gray-500 hover:text-light-accent transition-colors"
              >
                Alterar código PIN
              </button>
            </div>
          )}

          {/* Biometry Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint size={18} className="text-gray-400" />
              <div>
                <p className="font-medium">Biometria</p>
                <p className="text-sm text-gray-500">Usar Digital ou FaceID para desbloqueio rápido.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.security?.biometryEnabled || false}
                onChange={async () => {
                  if (!settings.security?.biometryEnabled) {
                    try {
                      const result = await NativeBiometric.isAvailable({ useFallback: true });
                      if (!result.isAvailable) {
                        alert("Biometria não disponível neste dispositivo.");
                        return;
                      }

                      // Test authentication before enabling
                      await NativeBiometric.verifyIdentity({
                        reason: "Confirme sua biometria para ativar esta função",
                        title: "Ativar Biometria",
                        subtitle: "Teste de segurança",
                      });

                      updateSettings({ 
                        security: { ...settings.security, biometryEnabled: true } 
                      });
                      alert("Biometria ativada com sucesso!");
                    } catch (e) {
                      alert("Falha na autenticação ou cancelado pelo usuário.");
                    }
                  } else {
                    updateSettings({ 
                      security: { ...settings.security, biometryEnabled: false } 
                    });
                  }
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-light-accent dark:peer-checked:bg-dark-accent"></div>
            </label>
          </div>

          <PinSetupModal 
            isOpen={isPinModalOpen} 
            onClose={() => setIsPinModalOpen(false)}
            onFinish={(newPin) => {
              updateSettings({ 
                security: { ...settings.security, pinEnabled: true, pinCode: newPin } 
              });
              setIsPinModalOpen(false);
              alert("PIN configurado com sucesso!");
            }}
          />
        </div>
      </div>

      <div className="card space-y-6">
        <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-800 pb-4">Gerenciamento de Dados</h3>
        <p className="text-sm text-gray-500 mb-4">Seus dados são salvos localmente. Faça backups regulares em JSON para restauração ou Markdown para visualização externa.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors shadow-sm"
          >
            <Download className="text-blue-500" />
            <div className="text-left">
              <p className="font-medium">Backup Completo</p>
              <p className="text-xs text-gray-500">Formato JSON (Restauração)</p>
            </div>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors shadow-sm"
          >
            <Upload className="text-green-500" />
            <div className="text-left">
              <p className="font-medium">Importar Backup</p>
              <p className="text-xs text-gray-500">Selecionar arquivo .json</p>
            </div>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImport}
            />
          </button>

          <button 
            onClick={handleExportMarkdown}
            className="flex items-center justify-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors shadow-sm md:col-span-2"
          >
            <FileText className="text-purple-500" />
            <div className="text-left">
              <p className="font-medium">Exportar p/ Obsidian</p>
              <p className="text-xs text-gray-500">Formato Markdown (.md) com tabelas formatadas</p>
            </div>
          </button>
        </div>

        <div className="pt-6 mt-6 border-t border-red-100 dark:border-red-900/30">
           <h4 className="font-medium text-red-500 mb-2">Zona de Perigo</h4>
           <button 
             onClick={handleReset}
             className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all font-bold"
           >
             <Trash2 size={18} /> Zerar Aplicativo (Perigo)
           </button>
        </div>
      </div>

      {/* Support Section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <Coffee size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Que tal me pagar um café? ☕</h3>
            <p className="text-sm text-gray-500">Se gostou do app, considere apoiar o projeto.</p>
          </div>
        </div>

        {(settings.pixKey || settings.btcAddress) && (
          <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Minhas chaves para donations:</p>
            
            {settings.pixKey && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">PIX</span>
                <code className="flex-1 text-sm font-mono bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 truncate">
                  {settings.pixKey}
                </code>
                <button
                  onClick={() => copyToClipboard(settings.pixKey, 'pix')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copiar PIX"
                >
                  {copied === 'pix' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            )}

            {settings.btcAddress && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded">BTC</span>
                <code className="flex-1 text-sm font-mono bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 truncate">
                  {settings.btcAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(settings.btcAddress, 'btc')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copiar BTC"
                >
                  {copied === 'btc' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            )}
          </div>
        )}

        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors list-none flex items-center gap-1">
            <span className="text-xs opacity-50 group-open:hidden">►</span>
            <span className="text-xs opacity-50 hidden group-open:block">▼</span>
            Configurar minhas chaves de donation
          </summary>
          <form onSubmit={handleSupportSettings} className="mt-4 space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-sm font-medium mb-1">Chave PIX</label>
              <input 
                name="pixKey"
                type="text" 
                defaultValue={settings.pixKey || ''} 
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="input-field" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endereço Bitcoin (BTC)</label>
              <input 
                name="btcAddress"
                type="text" 
                defaultValue={settings.btcAddress || ''} 
                placeholder="bc1q..."
                className="input-field font-mono text-sm" 
              />
            </div>
            <button type="submit" className="btn-secondary text-sm flex items-center gap-2">
              <Save size={16} /> Salvar Chaves
            </button>
          </form>
        </details>
      </div>

    </div>
  );
};

export default Settings;
