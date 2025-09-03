import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Settings, LogOut } from 'lucide-react';

export function UserProfile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error: updateError } = await updateProfile({
      full_name: fullName
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Profil został zaktualizowany');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await signOut();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Informacje o profilu</CardTitle>
          </div>
          <CardDescription>
            Zarządzaj swoimi danymi osobowymi
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email nie może być zmieniony
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Imię i nazwisko</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                placeholder="Wprowadź swoje imię i nazwisko"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                'Zaktualizuj profil'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Ustawienia konta</CardTitle>
          </div>
          <CardDescription>
            Zarządzaj swoim kontem i bezpieczeństwem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Data utworzenia konta</Label>
            <p className="text-sm text-muted-foreground">
              {profile?.created_at 
                ? new Date(profile.created_at).toLocaleDateString('pl-PL')
                : 'Nieznana'
              }
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Zmiana hasła</h4>
            <p className="text-sm text-muted-foreground">
              Aby zmienić hasło, skorzystaj z opcji "Zapomniałeś hasła?" na stronie logowania.
            </p>
            <Button variant="outline" asChild>
              <a href="/forgot-password">Zresetuj hasło</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-destructive/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <LogOut className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Wyloguj się</CardTitle>
          </div>
          <CardDescription>
            Zakończ bieżącą sesję
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wylogowywanie...
              </>
            ) : (
              'Wyloguj się'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}