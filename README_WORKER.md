# Message Mirroring - Python Worker

## 📋 Requisitos

- Python 3.8 ou superior
- macOS (ou qualquer sistema Unix)
- Conta do Telegram configurada

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

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `cat worker.log`
2. Confirme que todos os canais existem
3. Teste com delay maior (ex: 5 segundos)
4. Verifique se não está sendo limitado pelo Telegram (flood wait)
