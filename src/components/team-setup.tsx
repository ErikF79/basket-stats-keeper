'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

interface TeamSetupProps {
  onSetupComplete: (teamName: string, playerNames: string[]) => void;
}

const BasketballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93l14.14 14.14" />
      <path d="M19.07 4.93L4.93 19.07" />
      <path d="M2 12h20" />
      <path d="M12 2a10 10 0 0 0-4.93 1.93" />
      <path d="M12 22a10 10 0 0 1 4.93-1.93" />
    </svg>
);


export default function TeamSetup({ onSetupComplete }: TeamSetupProps) {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<string[]>(['Giocatore 1']);
  const { toast } = useToast();

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    setPlayers([...players, `Giocatore ${players.length + 1}`]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 1) {
       toast({
        variant: "destructive",
        title: "Impossibile rimuovere il giocatore",
        description: "Devi avere almeno un giocatore.",
      })
      return;
    }
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTeamName = teamName.trim();
    const filteredPlayers = players.map(p => p.trim()).filter(p => p.length > 0);

    if (!trimmedTeamName) {
       toast({
        variant: "destructive",
        title: "Nome squadra non valido",
        description: "Per favore, inserisci un nome per la tua squadra.",
      })
      return;
    }
    if (filteredPlayers.length === 0) {
      toast({
        variant: "destructive",
        title: "Nessun giocatore aggiunto",
        description: "Per favore, aggiungi almeno un giocatore.",
      })
      return;
    }
    onSetupComplete(trimmedTeamName, filteredPlayers);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="text-center mb-8">
        <BasketballIcon className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold mt-4">Segnapunti Basket</h1>
        <p className="text-muted-foreground mt-2">Configura la tua squadra per iniziare a tracciare le statistiche di gioco in tempo reale.</p>
      </div>
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Configurazione Squadra</CardTitle>
            <CardDescription>Inserisci il nome della tua squadra e aggiungi i tuoi giocatori.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamName">Nome Squadra</Label>
              <Input 
                id="teamName" 
                placeholder="es. Le All-Stars" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Label>Giocatori</Label>
              {players.map((player, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    placeholder={`Nome Giocatore ${index + 1}`}
                    value={player}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePlayer(index)}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Rimuovi Giocatore</span>
                  </Button>
                </div>
              ))}
               <Button type="button" variant="outline" onClick={addPlayer} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Aggiungi Giocatore
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Inizia a Tracciare le Statistiche
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
