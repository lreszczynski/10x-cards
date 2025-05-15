import { Button } from "./ui/button";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      // Redirect to login page after successful logout
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Sign out error:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">
          10x Cards
        </a>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isLoading}>
                {isLoading ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
