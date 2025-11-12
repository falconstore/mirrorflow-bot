import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  Code, 
  Plus, 
  Key, 
  Lock, 
  AlertTriangle, 
  Rocket, 
  ArrowRight, 
  ShieldAlert, 
  XCircle, 
  HelpCircle 
} from "lucide-react";

const Instructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="mt-6 mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3 text-foreground">
            <BookOpen className="w-10 h-10 text-primary" />
            Como Obter Suas Credenciais do Telegram
          </h1>
          <p className="text-muted-foreground mt-2">
            Siga este guia passo a passo para configurar sua conta
          </p>
        </div>

        <div className="space-y-6">
          {/* O que você vai precisar */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                O que você vai precisar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <strong>API ID</strong>: Número de identificação único
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <strong>API Hash</strong>: Chave secreta alfanumérica
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <strong>Número de telefone</strong>: Vinculado à sua conta Telegram
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Passo 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                Acesse o site oficial do Telegram
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Abra seu navegador e acesse:{" "}
                <a 
                  href="https://my.telegram.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono font-semibold"
                >
                  https://my.telegram.org
                </a>
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm">
                  <strong>💡 Dica:</strong> Use o mesmo navegador onde você já está logado no Telegram Web para facilitar o processo.
                </p>
              </div>
              
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Globe className="w-16 h-16 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Passo 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                Faça login com seu número de telefone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside">
                <li>Insira seu <strong>número de telefone</strong> (com código do país, ex: +55 11 99999-9999)</li>
                <li>Clique em <strong>"Next"</strong></li>
                <li>Você receberá um <strong>código de confirmação</strong> no Telegram</li>
                <li>Insira o código no site</li>
              </ol>
              
              <Alert>
                <ShieldCheck className="w-4 h-4" />
                <AlertTitle>Segurança</AlertTitle>
                <AlertDescription>
                  Este é o site oficial do Telegram. Você receberá uma mensagem do próprio Telegram com o código de verificação.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Passo 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                Navegue até "API development tools"
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Após fazer login, você verá algumas opções. Clique em:</p>
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <Code className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-lg">API development tools</p>
              </div>
            </CardContent>
          </Card>

          {/* Passo 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                Preencha o formulário de criação do app
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Você precisará preencher os seguintes campos:</p>
              
              <div className="space-y-3">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="font-semibold mb-1">App title</p>
                  <p className="text-sm text-muted-foreground">
                    Exemplo: "Message Mirroring" ou "Meu Bot"
                  </p>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="font-semibold mb-1">Short name</p>
                  <p className="text-sm text-muted-foreground">
                    Exemplo: "mirroring" (sem espaços)
                  </p>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="font-semibold mb-1">Platform</p>
                  <p className="text-sm text-muted-foreground">
                    Escolha: <strong>"Other"</strong>
                  </p>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="font-semibold mb-1">Description (opcional)</p>
                  <p className="text-sm text-muted-foreground">
                    Exemplo: "Sistema de replicação de mensagens entre canais"
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-primary/10 p-3 rounded-lg">
                <Plus className="w-4 h-4" />
                <span className="font-semibold">Clique em "Create application"</span>
              </div>
            </CardContent>
          </Card>

          {/* Passo 5 */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  5
                </div>
                Copie suas credenciais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Após criar o app, você verá duas informações importantes na tela:
              </p>
              
              <div className="space-y-3">
                <div className="bg-blue-500/10 border-2 border-blue-500/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-lg">API ID</p>
                    <Key className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="bg-background p-3 rounded font-mono text-sm">
                    12345678
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Este é um número de 7-8 dígitos
                  </p>
                </div>
                
                <div className="bg-purple-500/10 border-2 border-purple-500/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-lg">API Hash</p>
                    <Lock className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="bg-background p-3 rounded font-mono text-xs break-all">
                    abcdef1234567890abcdef1234567890
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Uma string de 32 caracteres (letras e números)
                  </p>
                </div>
              </div>
              
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <AlertTitle>Atenção!</AlertTitle>
                <AlertDescription>
                  Copie e guarde essas informações em um local seguro. Você precisará delas para configurar o sistema.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Próximos Passos */}
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-green-600" />
                Pronto! Agora você pode configurar o sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Com suas credenciais em mãos, você está pronto para:</p>
              
              <ol className="space-y-2 list-decimal list-inside">
                <li>Voltar para a <strong>página de autenticação</strong></li>
                <li>Inserir seu <strong>API ID</strong></li>
                <li>Inserir seu <strong>API Hash</strong></li>
                <li>Inserir seu <strong>número de telefone</strong></li>
                <li>Concluir a configuração</li>
              </ol>
              
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full" 
                size="lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-600" />
                ⚠️ Importante: Mantenha suas credenciais seguras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Nunca compartilhe</strong> seu API Hash com outras pessoas</p>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Não publique</strong> essas credenciais em redes sociais ou fóruns</p>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Não use</strong> em sites ou apps suspeitos</p>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Guarde</strong> em um gerenciador de senhas seguro</p>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Se comprometidas</strong>, você pode revogar e criar novas credenciais em my.telegram.org</p>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="q1">
                  <AccordionTrigger>
                    Posso usar as mesmas credenciais em vários dispositivos?
                  </AccordionTrigger>
                  <AccordionContent>
                    Sim! As credenciais (API ID e Hash) são vinculadas à sua conta Telegram e podem ser usadas em múltiplos dispositivos simultaneamente.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q2">
                  <AccordionTrigger>
                    O que acontece se eu perder minhas credenciais?
                  </AccordionTrigger>
                  <AccordionContent>
                    Não se preocupe! Você pode acessar novamente my.telegram.org, fazer login e visualizar suas credenciais existentes ou criar um novo app.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q3">
                  <AccordionTrigger>
                    Minha conta ficará insegura ao criar um app?
                  </AccordionTrigger>
                  <AccordionContent>
                    Não! Criar um app é seguro e faz parte do processo oficial do Telegram. Apenas certifique-se de manter suas credenciais privadas.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q4">
                  <AccordionTrigger>
                    Posso deletar um app depois de criado?
                  </AccordionTrigger>
                  <AccordionContent>
                    Sim. Em my.telegram.org, você pode visualizar todos os seus apps e deletá-los se não precisar mais. Mas lembre-se: isso invalidará as credenciais associadas.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q5">
                  <AccordionTrigger>
                    Preciso de conhecimentos técnicos para criar um app?
                  </AccordionTrigger>
                  <AccordionContent>
                    Não! O processo é simples e visual. Basta seguir os passos acima. Não é necessário programar nada.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
