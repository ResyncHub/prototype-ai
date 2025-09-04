import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PROJECT_COLORS = [
  { name: "Red", value: "#DC2626" },
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#16A34A" },
  { name: "Purple", value: "#9333EA" },
  { name: "Orange", value: "#EA580C" },
  { name: "Pink", value: "#DB2777" },
  { name: "Indigo", value: "#4F46E5" },
  { name: "Teal", value: "#0D9488" },
  { name: "Yellow", value: "#CA8A04" },
  { name: "Gray", value: "#6B7280" },
];

interface ProjectColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const ProjectColorPicker = ({ selectedColor, onColorChange }: ProjectColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start"
        >
          <div 
            className="w-4 h-4 rounded-full mr-2 border border-border" 
            style={{ backgroundColor: selectedColor }}
          />
          Project Color
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-5 gap-2">
          {PROJECT_COLORS.map((color) => (
            <Button
              key={color.value}
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                selectedColor === color.value 
                  ? "border-foreground scale-110" 
                  : "border-transparent hover:border-muted-foreground"
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => onColorChange(color.value)}
              title={color.name}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};