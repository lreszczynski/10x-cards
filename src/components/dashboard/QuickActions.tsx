import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PlusCircle, List, Settings } from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild className="w-full justify-start" variant="outline">
          <a href="/generate">
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate New Flashcards
          </a>
        </Button>
        
        <Button asChild className="w-full justify-start" variant="outline">
          <a href="/flashcards">
            <List className="mr-2 h-4 w-4" />
            View All Flashcards
          </a>
        </Button>
        
        <Button asChild className="w-full justify-start" variant="outline">
          <a href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </a>
        </Button>
      </CardContent>
    </Card>
  );
} 