import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle POST request (save session_string, update restart flag, heartbeat)
    if (req.method === 'POST') {
      const body = await req.json();
      const { config_id, session_string, restart_requested, worker_heartbeat } = body;

      if (!config_id) {
        return new Response(JSON.stringify({ error: 'config_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Build update object based on what's provided
      const updates: any = {};
      if (session_string !== undefined) updates.session_string = session_string;
      if (restart_requested !== undefined) updates.restart_requested = restart_requested;
      if (worker_heartbeat !== undefined) updates.worker_last_heartbeat = new Date().toISOString();
      if (restart_requested === false) updates.last_restart_at = new Date().toISOString();

      // Update telegram_configs
      const { error: updateError } = await supabase
        .from('telegram_configs')
        .update(updates)
        .eq('id', config_id);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'Config updated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle GET request (fetch config)
    const url = new URL(req.url);
    const configId = url.searchParams.get('config_id');

    if (!configId) {
      return new Response(JSON.stringify({ error: 'config_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get config
    const { data: config, error: configError } = await supabase
      .from('telegram_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (configError || !config) {
      return new Response(JSON.stringify({ error: 'Config not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get source channel
    const { data: sourceChannel } = await supabase
      .from('source_channels')
      .select('*')
      .eq('config_id', configId)
      .single();

    // Get destination channels
    const { data: destinationChannels } = await supabase
      .from('destination_channels')
      .select('*')
      .eq('config_id', configId)
      .eq('is_active', true);

    const response = {
      api_id: config.api_id,
      api_hash: config.api_hash,
      phone_number: config.phone_number,
      source_channel_id: sourceChannel?.channel_id,
      destination_channels: destinationChannels?.map(d => d.channel_id) || [],
      delay_seconds: config.delay_seconds,
      status: config.status,
      session_string: config.session_string,
      restart_requested: config.restart_requested || false,
      last_restart_at: config.last_restart_at,
      worker_last_heartbeat: config.worker_last_heartbeat,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
