"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface UsedPromptsProps {
  usedPrompts: string[];
}

export default function UsedPrompts({ usedPrompts }: UsedPromptsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Previously Used Prompts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {usedPrompts.map((prompt, index) => (
            <Badge key={index} variant="secondary">
              {prompt}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 