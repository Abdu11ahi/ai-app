"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Database } from "@/lib/database.types";
import { Trash2, AlertCircle, ArrowLeft, Loader2, Pencil, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ExportSummary } from "./ExportSummary";
import { RetroExportView } from "./RetroExportView";
import { RetroExportData } from "@/lib/export-utils";
import { FeedbackType } from "@/lib/database.types";

type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"];

type Feedback = {
  id: string;
  message: string;
  type: FeedbackType;
  anonymous: boolean;
  created_at: string;
  user_id: string;
  user_email?: string | null;
};

type Theme = {
  id: string;
  name: string;
  feedback_ids: string[];
  type: string;
  created_at: string;
};

export function RetroDetails({ id }: { id: string }) {
  const router = useRouter();
  const [retro, setRetro] = useState<Retrospective | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedSprintNumber, setEditedSprintNumber] = useState<number | null>(0);
  const [editedSprintName, setEditedSprintName] = useState<string>("");
  const [editedTeamName, setEditedTeamName] = useState<string>("");
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [retroData, setRetroData] = useState<RetroExportData | null>(null);
  const exportViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRetro();
  }, [id, router]);
  
  const fetchRetro = async () => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("retrospectives")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      // Check if the retrospective belongs to the current user
      if (data.user_id !== session.user.id) {
        setError("You don't have permission to view this retrospective");
        return;
      }

      setRetro(data);
      setEditedSprintNumber(data.sprint_number);
      setEditedSprintName(data.sprint_name || "");
      setEditedTeamName(data.team_name);
      
      // Fetch feedback for this retrospective
      await fetchFeedback(data, session.user.id);
      
      // Fetch themes for this retrospective
      await fetchThemes(data);
      
    } catch (err: any) {
      console.error("Error fetching retrospective:", err);
      setError(err.message || "Failed to load retrospective");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFeedback = async (retroData: Retrospective, userId: string) => {
    try {
      // Get current user email for displaying non-anonymous feedback
      const { data: currentUser } = await supabase.auth.getUser();
      const currentUserEmail = currentUser?.user?.email || 'Unknown';
      
      // Get feedback items
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("*")
        .eq("retro_id", retroData.id)
        .order("created_at", { ascending: false });
      
      if (feedbackError) throw feedbackError;
      
      // Add user email to each feedback item
      const enhancedFeedback = feedbackData?.map(item => ({
        ...item,
        // If feedback is not anonymous and it's from the current user, show their email
        user_email: (!item.anonymous && item.user_id === userId) 
          ? currentUserEmail 
          : null
      })) || [];
      
      setFeedback(enhancedFeedback);
      
      // Prepare export data after feedback is fetched
      prepareExportData(retroData, enhancedFeedback, []);
      
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };
  
  const fetchThemes = async (retroData: Retrospective) => {
    try {
      const { data: themesData, error: themesError } = await supabase
        .from("feedback_themes")
        .select("*")
        .eq("retro_id", retroData.id)
        .order("created_at", { ascending: false });
      
      if (themesError) throw themesError;
      
      setThemes(themesData || []);
      
      // Update export data with themes
      if (retro && feedback.length > 0) {
        prepareExportData(retroData, feedback, themesData || []);
      }
      
    } catch (err) {
      console.error("Error fetching themes:", err);
    }
  };
  
  const prepareExportData = (
    retroData: Retrospective, 
    feedbackData: Feedback[], 
    themesData: Theme[]
  ) => {
    // Group feedback by type
    const feedbackByType = {
      well: feedbackData.filter(item => item.type === 'well'),
      didnt: feedbackData.filter(item => item.type === 'didnt'),
      blocker: feedbackData.filter(item => item.type === 'blocker'),
      suggestion: feedbackData.filter(item => item.type === 'suggestion')
    };
    
    // Create export data object
    const exportData: RetroExportData = {
      id: retroData.id,
      sprintName: retroData.sprint_name || '',
      sprintNumber: retroData.sprint_number,
      teamName: retroData.team_name,
      createdAt: retroData.created_at,
      feedback: feedbackByType,
      themes: themesData
    };
    
    setRetroData(exportData);
  };
  
  const handleDeleteRetro = async () => {
    if (!retro) return;
    
    try {
      setIsDeleting(true);
      
      // First delete associated feedback
      const { error: feedbackError } = await supabase
        .from("feedback")
        .delete()
        .eq("retro_id", retro.id);
      
      if (feedbackError) throw feedbackError;
      
      // Then delete associated themes
      const { error: themesError } = await supabase
        .from("feedback_themes")
        .delete()
        .eq("retro_id", retro.id);
      
      if (themesError) throw themesError;
      
      // Finally delete the retrospective itself
      const { error: retroError } = await supabase
        .from("retrospectives")
        .delete()
        .eq("id", retro.id);
      
      if (retroError) throw retroError;
      
      // Navigate back to retrospectives list
      toast.success("Retrospective deleted successfully");
      router.push("/retrospectives");
      router.refresh();
      
    } catch (error) {
      console.error("Error deleting retrospective:", error);
      toast.error("Failed to delete retrospective");
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  const handleEditRetro = async () => {
    if (!retro) return;
    
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
        .eq("id", retro.id);
      
      if (error) throw error;
      
      // Update the local state with the new values
      const updatedRetro = {
        ...retro,
        sprint_number: editedSprintNumber || 0,
        sprint_name: editedSprintName.trim(),
        team_name: editedTeamName.trim()
      };
      
      setRetro(updatedRetro);
      
      // Update export data
      if (retroData) {
        prepareExportData(updatedRetro, feedback, themes);
      }
      
      toast.success("Retrospective updated successfully");
      setEditDialogOpen(false);
      
    } catch (error) {
      console.error("Error updating retrospective:", error);
      toast.error("Failed to update retrospective");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to display sprint title
  const getSprintTitle = (retro: Retrospective) => {
    if (retro.sprint_name) {
      return retro.sprint_name;
    }
    return `Sprint ${retro.sprint_number}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground ml-2">Loading retrospective...</p>
      </div>
    );
  }

  if (error || !retro) {
    return (
      <Card className="bg-destructive/5 border-destructive/30">
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-destructive mb-4">{error || "Retrospective not found"}</p>
            <Link href="/retrospectives">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Retrospectives
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8 glassmorphism overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-lg z-0" />
        <CardHeader className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{getSprintTitle(retro)} Retrospective</CardTitle>
              <CardDescription>Team: {retro.team_name}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                size="sm"
                variant="destructive"
                className="gap-2"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-sm text-muted-foreground mb-6">
            Created on {new Date(retro.created_at).toLocaleDateString()}
          </p>
          
          {retroData && (
            <div className="mt-4">
              <ExportSummary 
                retroId={id}
                retroData={retroData}
                contentRef={exportViewRef}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="relative z-10 border-t pt-6">
          <Link href="/retrospectives" className="mr-auto">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" /> 
              Delete Retrospective
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{retro.sprint_name || `Sprint ${retro.sprint_number}`}"?
              This will permanently remove all feedback and themes associated with this retrospective.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRetro}
              disabled={isDeleting}
              className="gap-1"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isDeleting ? "Deleting..." : "Delete Retrospective"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> 
              Edit Retrospective
            </DialogTitle>
            <DialogDescription>
              Update the details of your retrospective
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sprint-name">Sprint Name</Label>
              <Input 
                id="sprint-name" 
                value={editedSprintName}
                onChange={(e) => setEditedSprintName(e.target.value)}
                placeholder="e.g., Q2 Release, Project Alpha, March Sprint"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sprint-number" className="flex items-center gap-2">
                Sprint Number <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input 
                id="sprint-number" 
                type="number"
                value={editedSprintNumber || ""}
                onChange={(e) => setEditedSprintNumber(e.target.value ? Number(e.target.value) : null)}
                min={1}
                placeholder="e.g., 1, 2, 3"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input 
                id="team-name" 
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
                placeholder="e.g., Frontend Team, Product Team"
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleEditRetro}
              disabled={isSaving}
              className="gap-1"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden export view for PDF generation */}
      <div className="hidden">
        {retroData && <RetroExportView ref={exportViewRef} data={retroData} />}
      </div>
    </>
  );
} 