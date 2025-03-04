"use client";

import React from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export interface UsedPromptsProps {
  usedPrompts: string[];
  isLoading: boolean;
}

export default function UsedPrompts({ usedPrompts, isLoading }: UsedPromptsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Previously Used Prompts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
        ) : usedPrompts.length === 0 ? (
          <p className="text-center text-muted-foreground">No prompts used yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {usedPrompts.map((prompt, index) => (
              <Badge key={index} variant="secondary">
                {prompt}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 