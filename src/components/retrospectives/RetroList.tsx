"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { Loader2, Plus, ArrowRight, Calendar, Users, Trash2, AlertCircle, Pencil, Save, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"];

export function RetroList() {
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingRetro, setDeletingRetro] = useState<Retrospective | null>(null);
  const [editingRetro, setEditingRetro] = useState<Retrospective | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedSprintNumber, setEditedSprintNumber] = useState<number>(0);
  const [editedSprintName, setEditedSprintName] = useState<string>("");
  const [editedTeamName, setEditedTeamName] = useState<string>("");

  useEffect(() => {
    fetchRetrospectives();
  }, []);
  
  const fetchRetrospectives = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.user) {
        setError("You must be logged in to view retrospectives");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("retrospectives")
        .select("*")
        .eq("user_id", session.session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRetrospectives(data || []);
    } catch (err) {
      console.error("Error fetching retrospectives:", err);
      setError("Failed to load retrospectives. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (e: React.MouseEvent, retro: Retrospective) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingRetro(retro);
    setDeleteDialogOpen(true);
  };
  
  const openEditDialog = (e: React.MouseEvent, retro: Retrospective) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingRetro(retro);
    setEditedSprintNumber(retro.sprint_number);
    setEditedSprintName(retro.sprint_name || "");
    setEditedTeamName(retro.team_name);
    setEditDialogOpen(true);
  };

  const handleDeleteRetro = async () => {
    if (!deletingRetro) return;
    
    try {
      setIsDeleting(true);
      
      // First delete associated feedback
      const { error: feedbackError } = await supabase
        .from("feedback")
        .delete()
        .eq("retro_id", deletingRetro.id);
      
      if (feedbackError) throw feedbackError;
      
      // Then delete associated themes
      const { error: themesError } = await supabase
        .from("feedback_themes")
        .delete()
        .eq("retro_id", deletingRetro.id);
      
      if (themesError) throw themesError;
      
      // Finally delete the retrospective itself
      const { error: retroError } = await supabase
        .from("retrospectives")
        .delete()
        .eq("id", deletingRetro.id);
      
      if (retroError) throw retroError;
      
      // Update the UI
      setRetrospectives(retrospectives.filter(r => r.id !== deletingRetro.id));
      toast.success("Retrospective deleted successfully");
      
    } catch (error) {
      console.error("Error deleting retrospective:", error);
      toast.error("Failed to delete retrospective");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingRetro(null);
    }
  };
  
  const handleEditRetro = async () => {
    if (!editingRetro) return;
    
    try {
      setIsSaving(true);
      
      // Validate inputs
      if (editedSprintNumber && editedSprintNumber <= 0) {
        toast.error("Sprint number must be a positive number");
        return;
      }
      
      if (!editedSprintName.trim()) {
        toast.error("Sprint name cannot be empty");
        return;
      }
      
      if (!editedTeamName.trim()) {
        toast.error("Team name cannot be empty");
        return;
      }
      
      // Update the retrospective in Supabase
      const { error } = await supabase
        .from("retrospectives")
        .update({
          sprint_number: editedSprintNumber || 0,
          sprint_name: editedSprintName.trim(),
          team_name: editedTeamName.trim()
        })
        .eq("id", editingRetro.id);
      
      if (error) throw error;
      
      // Update the local state with the new values
      setRetrospectives(retrospectives.map(retro => 
        retro.id === editingRetro.id 
          ? { 
              ...retro, 
              sprint_number: editedSprintNumber || 0, 
              sprint_name: editedSprintName.trim(),
              team_name: editedTeamName.trim() 
            } 
          : retro
      ));
      
      toast.success("Retrospective updated successfully");
      setEditDialogOpen(false);
      
    } catch (error) {
      console.error("Error updating retrospective:", error);
      toast.error("Failed to update retrospective");
    } finally {
      setIsSaving(false);
      setEditingRetro(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your retrospectives...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/5 border-destructive/30">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (retrospectives.length === 0) {
    return (
      <Card className="w-full glassmorphism overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10 rounded-lg z-0" />
        <CardContent className="pt-10 pb-10 text-center relative z-10">
          <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-3">No retrospectives yet</h3>
          <p className="mb-6 text-muted-foreground max-w-md mx-auto">
            Create your first retrospective to start gathering feedback from your team
          </p>
          <Link href="/retrospectives/new">
            <Button className="px-6">Create Your First Retrospective</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl font-medium">Your Retrospectives</h2>
          <div className="ml-4">
            <Tabs defaultValue="list" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list" asChild>
                  <Link href="/retrospectives" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List View
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="calendar" asChild>
                  <Link href="/retrospectives/calendar" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar View
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <Link href="/retrospectives/new">
          <Button size="lg" className="gap-2 px-6 py-5 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90">
            <Plus className="h-5 w-5" />
            New Retrospective
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {retrospectives.map((retro) => (
          <Link key={retro.id} href={`/retrospectives/${retro.id}`}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-xl glassmorphism overflow-hidden border-border/30 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-lg z-0" />
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-primary">{retro.sprint_name || `Sprint ${retro.sprint_number}`}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      {retro.team_name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary/30 dark:bg-secondary/20 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 text-secondary-foreground font-medium shadow-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(retro.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 rounded-full"
                        onClick={(e) => openEditDialog(e, retro)}
                      >
                        <Pencil className="h-4 w-4 text-primary hover:text-primary" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 rounded-full"
                        onClick={(e) => openDeleteDialog(e, retro)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="relative z-10 pt-2 pb-4">
                <Button variant="secondary" className="w-full group shadow-sm hover:shadow-md transition-all duration-300">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md glassmorphism border-border/30 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </span>
              Delete Retrospective
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete "{deletingRetro?.sprint_name || `Sprint ${deletingRetro?.sprint_number}`}"?
              This will permanently remove all feedback and themes associated with this retrospective.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRetro}
              disabled={isDeleting}
              className="gap-2 shadow-sm"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isDeleting ? "Deleting..." : "Delete Retrospective"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md glassmorphism border-border/30 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-primary/10 flex items-center justify-center">
                <Pencil className="h-5 w-5 text-primary" />
              </span>
              Edit Retrospective
            </DialogTitle>
            <DialogDescription className="pt-2">
              Update the details of your retrospective
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sprint-name" className="text-sm font-medium">Sprint Name</Label>
              <Input 
                id="sprint-name" 
                value={editedSprintName}
                onChange={(e) => setEditedSprintName(e.target.value)}
                placeholder="e.g., Q2 Release, Project Alpha, March Sprint"
                required
                className="border-border/50 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sprint-number" className="flex items-center gap-2 text-sm font-medium">
                Sprint Number <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input 
                id="sprint-number" 
                type="number"
                value={editedSprintNumber || ""}
                onChange={(e) => setEditedSprintNumber(e.target.value ? Number(e.target.value) : 0)}
                min={1}
                placeholder="e.g., 1, 2, 3"
                className="border-border/50 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team-name" className="text-sm font-medium">Team Name</Label>
              <Input 
                id="team-name" 
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
                placeholder="e.g., Frontend Team, Product Team"
                required
                className="border-border/50 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSaving}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleEditRetro}
              disabled={isSaving}
              className="gap-2 shadow-sm"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 