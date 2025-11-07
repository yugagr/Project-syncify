import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { apiPost, apiGet } from "@/lib/api";
import { Plus, Calendar, Users, MoreVertical } from "lucide-react";

const Projects = () => {
  const { toast } = useToast();

  // New Project dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [npTitle, setNpTitle] = useState("");
  const [npSummary, setNpSummary] = useState("");
  const [npPublic, setNpPublic] = useState(false);
  const availableFeatures = [
    "Team Collaboration",
    "Lightning Fast",
    "Secure & Reliable",
    "Analytics Dashboard",
    "Real-time Chat",
    "Project Management"
  ];
  const [npFeatures, setNpFeatures] = useState<string[]>([]);
  const [npLoading, setNpLoading] = useState(false);
  
  // Projects from Supabase
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const toggleFeature = (name: string, checked: boolean | string) => {
    const isOn = checked === true || checked === "on";
    setNpFeatures((prev) => (isOn ? Array.from(new Set([...prev, name])) : prev.filter((f) => f !== name)));
  };

  const resetForm = () => {
    setNpTitle("");
    setNpSummary("");
    setNpPublic(false);
    setNpFeatures([]);
  };

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await apiGet<{ projects: any[] }>('/projects');
      setProjects(response.projects || []);
    } catch (e: any) {
      console.error('Failed to fetch projects:', e);
      const errorMsg = e?.message || String(e);
      
      // If authentication error, don't show toast (user will be redirected)
      if (errorMsg.includes("No Supabase authentication") || errorMsg.includes("Session expired")) {
        // User will be redirected to sign in by the API client
        return;
      }
      
      toast({ title: "Failed to load projects", description: errorMsg });
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const submitNewProject = async () => {
    if (!npTitle.trim()) {
      toast({ title: "Title is required" });
      return;
    }
    try {
      setNpLoading(true);
      
      // Check if user is authenticated before making the request
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ 
          title: "Authentication required", 
          description: "Please sign in to create a project" 
        });
        return;
      }
      
      const payload: any = {
        title: npTitle.trim(),
        slug: toSlug(npTitle.trim()),
        summary: npSummary.trim(),
        content: JSON.stringify({ features: npFeatures }),
        public: npPublic
      };
      await apiPost(`/projects`, payload);
      toast({ title: "Project created" });
      setCreateOpen(false);
      resetForm();
      // Refresh projects list
      await fetchProjects();
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      if (errorMsg.includes("Session expired") || errorMsg.includes("Invalid or expired token")) {
        toast({ 
          title: "Session expired", 
          description: "Please sign in again to continue" 
        });
        // Redirect to sign in after a short delay
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else {
        toast({ title: "Failed to create project", description: errorMsg });
      }
    } finally {
      setNpLoading(false);
    }
  };

  // Generate color gradient based on project ID
  const getProjectColor = (id: string) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-cyan-500 to-blue-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-red-500 to-rose-500",
      "from-indigo-500 to-purple-500",
      "from-blue-500 to-cyan-500",
      "from-pink-500 to-rose-500"
    ];
    // Use project ID to deterministically pick a color
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-2">
              Projects
            </h1>
            <p className="text-muted-foreground">Manage and track all your active projects</p>
          </div>
          <Button className="bg-primary shadow-glow-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="npTitle">Title</Label>
                <Input id="npTitle" value={npTitle} onChange={(e) => setNpTitle(e.target.value)} placeholder="Project title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="npSummary">Summary</Label>
                <Textarea id="npSummary" value={npSummary} onChange={(e) => setNpSummary(e.target.value)} placeholder="Brief description" />
              </div>
              <div className="grid gap-2">
                <Label>Features</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableFeatures.map((name) => (
                    <label key={name} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={npFeatures.includes(name)}
                        onCheckedChange={(v) => toggleFeature(name, v as any)}
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={npPublic} onCheckedChange={(v) => setNpPublic(v === true)} />
                  <span>Make project public</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button className="bg-primary" disabled={!npTitle.trim() || npLoading} onClick={submitNewProject}>
                {npLoading ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {projectsLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button className="bg-primary shadow-glow-primary" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const projectColor = getProjectColor(project.id);
              const projectTitle = project.title || "Untitled Project";
              const projectSummary = project.summary || "No description";
              
              return (
                <Card key={project.id} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${projectColor} flex items-center justify-center text-white font-bold text-xl`}>
                      {projectTitle.charAt(0).toUpperCase()}
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{projectTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{projectSummary}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground truncate">ID: {project.id.substring(0, 8)}...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => {
                        navigator.clipboard.writeText(project.id);
                        toast({ title: "Project ID copied" });
                      }}
                    >
                      Copy ID
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {project.public ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        Public
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                        Private
                      </Badge>
                    )}
                    {project.slug && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                        {project.slug}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Created {formatDate(project.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
