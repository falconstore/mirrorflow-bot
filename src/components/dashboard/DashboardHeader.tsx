import { Button } from "@/components/ui/button";
import { Radio, LogOut, BarChart3, HelpCircle, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Desconectado",
      description: "Você foi desconectado com sucesso",
    });
    navigate("/auth");
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Radio className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Message Mirroring</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={location.pathname === "/dashboard" ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          
          <Button 
            variant={location.pathname === "/analytics" ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigate("/analytics")}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/instructions")}
          >
            <HelpCircle className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};
