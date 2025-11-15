import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Mail, 
  User, 
  Calendar as CalendarIcon,
  ArrowLeft,
  Merge,
  BellOff
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Task {
  id: string;
  email_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  assignee: string | null;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'snoozed';
  snooze_until: string | null;
  ai_confidence: number | null;
  created_at: string;
  completed_at: string | null;
}

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Success",
        description: "Task deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;

    try {
      // Store correction for AI training
      const original = tasks.find(t => t.id === editingTask.id);
      if (original) {
        await supabase.from("task_corrections").insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          task_id: editingTask.id,
          original_extraction: {
            title: original.title,
            description: original.description,
            due_date: original.due_date,
            assignee: original.assignee,
            urgency: original.urgency
          },
          corrected_values: {
            title: editingTask.title,
            description: editingTask.description,
            due_date: editingTask.due_date,
            assignee: editingTask.assignee,
            urgency: editingTask.urgency
          },
          correction_type: 'manual_edit'
        });
      }

      const { error } = await supabase
        .from("tasks")
        .update({
          title: editingTask.title,
          description: editingTask.description,
          due_date: editingTask.due_date,
          assignee: editingTask.assignee,
          urgency: editingTask.urgency
        })
        .eq("id", editingTask.id);

      if (error) throw error;

      await fetchTasks();
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Task updated and correction saved for AI training",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleSnooze = async (taskId: string) => {
    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + 1); // Snooze for 1 day

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: 'snoozed',
          snooze_until: snoozeUntil.toISOString()
        })
        .eq("id", taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Success",
        description: "Task snoozed until tomorrow",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to snooze task",
        variant: "destructive",
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'snoozed': return <BellOff className="h-5 w-5 text-purple-600" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedStatus === 'active' && task.status === 'completed') return false;
    if (selectedStatus === 'completed' && task.status !== 'completed') return false;
    if (selectedUrgency !== 'all' && task.urgency !== selectedUrgency) return false;
    return true;
  });

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.urgency]) acc[task.urgency] = [];
    acc[task.urgency].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inbox
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-8 w-8" />
          Tasks
        </h1>
        <p className="text-muted-foreground">
          Action items automatically extracted from your emails
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No tasks found</h2>
          <p className="text-muted-foreground">
            Action items from emails will appear here automatically
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {(['critical', 'high', 'medium', 'low'] as const).map(urgency => {
            const tasksInGroup = groupedTasks[urgency] || [];
            if (tasksInGroup.length === 0) return null;

            return (
              <div key={urgency}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <h2 className="text-xl font-semibold capitalize">{urgency} Priority</h2>
                  <Badge className={getUrgencyColor(urgency)}>{tasksInGroup.length}</Badge>
                </div>

                <div className="space-y-3">
                  {tasksInGroup.map(task => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleStatusChange(
                            task.id,
                            task.status === 'completed' ? 'pending' : 'completed'
                          )}
                          className="mt-1"
                        >
                          {getStatusIcon(task.status)}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-semibold mb-2 ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 text-sm">
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{format(new Date(task.due_date), "PPP")}</span>
                              </div>
                            )}

                            {task.assignee && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{task.assignee}</span>
                              </div>
                            )}

                            {task.email_id && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Mail className="h-4 w-4" />
                                <span className="text-xs">From email</span>
                              </div>
                            )}

                            {task.ai_confidence && (
                              <Badge variant="outline" className="text-xs">
                                AI: {Math.round(task.ai_confidence * 100)}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSnooze(task.id)}
                            disabled={task.status === 'completed'}
                          >
                            <BellOff className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          {editingTask && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={editingTask.due_date ? format(new Date(editingTask.due_date), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      due_date: e.target.value ? new Date(e.target.value).toISOString() : null
                    })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Urgency</label>
                  <Select
                    value={editingTask.urgency}
                    onValueChange={(value: any) => setEditingTask({ ...editingTask, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Assignee</label>
                <Input
                  value={editingTask.assignee || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                  placeholder="Person responsible"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
