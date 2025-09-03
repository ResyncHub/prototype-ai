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
  HelpCircle, 
  MessageSquare, 
  Bell, 
  Globe,
  Database,
  Zap,
  Eye
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopNavigation() {
  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 font-prototype">
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
              admin@projectflow.com
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Sign Out
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
  );
}