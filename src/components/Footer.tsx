export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WealthTracker. All rights reserved. Developed by Amit
      </div>
    </footer>
  );
};
