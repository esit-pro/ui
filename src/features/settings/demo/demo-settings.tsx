import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

export function DemoSettings() {
  const [isClearing, setIsClearing] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);

  const { toast } = useToast();

  const clearDemoData = async () => {
    setIsClearing(true);
    try {
      const response = await fetch('http://localhost:3001/api/demo-data', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear demo data');
      }

      toast({
        title: "Success",
        description: "Demo data has been cleared successfully",
      });

      // Refresh the page to show empty state
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear demo data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const reseedDemoData = async () => {
    setIsReseeding(true);
    try {
      const response = await fetch('http://localhost:3001/api/demo-data/reseed', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to reseed demo data');
      }

      toast({
        title: "Success",
        description: "Demo data has been reseeded successfully",
      });

      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reseed demo data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo Data</CardTitle>
        <CardDescription>
          Manage the demo data in your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium">Clear Demo Data</h3>
            <p className="text-sm text-muted-foreground">
              Remove all demo data from the application. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isClearing || isReseeding}>
                  {isClearing ? "Clearing..." : "Clear Demo Data"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will remove all demo data from the application. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearDemoData} disabled={isClearing}>
                    {isClearing ? "Clearing..." : "Clear Demo Data"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Separator />

          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium">Reseed Demo Data</h3>
            <p className="text-sm text-muted-foreground">
              Restore the initial demo data. This will add back sample tasks, users, and chats.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isReseeding || isClearing}>
                  {isReseeding ? "Reseeding..." : "Reseed Demo Data"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reseed Demo Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restore the initial demo data, including sample tasks, users, and chats.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={reseedDemoData} disabled={isReseeding}>
                    {isReseeding ? "Reseeding..." : "Reseed Demo Data"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
