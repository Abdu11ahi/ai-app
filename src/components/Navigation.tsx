import Link from "next/link";
import { Button } from "./ui/button";

export function Navigation() {
  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          AI App
        </Link>
        <Button variant="outline">Login</Button>
      </div>
    </nav>
  );
} 