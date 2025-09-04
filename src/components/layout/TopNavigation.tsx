import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Bell, 
  Globe,
  Database,
  Zap,
  Eye
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserProfile } from "@/components/auth/UserProfile";

export function TopNavigation() {
  const { user, profile, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 font-prototype relative z-50">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/60dab377-d9c4-4f76-9210-14f21db16ff3.png" 
              alt="PROTOTYPE"
              className="h-6 object-contain"
            />
          </div>

          {/* User Email */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {user?.email || 'Ładowanie...'}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setShowProfile(true)}>
                <User className="h-4 w-4 mr-2" />
                Ustawienia profilu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowProfile(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Ustawienia konta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {/* Center Section */}
        <div className="flex items-center gap-2">
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil użytkownika</DialogTitle>
          </DialogHeader>
          <UserProfile />
        </DialogContent>
      </Dialog>
    </>
  );
}