import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useExpenseBooks } from "@/hooks/useExpenseBooks";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userSearchAPI } from "@/services/api";
import { X, Search, UserPlus, Loader2 } from "lucide-react";

interface AddExpenseBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  email: string;
  name: string;
}

export const AddExpenseBookDialog = ({ open, onOpenChange }: AddExpenseBookDialogProps) => {
  const { addExpenseBook } = useExpenseBooks();
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await userSearchAPI.searchByEmail(value.trim());
        // Filter out already-added members
        const filtered = results.filter(
          (r: SearchResult) => !members.find((m) => m.id === r.id)
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    }, 400);

    setSearchTimeout(timeout);
  };

  const handleAddMember = (result: SearchResult) => {
    setMembers([...members, result]);
    setSearchResults(searchResults.filter((r) => r.id !== result.id));
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const memberUserIds = [user!.id, ...members.map((m) => m.id)];
      const memberEmails = [user!.email, ...members.map((m) => m.email)];
      const memberNames = [user!.name, ...members.map((m) => m.name)];

      await addExpenseBook({
        name,
        description,
        memberUserIds,
        memberEmails,
        memberNames,
      });

      toast({
        title: "Success",
        description: "Expense book created successfully",
      });

      // Reset form
      setName("");
      setDescription("");
      setMembers([]);
      setSearchQuery("");
      setSearchResults([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create expense book",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Expense Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookName">Book Name *</Label>
            <Input
              id="bookName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Flatmate Expenses"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookDescription">Description</Label>
            <Input
              id="bookDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Monthly shared expenses"
            />
          </div>

          {/* Members section */}
          <div className="space-y-2">
            <Label>Members</Label>
            {/* Current user shown as a fixed member */}
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="default" className="flex items-center gap-1 py-1">
                {user?.name} (You)
              </Badge>
              {members.map((member) => (
                <Badge
                  key={member.id}
                  variant="secondary"
                  className="flex items-center gap-1 py-1"
                >
                  {member.name}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                    onClick={() => handleRemoveMember(member.id)}
                  />
                </Badge>
              ))}
            </div>

            {/* Search input */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by email to add members..."
                    className="pl-9"
                  />
                </div>
                {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>

              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center justify-between"
                      onClick={() => handleAddMember(result)}
                    >
                      <div>
                        <p className="text-sm font-medium">{result.name}</p>
                        <p className="text-xs text-muted-foreground">{result.email}</p>
                      </div>
                      <UserPlus className="h-4 w-4 text-primary" />
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-3">
                  <p className="text-sm text-muted-foreground text-center">No users found</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Book</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
