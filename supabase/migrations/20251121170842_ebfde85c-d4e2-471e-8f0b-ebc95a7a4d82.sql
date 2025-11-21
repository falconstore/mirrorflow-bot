-- Add worker control fields to telegram_configs
ALTER TABLE telegram_configs 
ADD COLUMN IF NOT EXISTS restart_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_restart_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS worker_last_heartbeat timestamp with time zone;

COMMENT ON COLUMN telegram_configs.restart_requested IS 'Flag para solicitar reinício do worker';
COMMENT ON COLUMN telegram_configs.last_restart_at IS 'Timestamp do último restart executado';
COMMENT ON COLUMN telegram_configs.worker_last_heartbeat IS 'Último heartbeat recebido do worker';

-- Create hourly_metrics table for aggregated analytics
CREATE TABLE IF NOT EXISTS hourly_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES telegram_configs(id) ON DELETE CASCADE,
  hour timestamp with time zone NOT NULL,
  total_messages integer DEFAULT 0,
  successful_messages integer DEFAULT 0,
  failed_messages integer DEFAULT 0,
  avg_latency_seconds numeric(10,2),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(config_id, hour)
);

-- Create worker_status_history table for status tracking
CREATE TABLE IF NOT EXISTS worker_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES telegram_configs(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('active', 'paused', 'error', 'restarting')),
  changed_at timestamp with time zone DEFAULT now(),
  changed_by uuid REFERENCES auth.users(id),
  notes text
);

-- Enable RLS on new tables
ALTER TABLE hourly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for hourly_metrics
CREATE POLICY "Users can view their own metrics"
  ON hourly_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM telegram_configs 
    WHERE telegram_configs.id = hourly_metrics.config_id 
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Service role can insert metrics"
  ON hourly_metrics FOR INSERT
  WITH CHECK (true);

-- RLS policies for worker_status_history
CREATE POLICY "Users can view their own history"
  ON worker_status_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM telegram_configs 
    WHERE telegram_configs.id = worker_status_history.config_id 
    AND telegram_configs.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own history"
  ON worker_status_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM telegram_configs 
    WHERE telegram_configs.id = worker_status_history.config_id 
    AND telegram_configs.user_id = auth.uid()
  ));