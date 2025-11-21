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

    const body = await req.json();
    const { config_id, metrics } = body;

    if (!config_id || !metrics) {
      return new Response(JSON.stringify({ error: 'config_id and metrics are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Aggregate metrics by hour
    const hour = new Date();
    hour.setMinutes(0, 0, 0);
    const hourKey = hour.toISOString();

    // Get existing metrics for this hour
    const { data: existingMetrics } = await supabase
      .from('hourly_metrics')
      .select('*')
      .eq('config_id', config_id)
      .eq('hour', hourKey)
      .single();

    const newTotalMessages = (existingMetrics?.total_messages || 0) + metrics.total_messages;
    const newSuccessful = (existingMetrics?.successful_messages || 0) + metrics.successful_messages;
    const newFailed = (existingMetrics?.failed_messages || 0) + metrics.failed_messages;

    // Calculate new average latency
    let newAvgLatency = metrics.avg_latency_seconds;
    if (existingMetrics?.avg_latency_seconds) {
      const existingTotal = existingMetrics.total_messages * parseFloat(existingMetrics.avg_latency_seconds);
      const newTotal = metrics.total_messages * metrics.avg_latency_seconds;
      newAvgLatency = (existingTotal + newTotal) / newTotalMessages;
    }

    // Upsert metrics
    const { error: upsertError } = await supabase
      .from('hourly_metrics')
      .upsert({
        config_id,
        hour: hourKey,
        total_messages: newTotalMessages,
        successful_messages: newSuccessful,
        failed_messages: newFailed,
        avg_latency_seconds: newAvgLatency,
      }, {
        onConflict: 'config_id,hour'
      });

    if (upsertError) {
      console.error('Error upserting metrics:', upsertError);
      return new Response(JSON.stringify({ error: upsertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Metrics saved' }), {
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
