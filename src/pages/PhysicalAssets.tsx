import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, ArrowLeft, Plus, Trash2, Pencil, Car, Building, Gem, Smartphone, Sofa, Bike, Package, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePhysicalAssets, PhysicalAsset } from "@/hooks/usePhysicalAssets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Footer } from "@/components/Footer";
import { AddPhysicalAssetDialog } from "@/components/AddPhysicalAssetDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AssetDocuments } from "@/components/AssetDocuments";
import { toast } from "sonner";

const getAssetIcon = (type: string) => {
  switch (type) {
    case 'Bike': return Bike;
    case 'Car': return Car;
    case 'House': case 'Land': return Building;
    case 'Jewelry': return Gem;
    case 'Electronics': return Smartphone;
    case 'Furniture': return Sofa;
    default: return Package;
  }
};

const PhysicalAssets = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { assets, loading: assetsLoading, addAsset, deleteAsset } = usePhysicalAssets();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const totalCurrentValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalPurchasePrice = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalChange = totalPurchasePrice > 0 ? ((totalCurrentValue - totalPurchasePrice) / totalPurchasePrice) * 100 : 0;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAsset(deleteId);
      toast.success('Asset deleted successfully');
    } catch {
      toast.error('Failed to delete asset');
    }
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <Home className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Physical Assets</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
              <NavigationMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{totalCurrentValue.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchase Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{totalPurchasePrice.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {totalChange >= 0 ? '↑' : '↓'} {Math.abs(totalChange).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets List */}
        {assetsLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
          </Card>
        ) : assets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No physical assets added yet</p>
              <p className="text-muted-foreground text-sm mt-1">Track your bike, car, house, and other physical assets</p>
              <Button className="mt-4" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Asset
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => {
              const Icon = getAssetIcon(asset.assetType);
              const change = asset.purchasePrice > 0
                ? ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100
                : 0;
              const isPositive = change >= 0;

              return (
                <Card key={asset.id} className="group transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{asset.assetName}</CardTitle>
                        <Badge variant="outline" className="mt-1">{asset.assetType}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => setDeleteId(asset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchase Price:</span>
                      <span className="font-semibold">₹{asset.purchasePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Value:</span>
                      <span className="font-bold text-primary">₹{asset.currentValue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchase Date:</span>
                      <span className="font-semibold">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Change:</span>
                      <span className={`font-semibold ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    </div>
                    {asset.description && (
                      <p className="text-xs text-muted-foreground pt-1">{asset.description}</p>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        {expandedAssetId === asset.id ? 'Hide Documents' : 'View Documents'}
                      </Button>
                    </div>
                  </CardContent>
                  {expandedAssetId === asset.id && (
                    <div className="px-4 pb-4">
                      <AssetDocuments assetId={asset.id} assetName={asset.assetName} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <AddPhysicalAssetDialog open={showAdd} onOpenChange={setShowAdd} onAdd={addAsset} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhysicalAssets;
