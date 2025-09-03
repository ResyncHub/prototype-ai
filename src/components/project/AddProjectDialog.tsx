import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/hooks/useProjects";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Project) => void;
}

export const AddProjectDialog = ({ open, onOpenChange, onProjectCreated }: AddProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa projektu jest wymagana",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany żeby utworzyć projekt",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: projectName.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sukces",
        description: "Projekt został utworzony",
      });

      onProjectCreated(data);
      setProjectName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć projektu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowy projekt</DialogTitle>
          <DialogDescription>
            Wprowadź nazwę nowego projektu. Canvas zostanie przypisany do tego projektu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nazwa
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
              placeholder="Wpisz nazwę projektu"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Tworzenie..." : "Utwórz projekt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};