import { Link } from "react-router-dom";
import { Menu, LayoutGrid, FileText, LogOut, Plane, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export const NavigationMenu = () => {
  const { logout } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/">
              <LayoutGrid className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/assets">
              <LayoutGrid className="h-5 w-5 mr-2" />
              All Assets
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/expenses">
              <FileText className="h-5 w-5 mr-2" />
              All Expenses
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/trips">
              <Plane className="h-5 w-5 mr-2" />
              Trip Expenses
            </Link>
          </Button>
          {/* <Button variant="outline" className="justify-start" asChild>
            <Link to="/ai-assistant">
              <Bot className="h-5 w-5 mr-2" />
              AI Assistant
            </Link>
          </Button> */}
          <Button variant="outline" className="justify-start" onClick={logout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
