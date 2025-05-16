"use client";

import { useState, useRef } from "react";
import { 
  Download, 
  FileText, 
  FileBadge, 
  FileJson, 
  ExternalLink, 
  Loader2,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { exportToPDF, exportToMarkdown, downloadFile, shareToNotion, type RetroExportData } from "@/lib/export-utils";

interface ExportSummaryProps {
  retroId: string;
  retroData: RetroExportData;
  contentRef: React.RefObject<HTMLElement>;
}

export function ExportSummary({ retroId, retroData, contentRef }: ExportSummaryProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isNotionDialogOpen, setIsNotionDialogOpen] = useState(false);
  const [notionToken, setNotionToken] = useState("");
  const [notionDatabaseId, setNotionDatabaseId] = useState("");
  const [notionLoading, setNotionLoading] = useState(false);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const sprintTitle = retroData.sprintName || `Sprint ${retroData.sprintNumber}`;
      const success = await exportToPDF(contentRef, `${sprintTitle} Retrospective`);
      
      if (success) {
        toast.success("PDF exported successfully");
      } else {
        toast.error("Failed to export PDF");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = () => {
    setIsExporting(true);
    try {
      const sprintTitle = retroData.sprintName || `Sprint ${retroData.sprintNumber}`;
      const markdown = exportToMarkdown(retroData);
      downloadFile(markdown, `${sprintTitle} Retrospective.md`, "text/markdown");
      toast.success("Markdown file downloaded");
    } catch (error) {
      console.error("Error exporting Markdown:", error);
      toast.error("Failed to export Markdown");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyMarkdown = () => {
    const markdown = exportToMarkdown(retroData);
    navigator.clipboard.writeText(markdown);
    toast.success("Markdown copied to clipboard");
  };

  const handleShareToNotion = async () => {
    setNotionLoading(true);
    try {
      if (!notionToken || !notionDatabaseId) {
        toast.error("Notion token and database ID are required");
        return;
      }

      const success = await shareToNotion(retroData, notionToken, notionDatabaseId);
      
      if (success) {
        toast.success("Successfully shared to Notion");
        setIsNotionDialogOpen(false);
      } else {
        toast.error("Failed to share to Notion");
      }
    } catch (error) {
      console.error("Error sharing to Notion:", error);
      toast.error("Failed to share to Notion");
    } finally {
      setNotionLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 w-full border-dashed" 
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export Summary"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            <span>📄 Export as PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportMarkdown} disabled={isExporting}>
            <FileBadge className="mr-2 h-4 w-4" />
            <span>🗒 Download as Markdown</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyMarkdown} disabled={isExporting}>
            <Copy className="mr-2 h-4 w-4" />
            <span>📋 Copy as Markdown</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Dialog open={isNotionDialogOpen} onOpenChange={setIsNotionDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>🔗 Share to Notion</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Share to Notion</DialogTitle>
                <DialogDescription>
                  Connect to your Notion workspace to share this retrospective summary.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notion-token" className="col-span-4">
                    Notion Integration Token
                  </Label>
                  <Input
                    id="notion-token"
                    type="password"
                    placeholder="secret_..."
                    value={notionToken}
                    onChange={(e) => setNotionToken(e.target.value)}
                    className="col-span-4"
                  />
                  <p className="text-xs text-muted-foreground col-span-4">
                    Create an integration at{" "}
                    <a 
                      href="https://www.notion.so/my-integrations" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      notion.so/my-integrations
                    </a>
                  </p>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="database-id" className="col-span-4">
                    Notion Database ID
                  </Label>
                  <Input
                    id="database-id"
                    placeholder="e.g., 8251f92a5e8c403d81c1d4d883a455b5"
                    value={notionDatabaseId}
                    onChange={(e) => setNotionDatabaseId(e.target.value)}
                    className="col-span-4"
                  />
                  <p className="text-xs text-muted-foreground col-span-4">
                    Find this in the URL of your database: notion.so/username/
                    <span className="font-mono bg-secondary/20 px-1 rounded">8251f92a...</span>
                    ?v=...
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNotionDialogOpen(false)}
                  disabled={notionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleShareToNotion}
                  disabled={notionLoading || !notionToken || !notionDatabaseId}
                  className="gap-2"
                >
                  {notionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {notionLoading ? "Sharing..." : "Share to Notion"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Hidden markdown preview used for copying */}
      <textarea
        ref={markdownRef}
        className="sr-only"
        readOnly
        value={exportToMarkdown(retroData)}
      />
    </>
  );
} 