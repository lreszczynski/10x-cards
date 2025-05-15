import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  // Display 3 skeleton cards to represent loading state
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-4">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
