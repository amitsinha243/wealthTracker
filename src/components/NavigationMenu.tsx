import { Link } from "react-router-dom";
import { Menu, LayoutGrid, FileText, LogOut, Plane, Bot, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export const NavigationMenu = () => {
  const { logout } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative group border-border/40 hover:border-primary/50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
          <Menu className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors relative z-10" />
        </Button>
      </SheetTrigger>
      <SheetContent className="border-l border-border/50">
        <SheetHeader className="pb-4 border-b border-border/40">
          <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Navigation
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-6">
          <NavItem to="/" icon={LayoutGrid} label="Dashboard" color="bg-blue-500" />
          <NavItem to="/assets" icon={LayoutGrid} label="All Assets" color="bg-indigo-500" />
          <NavItem to="/expenses" icon={FileText} label="All Expenses" color="bg-rose-500" />
          <NavItem to="/trips" icon={Plane} label="Trip Expenses" color="bg-emerald-500" />
          <NavItem to="/physical-assets" icon={Home} label="Physical Assets" color="bg-amber-500" />
          <NavItem to="/ai-assistant" icon={Bot} label="AI Assistant" color="bg-violet-500" />

          <div className="my-2 border-t border-border/40" />

          <Button
            variant="ghost"
            className="justify-start h-12 hover:bg-destructive/10 hover:text-destructive group transition-all duration-200"
            onClick={logout}
          >
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive mr-3 group-hover:bg-destructive group-hover:text-white transition-colors">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  color: string;
}

const NavItem = ({ to, icon: Icon, label, color }: NavItemProps) => (
  <Button variant="ghost" className="justify-start h-12 hover:bg-primary/10 group transition-all duration-200" asChild>
    <Link to={to} className="flex items-center w-full">
      <div className={`p-2 rounded-lg ${color}/10 text-${color.replace('bg-', '')} mr-3 group-hover:${color} group-hover:text-white transition-all duration-300 shadow-sm`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </Link>
  </Button>
);
