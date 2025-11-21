# Message Mirroring - Python Worker

⚡ **Versão 2.0** - Agora com controle remoto completo!

## 📋 Requisitos

- Python 3.8 ou superior
- macOS (ou qualquer sistema Unix)
- Conta do Telegram configurada

## 🆕 Novidades da Versão 2.0

### Controle Remoto
- ✅ **Ativar/Pausar remotamente** - Controle o bot direto do dashboard
- 🔄 **Reiniciar remotamente** - Reinicie o worker sem acesso SSH
- 💓 **Heartbeat automático** - Sistema detecta se o worker está online
- 📊 **Métricas avançadas** - Analytics detalhados de performance

### Como Funciona
O worker agora verifica o status a cada 5 segundos e:
- Respeita o botão de ativar/pausar no dashboard
- Executa restart quando solicitado
- Envia heartbeat a cada 30 segundos
- Reporta métricas de performance

## 🚀 Instalação

### 1. Instalar Python 3

```bash
# Verificar se já tem Python 3
python3 --version

# Se não tiver, instalar via Homebrew (macOS)
brew install python3
```

### 2. Criar pasta do projeto

```bash
mkdir ~/telegram-worker
cd ~/telegram-worker
```

### 3. Instalar dependências

```bash
pip3 install telethon requests python-dotenv
```

### 4. Copiar arquivos

Copie os arquivos `telegram_worker.py` e `.env.example` para a pasta `~/telegram-worker`

### 5. Configurar .env

```bash
# Copiar o exemplo
cp .env.example .env

# Editar o arquivo .env
nano .env
```

Preencha com:
- `API_ENDPOINT`: https://mishbzanrtzlexgdwenp.supabase.co/functions/v1
- `CONFIG_ID`: Copie do Admin Panel após configurar os canais

## 🏃 Execução

### Iniciar o Worker

```bash
python3 telegram_worker.py
```

Na primeira execução, você precisará:
1. Inserir o código de verificação enviado pelo Telegram
2. Se tiver 2FA ativo, inserir a senha

### Rodar em Background

```bash
# Usar nohup para rodar em background
nohup python3 telegram_worker.py > worker.log 2>&1 &

# Ver logs em tempo real
tail -f worker.log

# Parar o worker
pkill -f telegram_worker.py
```

## 📊 Logs

O worker mostra logs detalhados:
- ✅ Mensagens replicadas com sucesso
- ❌ Erros durante a replicação
- 📨 Tipos de mensagem detectados
- 📊 Status de cada envio
- 💓 Heartbeat (a cada 30 segundos)
- 🔄 Reinícios remotos
- ▶️/⏸️ Mudanças de status

### Novos Logs da Versão 2.0
```
💓 Heartbeat enviado
🔄 Reinício solicitado remotamente...
📡 Desconectando do Telegram...
⚙️  Recarregando configuração...
🔌 Reconectando ao Telegram...
✅ Worker reiniciado com sucesso!
▶️  Bot reativado - processamento retomado
⏸️  Bot pausado - aguardando reativação...
```

## 🎮 Controle Remoto

### Ativar/Pausar o Bot
1. Acesse o Dashboard
2. Use o switch "Ativo/Pausado" no card Live Cycle
3. O worker responderá em até 5 segundos

### Reiniciar o Worker
1. Clique no botão "🔄 Reiniciar Worker"
2. O worker irá:
   - Desconectar do Telegram
   - Recarregar a configuração
   - Reconectar automaticamente
3. Processo leva ~5-10 segundos

### Monitorar Status
- **Worker Online/Offline**: Mostra se o worker está conectado
- **Última conexão**: Tempo desde o último heartbeat
- **Último restart**: Quando foi reiniciado pela última vez

## 🔧 Solução de Problemas

### Erro: "Config not found"
- Verifique se o CONFIG_ID está correto
- Confirme que salvou a configuração no Admin Panel

### Erro: "Phone number not registered"
- Verifique se o telefone está correto no Admin Panel
- Use o formato internacional: +5511999999999

### Mensagens não são replicadas
- Verifique se o worker está rodando: `ps aux | grep telegram_worker`
- Confira os logs para erros
- Confirme que sua conta é admin/membro de todos os canais
- **NOVO**: Verifique se o bot está ativo no dashboard (não pausado)

### Worker aparece como Offline
- Verifique se o processo está rodando
- Confira os logs para erros de conexão
- O worker pode estar travado - use o botão de Reiniciar
- Se persistir, mate o processo e inicie novamente

### Botão de Pausar não funciona
- Aguarde até 5 segundos (intervalo de verificação)
- Verifique os logs do worker para confirmação
- O worker deve mostrar: "⏸️ Bot pausado - aguardando reativação..."

### Reiniciar não funciona
- Certifique-se que o worker está online primeiro
- Aguarde até 10 segundos para o restart completar
- Se travar, mate o processo manualmente e reinicie

## 📝 Estrutura de Arquivos

```
~/telegram-worker/
├── telegram_worker.py    # Script principal
├── .env                  # Configurações (NÃO commitar)
├── .env.example          # Template de configuração
├── worker.log            # Logs de execução
└── session_name.session  # Sessão do Telegram (auto-criada)
```

## 🔒 Segurança

- **NUNCA** compartilhe seu arquivo `.env`
- O arquivo `session_name.session` contém credenciais sensíveis
- Mantenha backups do `.env` e `session_name.session`

## ⚠️ IMPORTANTE: Atualização para Versão 2.0

Se você já está usando o worker antigo:

1. **Faça backup** dos seus arquivos `.env` e `session_name.session`
2. **Substitua** o arquivo `telegram_worker.py` pela nova versão
3. **Reinicie** o worker:
   ```bash
   pkill -f telegram_worker.py
   python3 telegram_worker.py
   ```
4. Verifique no dashboard se o worker aparece como "Online"

### O que muda?
- ✅ Agora você pode controlar tudo pelo dashboard
- ✅ Não precisa mais SSH para pausar/reiniciar
- ✅ Sistema de heartbeat detecta se está offline
- ✅ Métricas de performance automáticas

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `cat worker.log`
2. Confirme que todos os canais existem
3. Teste com delay maior (ex: 5 segundos)
4. Verifique se não está sendo limitado pelo Telegram (flood wait)
