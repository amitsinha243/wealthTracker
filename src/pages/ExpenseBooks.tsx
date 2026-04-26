import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, ArrowLeft, Plus, Crown, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenseBooks } from "@/hooks/useExpenseBooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/NavigationMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { Footer } from "@/components/Footer";
import { AddExpenseBookDialog } from "@/components/AddExpenseBookDialog";
import { ExpenseBookDetails } from "@/components/ExpenseBookDetails";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ExpenseBooks = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { expenseBooks, loading: booksLoading } = useExpenseBooks();
  const [showAddBook, setShowAddBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full hover:bg-muted/80 transition-all active:scale-90 shrink-0"
              >
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 w-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-black text-foreground tracking-tighter truncate uppercase">
                    Expense Books
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setShowAddBook(true)}
                className="bg-primary hover:bg-primary/90 font-bold px-3 sm:px-4"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Book</span>
              </Button>
              <NotificationBell />
              <NavigationMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {booksLoading ? (
          <div className="text-center text-muted-foreground">Loading expense books...</div>
        ) : expenseBooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expense books yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a shared expense book to start splitting costs with friends
              </p>
              <Button onClick={() => setShowAddBook(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Expense Book
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseBooks.map((book) => (
              <Card
                key={book.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/30 group"
                onClick={() => setSelectedBook(book)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {book.name}
                    </CardTitle>
                    {book.createdBy === user.id && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1 shrink-0">
                        <Crown className="h-3 w-3 text-amber-500" />
                        Owner
                      </Badge>
                    )}
                  </div>
                  {book.description && (
                    <p className="text-sm text-muted-foreground">{book.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Members:
                    </span>
                    <Badge variant="secondary">{book.memberNames?.length || 0}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {book.memberNames?.slice(0, 3).map((name: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                    {book.memberNames && book.memberNames.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{book.memberNames.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Add Expense Book Dialog */}
      <AddExpenseBookDialog open={showAddBook} onOpenChange={setShowAddBook} />

      {/* Expense Book Details Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBook && (
            <ExpenseBookDetails
              book={selectedBook}
              onClose={() => setSelectedBook(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseBooks;
