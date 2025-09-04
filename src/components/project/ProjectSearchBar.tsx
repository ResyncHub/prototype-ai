import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Project } from "@/hooks/useProjects";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { cn } from "@/lib/utils";

interface ProjectSearchBarProps {
  onSearchResults: (projects: Project[]) => void;
  allProjects: Project[];
  className?: string;
}

export const ProjectSearchBar = ({ 
  onSearchResults, 
  allProjects, 
  className 
}: ProjectSearchBarProps) => {
  const [query, setQuery] = useState("");
  const { searchProjects } = useProjectManagement();

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        onSearchResults(allProjects);
        return;
      }

      const results = await searchProjects(query);
      onSearchResults(results);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, allProjects, searchProjects, onSearchResults]);

  const clearSearch = () => {
    setQuery("");
    onSearchResults(allProjects);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9 bg-background border-border"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};