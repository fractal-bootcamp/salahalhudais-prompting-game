// src/app/_components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { ModeToggle } from "./mode-toggle";
import { Button } from "~/components/ui/button";

export function Navigation() {
  const pathname = usePathname();
  
  return (
    <div className="border-b border-primary/20 sticky top-0 z-50 backdrop-blur-sm bg-background/95 shadow-sm navigation-bar">
      <div className="container flex h-20 items-center justify-between py-4">
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={`${navigationMenuTriggerStyle()} text-lg font-bold transition-all duration-300 hover:scale-105 ${pathname === '/' ? 'navigation-active' : ''}`}
                >
                  <span className="font-bold">Generative Art</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="text-base transition-all duration-300 hover:bg-accent/80">
                Explore
              </NavigationMenuTrigger>
              <NavigationMenuContent className="mt-0 pt-2">
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        href="/"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Art Gallery
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Explore amazing generative art created by the community
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href="/create"
                        className="block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-[1.02]"
                      >
                        <div className="text-sm font-medium leading-none">Create</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Create your own generative art masterpiece
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href="/game"
                        className="block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-[1.02]"
                      >
                        <div className="text-sm font-medium leading-none">Prompt Game</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Test your prompt engineering skills in our fun game
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href="/game/picktle"
                        className="block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-[1.02]"
                      >
                        <div className="text-sm font-medium leading-none">Picktle</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Guess the two words that describe the image
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href="/popular"
                        className="block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-[1.02]"
                      >
                        <div className="text-sm font-medium leading-none">Popular</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          See the most liked and trending artworks
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/create" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={`${navigationMenuTriggerStyle()} text-base transition-all duration-300 hover:scale-105 hover:bg-accent/80 ${pathname === '/create' ? 'navigation-active' : ''}`}
                >
                  Create Art
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/game" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={`${navigationMenuTriggerStyle()} text-base transition-all duration-300 hover:scale-105 hover:bg-accent/80 ${pathname === '/game' ? 'navigation-active' : ''}`}
                >
                  Guess the Prompt
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/game/picktle" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={`${navigationMenuTriggerStyle()} text-base transition-all duration-300 hover:scale-105 hover:bg-accent/80 ${pathname === '/game/picktle' ? 'navigation-active' : ''}`}
                >
                  Picktle
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
          <SignedIn>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/admin" legacyBehavior passHref>
                    <NavigationMenuLink 
                      className={`${navigationMenuTriggerStyle()} text-base transition-all duration-300 hover:scale-105 hover:bg-accent/80 ${pathname === '/admin' ? 'navigation-active' : ''}`}
                    >
                      Admin
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-10 w-10 transition-transform duration-300 hover:scale-110"
                }
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="transition-all duration-300 hover:scale-105">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}