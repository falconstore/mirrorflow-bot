"""
Message Mirroring - Python Worker for Telegram
Versão: 1.0.0

Este worker escuta mensagens do canal VIP e replica para os canais de destino.
Configuração: Use o arquivo .env para definir API_ENDPOINT e CONFIG_ID.

Dependências:
pip3 install telethon requests python-dotenv

Execução:
python3 telegram_worker.py
"""

import os
import asyncio
import requests
from telethon import TelegramClient, events
from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument
from dotenv import load_dotenv
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente do diretório do script
script_dir = Path(__file__).parent
env_path = script_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Configurações
API_ENDPOINT = os.getenv('API_ENDPOINT')
CONFIG_ID = os.getenv('CONFIG_ID')

# Validar que as variáveis foram carregadas
if not API_ENDPOINT or not CONFIG_ID:
    logger.error(f"❌ ERRO: Variáveis de ambiente não encontradas!")
    logger.error(f"   Procurando .env em: {env_path}")
    logger.error(f"   API_ENDPOINT: {API_ENDPOINT}")
    logger.error(f"   CONFIG_ID: {CONFIG_ID}")
    logger.error(f"")
    logger.error(f"   Certifique-se que o arquivo .env existe e contém:")
    logger.error(f"   API_ENDPOINT=https://mishbzanrtzlexgdwenp.supabase.co/functions/v1")
    logger.error(f"   CONFIG_ID=79fb6f65-3f61-48bc-9ad0-95eda9a0fea0")
    exit(1)

logger.info(f"✅ Configurações carregadas do arquivo: {env_path}")

class TelegramWorker:
    def __init__(self):
        self.client = None
        self.config = None
        self.is_running = False
        
    async def fetch_config(self):
        """Busca configuração do backend Lovable"""
        try:
            response = requests.get(f"{API_ENDPOINT}/worker-config?config_id={CONFIG_ID}")
            response.raise_for_status()
            self.config = response.json()
            logger.info(f"✅ Configuração carregada: {len(self.config['destination_channels'])} canais de destino")
            return True
        except Exception as e:
            logger.error(f"❌ Erro ao buscar configuração: {e}")
            return False
    
    async def report_log(self, source_channel_id, destination_channel_id, message_type, status, error=None):
        """Reporta log de replicação para o backend"""
        try:
            payload = {
                "config_id": CONFIG_ID,
                "source_channel_id": source_channel_id,
                "destination_channel_id": destination_channel_id,
                "message_type": message_type,
                "status": status,
                "error_message": error
            }
            requests.post(f"{API_ENDPOINT}/worker-log", json=payload)
            logger.info(f"📊 Log reportado: {status}")
        except Exception as e:
            logger.error(f"❌ Erro ao reportar log: {e}")
    
    async def start(self):
        """Inicia o worker"""
        # Buscar configuração
        if not await self.fetch_config():
            logger.error("❌ Não foi possível iniciar. Verifique suas credenciais.")
            return
        
        # Criar cliente Telethon
        self.client = TelegramClient(
            'session_name',
            api_id=int(self.config['api_id']),
            api_hash=self.config['api_hash']
        )
        
        await self.client.start(phone=self.config['phone_number'])
        logger.info("🚀 Worker conectado ao Telegram!")
        
        # Registrar event handler
        source_channel = int(self.config['source_channel_id'])
        
        @self.client.on(events.NewMessage(chats=source_channel))
        async def handler(event):
            await self.handle_new_message(event)
        
        logger.info(f"👂 Ouvindo mensagens do canal: {source_channel}")
        self.is_running = True
        
        # Manter rodando
        await self.client.run_until_disconnected()
    
    async def handle_new_message(self, event):
        """Processa nova mensagem e replica"""
        message = event.message
        source_channel = event.chat_id
        
        # Detectar tipo de mensagem
        if message.photo:
            message_type = "photo"
        elif message.video:
            message_type = "video"
        elif message.voice or message.audio:
            message_type = "audio"
        elif message.document:
            message_type = "document"
        else:
            message_type = "text"
        
        logger.info(f"📨 Nova mensagem detectada: {message_type}")
        
        # Replicar para cada canal de destino
        for dest_channel_id in self.config['destination_channels']:
            try:
                # Delay anti-flood
                await asyncio.sleep(self.config['delay_seconds'])
                
                # COPIAR como nova mensagem (sem "Forwarded from")
                if message.text and not message.media:
                    # Texto simples
                    await self.client.send_message(int(dest_channel_id), message.text)
                
                elif message.photo:
                    # Foto (com ou sem legenda)
                    await self.client.send_file(
                        int(dest_channel_id),
                        message.photo,
                        caption=message.text if message.text else None
                    )
                
                elif message.video:
                    # Vídeo
                    await self.client.send_file(
                        int(dest_channel_id),
                        message.video,
                        caption=message.text if message.text else None
                    )
                
                elif message.voice or message.audio:
                    # Áudio
                    await self.client.send_file(
                        int(dest_channel_id),
                        message.voice or message.audio,
                        caption=message.text if message.text else None
                    )
                
                elif message.document:
                    # Documento/arquivo
                    await self.client.send_file(
                        int(dest_channel_id),
                        message.document,
                        caption=message.text if message.text else None
                    )
                
                # Reportar sucesso
                await self.report_log(
                    source_channel,
                    dest_channel_id,
                    message_type,
                    "success"
                )
                
                logger.info(f"✅ Replicado para: {dest_channel_id}")
                
            except Exception as e:
                # Reportar falha
                await self.report_log(
                    source_channel,
                    dest_channel_id,
                    message_type,
                    "failed",
                    str(e)
                )
                logger.error(f"❌ Erro ao replicar para {dest_channel_id}: {e}")
    
    async def stop(self):
        """Para o worker"""
        self.is_running = False
        if self.client:
            await self.client.disconnect()
        logger.info("⏹️ Worker parado")

# Executar
if __name__ == "__main__":
    worker = TelegramWorker()
    try:
        asyncio.run(worker.start())
    except KeyboardInterrupt:
        logger.info("⏹️ Worker interrompido pelo usuário")
