"use client";

import { api } from "~/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function GameHistory() {
  const { data, isLoading } = api.game.getUserHistory.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Game History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <HistorySkeleton />
        ) : !data || data.length === 0 ? (
          <p className="text-center text-muted-foreground">
            You haven't played any games yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Image</TableHead>
                <TableHead>Your Image</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <Image
                        src={entry.gameImage.imagePath}
                        alt="Target image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <Image
                        src={entry.generatedImagePath ?? "/placeholder.jpg"}
                        alt="Generated image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {entry.promptText}
                  </TableCell>
                  <TableCell>
                    {entry.similarityScore !== null
                      ? `${entry.similarityScore.toFixed(2)}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(entry.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16" />
        <Skeleton className="h-16 w-16" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="hidden h-6 w-24 md:block" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16" />
          <Skeleton className="h-16 w-16" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="hidden h-6 w-24 md:block" />
        </div>
      ))}
    </div>
  );
} 