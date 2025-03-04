import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ImageIcon, HomeIcon, UsersIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | Generative Art",
  description: "Admin dashboard for the Generative Art platform.",
};

export default async function AdminPage() {
  const user = await currentUser();
  
  // Simple admin check - in a real app, you'd have more robust role checking
  if (!user) {
    redirect("/sign-in");
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your Generative Art platform
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <HomeIcon className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" />
              Game Images
            </CardTitle>
            <CardDescription>
              Manage images used in the prompt guessing game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View, add, and manage the images used in the prompt guessing game. Generate new images using DALL-E 2.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/game-images">Manage Game Images</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View user statistics, manage permissions, and monitor user activity on the platform.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="#">Coming Soon</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 