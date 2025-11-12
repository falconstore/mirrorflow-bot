import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Copy, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ChannelConfigurationProps {
  configId: string | null;
  onConfigCreated: (id: string) => void;
}

export const ChannelConfiguration = ({ configId, onConfigCreated }: ChannelConfigurationProps) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(!configId);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sourceChannelId, setSourceChannelId] = useState("");
  const [sourceChannelName, setSourceChannelName] = useState("");
  const [destinationChannels, setDestinationChannels] = useState([
    { id: "", name: "" }
  ]);
  const [delaySeconds, setDelaySeconds] = useState([2]);

  const handleAddDestination = () => {
    if (destinationChannels.length < 10) {
      setDestinationChannels([...destinationChannels, { id: "", name: "" }]);
    } else {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 10 canais de destino",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDestination = (index: number) => {
    setDestinationChannels(destinationChannels.filter((_, i) => i !== index));
  };

  const handleSaveConfiguration = async () => {
    if (!apiId || !apiHash || !phoneNumber || !sourceChannelId || !sourceChannelName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const validDestinations = destinationChannels.filter(d => d.id && d.name);
    if (validDestinations.length === 0) {
      toast({
        title: "Canais de destino",
        description: "Adicione pelo menos um canal de destino",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Create or update config
      const { data: config, error: configError } = await supabase
        .from("telegram_configs")
        .upsert({
          user_id: user.id,
          api_id: apiId,
          api_hash: apiHash,
          phone_number: phoneNumber,
          delay_seconds: delaySeconds[0],
          status: "active",
        })
        .select()
        .single();

      if (configError) throw configError;

      // Delete existing channels
      await supabase.from("source_channels").delete().eq("config_id", config.id);
      await supabase.from("destination_channels").delete().eq("config_id", config.id);

      // Create source channel
      await supabase.from("source_channels").insert({
        config_id: config.id,
        channel_id: parseInt(sourceChannelId),
        channel_name: sourceChannelName,
      });

      // Create destination channels
      await supabase.from("destination_channels").insert(
        validDestinations.map(d => ({
          config_id: config.id,
          channel_id: parseInt(d.id),
          channel_name: d.name,
        }))
      );

      onConfigCreated(config.id);
      setExpanded(false);

      toast({
        title: "Configuração salva!",
        description: "Sua configuração foi salva com sucesso. Copie o ID abaixo para usar no Worker.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyConfigId = () => {
    if (configId) {
      navigator.clipboard.writeText(configId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "ID copiado!",
        description: "Cole esse ID no arquivo .env do Worker Python",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <CardTitle>Configuração de Canais</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            {expanded ? "Minimizar" : "Expandir"}
          </Button>
        </div>
        <CardDescription>
          Configure seus canais do Telegram e credenciais da API
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiId">API ID *</Label>
                <Input
                  id="apiId"
                  value={apiId}
                  onChange={(e) => setApiId(e.target.value)}
                  placeholder="12345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiHash">API Hash *</Label>
                <Input
                  id="apiHash"
                  type="password"
                  value={apiHash}
                  onChange={(e) => setApiHash(e.target.value)}
                  placeholder="abcdef1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefone *</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+5511999999999"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4">Canal VIP (Fonte)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceChannelId">ID do Canal *</Label>
                  <Input
                    id="sourceChannelId"
                    value={sourceChannelId}
                    onChange={(e) => setSourceChannelId(e.target.value)}
                    placeholder="-1001234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sourceChannelName">Nome do Canal *</Label>
                  <Input
                    id="sourceChannelName"
                    value={sourceChannelName}
                    onChange={(e) => setSourceChannelName(e.target.value)}
                    placeholder="Meu Canal VIP"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Canais de Destino</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDestination}
                  disabled={destinationChannels.length >= 10}
                >
                  Adicionar Canal
                </Button>
              </div>
              
              <div className="space-y-3">
                {destinationChannels.map((channel, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={channel.id}
                      onChange={(e) => {
                        const updated = [...destinationChannels];
                        updated[index].id = e.target.value;
                        setDestinationChannels(updated);
                      }}
                      placeholder="ID do Canal"
                    />
                    <Input
                      value={channel.name}
                      onChange={(e) => {
                        const updated = [...destinationChannels];
                        updated[index].name = e.target.value;
                        setDestinationChannels(updated);
                      }}
                      placeholder="Nome do Canal"
                    />
                    {destinationChannels.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDestination(index)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4">Configurações Avançadas</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Delay entre envios: {delaySeconds[0]} segundos</Label>
                  <Slider
                    value={delaySeconds}
                    onValueChange={setDelaySeconds}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Tempo de espera entre cada envio (anti-flood)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveConfiguration} disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Configuração"}
          </Button>

          {configId && (
            <div className="pt-4 border-t border-border">
              <Label>Config ID (use no Worker Python)</Label>
              <div className="flex gap-2 mt-2">
                <Input value={configId} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="sm" onClick={handleCopyConfigId}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
