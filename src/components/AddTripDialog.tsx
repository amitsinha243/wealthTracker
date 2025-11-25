import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTrips } from "@/hooks/useTrips";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTripDialog = ({ open, onOpenChange }: AddTripDialogProps) => {
  const { addTrip } = useTrips();
  const { toast } = useToast();
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState("");

  const handleAddParticipant = () => {
    const trimmed = currentParticipant.trim();
    if (trimmed && !participants.includes(trimmed)) {
      setParticipants([...participants, trimmed]);
      setCurrentParticipant("");
    }
  };

  const handleRemoveParticipant = (participant: string) => {
    setParticipants(participants.filter(p => p !== participant));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (participants.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one participant",
        variant: "destructive"
      });
      return;
    }

    try {
      await addTrip({
        tripName,
        destination,
        startDate: startDate || null,
        endDate: endDate || null,
        participants
      });
      
      toast({
        title: "Success",
        description: "Trip created successfully"
      });
      
      // Reset form
      setTripName("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setParticipants([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tripName">Trip Name *</Label>
            <Input
              id="tripName"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g., Goa Trip 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Goa, India"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants">Participants *</Label>
            <div className="flex gap-2">
              <Input
                id="participants"
                value={currentParticipant}
                onChange={(e) => setCurrentParticipant(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                placeholder="Enter name and press Add"
              />
              <Button type="button" onClick={handleAddParticipant} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {participants.map((participant, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {participant}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveParticipant(participant)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Trip</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};