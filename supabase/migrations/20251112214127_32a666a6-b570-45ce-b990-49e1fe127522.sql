-- Create telegram_configs table
CREATE TABLE public.telegram_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_id TEXT NOT NULL,
  api_hash TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  session_string TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  delay_seconds INTEGER NOT NULL DEFAULT 2 CHECK (delay_seconds >= 0 AND delay_seconds <= 60),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create source_channels table
CREATE TABLE public.source_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES public.telegram_configs(id) ON DELETE CASCADE,
  channel_id BIGINT NOT NULL,
  channel_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create destination_channels table
CREATE TABLE public.destination_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES public.telegram_configs(id) ON DELETE CASCADE,
  channel_id BIGINT NOT NULL,
  channel_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create replication_logs table
CREATE TABLE public.replication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES public.telegram_configs(id) ON DELETE CASCADE,
  source_channel_id BIGINT NOT NULL,
  destination_channel_id BIGINT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'photo', 'video', 'audio', 'document')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  replicated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.telegram_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for telegram_configs
CREATE POLICY "Users can view their own telegram configs"
  ON public.telegram_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telegram configs"
  ON public.telegram_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram configs"
  ON public.telegram_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram configs"
  ON public.telegram_configs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for source_channels
CREATE POLICY "Users can view their own source channels"
  ON public.source_channels FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = source_channels.config_id
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own source channels"
  ON public.source_channels FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = config_id
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own source channels"
  ON public.source_channels FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = source_channels.config_id
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own source channels"
  ON public.source_channels FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = source_channels.config_id
    AND telegram_configs.user_id = auth.uid()
  ));

-- RLS Policies for destination_channels
CREATE POLICY "Users can view their own destination channels"
  ON public.destination_channels FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = destination_channels.config_id
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own destination channels"
  ON public.destination_channels FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = config_id
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own destination channels"
  ON public.destination_channels FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = destination_channels.config_id
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own destination channels"
  ON public.destination_channels FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = destination_channels.config_id
    AND telegram_configs.user_id = auth.uid()
  ));

-- RLS Policies for replication_logs
CREATE POLICY "Users can view their own replication logs"
  ON public.replication_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.telegram_configs
    WHERE telegram_configs.id = replication_logs.config_id
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Service role can insert replication logs"
  ON public.replication_logs FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_telegram_configs_user_id ON public.telegram_configs(user_id);
CREATE INDEX idx_source_channels_config_id ON public.source_channels(config_id);
CREATE INDEX idx_destination_channels_config_id ON public.destination_channels(config_id);
CREATE INDEX idx_replication_logs_config_id ON public.replication_logs(config_id);
CREATE INDEX idx_replication_logs_created_at ON public.replication_logs(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_telegram_configs_updated_at
  BEFORE UPDATE ON public.telegram_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for replication_logs (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.replication_logs;