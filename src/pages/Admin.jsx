import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';

export default function Admin() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState({ nomeCompleto: '', email: '', password: '', papel: 'usuario' });

  const carregarUsuarios = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from('perfis')
      .select('id, nome_completo, email, papel, criado_em')
      .order('criado_em', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao carregar usuários', description: error.message, variant: 'destructive' });
    } else {
      setUsuarios(data);
    }
    setCarregando(false);
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setCriando(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('admin-criar-usuario', {
      body: {
        email: form.email,
        password: form.password,
        nomeCompleto: form.nomeCompleto,
        papel: form.papel,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setCriando(false);

    if (error || data?.error) {
      toast({
        title: 'Não foi possível criar o usuário',
        description: data?.error ?? error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Usuário criado com sucesso' });
    setForm({ nomeCompleto: '', email: '', password: '', papel: 'usuario' });
    carregarUsuarios();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Administração de usuários</h1>
            <p className="text-xs text-muted-foreground leading-tight">Criação e gestão de acessos ao sistema</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="space-y-1">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Novo usuário
            </h2>
            <p className="text-xs text-muted-foreground">
              O usuário criado poderá entrar imediatamente com o e-mail e senha definidos abaixo.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nomeCompleto">Nome completo</Label>
                <Input
                  id="nomeCompleto"
                  value={form.nomeCompleto}
                  onChange={(e) => setForm((p) => ({ ...p, nomeCompleto: e.target.value }))}
                  placeholder="Nome do usuário"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="usuario@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="papel">Nível de acesso</Label>
                <Select value={form.papel} onValueChange={(v) => setForm((p) => ({ ...p, papel: v }))}>
                  <SelectTrigger id="papel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={criando}>
                  {criando ? 'Criando...' : 'Criar usuário'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <h2 className="font-semibold text-base">Usuários cadastrados</h2>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.nome_completo || '—'}</TableCell>
                      <TableCell className="text-xs">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.papel === 'admin' ? 'default' : 'secondary'}>
                          {u.papel === 'admin' ? 'Administrador' : 'Usuário'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
