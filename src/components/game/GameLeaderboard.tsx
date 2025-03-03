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
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { format } from "date-fns";

interface GameLeaderboardProps {
  gameImageId?: number;
}

export default function GameLeaderboard({ gameImageId }: GameLeaderboardProps) {
  // Use the appropriate query based on whether we have a gameImageId
  const { data, isLoading } = gameImageId 
    ? api.game.getImageLeaderboard.useQuery(
        { gameImageId },
        { refetchOnWindowFocus: false }
      )
    : api.game.getGlobalLeaderboard.useQuery(
        undefined,
        { refetchOnWindowFocus: false }
      );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {gameImageId ? "Image Leaderboard" : "Global Leaderboard"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : !data || data.length === 0 ? (
          <p className="text-center text-muted-foreground">No entries yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                {gameImageId ? (
                  <TableHead>Score</TableHead>
                ) : (
                  <>
                    <TableHead>Games</TableHead>
                    <TableHead>Avg Score</TableHead>
                  </>
                )}
                <TableHead className="hidden md:table-cell">
                  {gameImageId ? "Date" : "Total Score"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry: any, index: number) => (
                <TableRow key={gameImageId ? entry.id : entry.userId}>
                  <TableCell className="font-medium">
                    {index === 0 ? (
                      <Badge variant="success">1st</Badge>
                    ) : index === 1 ? (
                      <Badge variant="secondary">2nd</Badge>
                    ) : index === 2 ? (
                      <Badge variant="secondary">3rd</Badge>
                    ) : (
                      `${index + 1}th`
                    )}
                  </TableCell>
                  <TableCell>
                    {gameImageId ? entry.user?.username : entry.username}
                  </TableCell>
                  {gameImageId ? (
                    <TableCell>{entry.bestScore.toFixed(2)}%</TableCell>
                  ) : (
                    <>
                      <TableCell>{entry.gamesPlayed}</TableCell>
                      <TableCell>{entry.avgScore.toFixed(2)}%</TableCell>
                    </>
                  )}
                  <TableCell className="hidden md:table-cell">
                    {gameImageId 
                      ? format(new Date(entry.updatedAt), "MMM d, yyyy")
                      : entry.totalScore.toFixed(0)}
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

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="hidden h-6 w-24 md:block" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="hidden h-6 w-24 md:block" />
        </div>
      ))}
    </div>
  );
} 