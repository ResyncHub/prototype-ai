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
      setSuccess('Profile updated successfully');
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
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>
            Manage your personal information
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
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Account Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your account and security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account Created</Label>
            <p className="text-sm text-muted-foreground">
              {profile?.created_at 
                ? new Date(profile.created_at).toLocaleDateString('en-US')
                : 'Unknown'
              }
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Change Password</h4>
            <p className="text-sm text-muted-foreground">
              To change your password, use the "Forgot password?" option on the login page.
            </p>
            <Button variant="outline" asChild>
              <a href="/forgot-password">Reset Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-destructive/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <LogOut className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Sign Out</CardTitle>
          </div>
          <CardDescription>
            End your current session
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
                Signing out...
              </>
            ) : (
              'Sign Out'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}