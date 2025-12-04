import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plane, ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips } from "@/hooks/useTrips";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/NavigationMenu";
import { AddTripDialog } from "@/components/AddTripDialog";
import { TripDetails } from "@/components/TripDetails";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Trips = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { trips, loading: tripsLoading } = useTrips();
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <Plane className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Trip Expenses</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddTrip(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Trip
              </Button>
              <NavigationMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {tripsLoading ? (
          <div className="text-center text-muted-foreground">Loading trips...</div>
        ) : trips.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first trip to start tracking expenses
              </p>
              <Button onClick={() => setShowAddTrip(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <Card 
                key={trip.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTrip(trip)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{trip.tripName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{trip.destination}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Participants:</span>
                    <Badge variant="secondary">{trip.participants?.length || 0}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {trip.participants?.slice(0, 3).map((participant: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {participant}
                      </Badge>
                    ))}
                    {trip.participants && trip.participants.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{trip.participants.length - 3}
                      </Badge>
                    )}
                  </div>
                  {trip.startDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">
                        {new Date(trip.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} WealthTracker. All rights reserved. Developed by Amit
        </div>
      </footer>

      {/* Add Trip Dialog */}
      <AddTripDialog open={showAddTrip} onOpenChange={setShowAddTrip} />

      {/* Trip Details Dialog */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTrip && (
            <TripDetails 
              trip={selectedTrip} 
              onClose={() => setSelectedTrip(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trips;