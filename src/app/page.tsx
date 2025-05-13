import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to AI App</CardTitle>
          <CardDescription className="text-center">Your intelligent assistant</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="mb-6 text-center text-muted-foreground">
            A modern application built with Next.js, Tailwind CSS, and shadcn/ui
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="w-full">Login to continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
