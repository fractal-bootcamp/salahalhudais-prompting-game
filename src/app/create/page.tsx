// src/app/create/page.tsx
"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { Slider } from "~/components/ui/slider";

interface ArtConfig {
  size: number;
  color: string;
  [key: string]: any;
}

function ArtGenerator({ config }: { config: ArtConfig }) {
  return (
    <mesh>
      <boxGeometry args={[config.size, config.size, config.size]} />
      <meshStandardMaterial color={config.color} />
    </mesh>
  );
}

export default function CreateArtPage() {
  const router = useRouter();
  const [title, setTitle] = useState("My Artwork");
  const [size, setSize] = useState(1);
  const [color, setColor] = useState("#ff0000");
  
  const createArt = api.art.create.useMutation({
    onSuccess: () => {
      toast.success("Artwork created!", {
        description: "Your artwork has been saved successfully.",
      });
      router.push("/");
    },
    onError: (error) => {
      toast.error("Error creating artwork", {
        description: error.message,
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createArt.mutate({
      title,
      config: {
        size,
        color,
      },
    });
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Create New Artwork</h1>
        <p className="text-muted-foreground">
          Design your own generative art masterpiece
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              This is how your artwork will appear in the gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="aspect-square bg-muted/20 rounded-md">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <ArtGenerator config={{ size, color }} />
              <OrbitControls />
            </Canvas>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Artwork Settings</CardTitle>
            <CardDescription>
              Customize your artwork's appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Artwork"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="size">Size: {size.toFixed(1)}</Label>
                <Slider
                  id="size"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={[size]}
                  onValueChange={(values: number[]) => setSize(values[0] ?? size)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <span className="text-sm font-mono">{color}</span>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit}
              disabled={createArt.isPending}
              className="w-full"
            >
              {createArt.isPending ? "Saving..." : "Save Artwork"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}