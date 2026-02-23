import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { OverviewTab } from "./OverviewTab";
import { TasksTab } from "./TasksTab";
import { SprintsTab } from "./SprintsTab";
import { BugReportsTab } from "./BugReportsTab";
import { LogsTab } from "./LogsTab";
import { DeploymentsTab } from "./DeploymentsTab";

const ProjectManagement = () => {
  return (
    <div className="min-h-screen bg-background pb-20 p-4 md:p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">ניהול פרויקט</h1>
        <p className="text-muted-foreground">
          מעקב משימות, ספרינטים, באגים ופריסות
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" dir="rtl">
        <ScrollArea className="w-full" dir="rtl">
          <TabsList className="inline-flex w-auto">
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="tasks">משימות</TabsTrigger>
            <TabsTrigger value="sprints">ספרינטים</TabsTrigger>
            <TabsTrigger value="bugs">באגים</TabsTrigger>
            <TabsTrigger value="logs">לוגים</TabsTrigger>
            <TabsTrigger value="deployments">פריסות</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="tasks">
          <TasksTab />
        </TabsContent>
        <TabsContent value="sprints">
          <SprintsTab />
        </TabsContent>
        <TabsContent value="bugs">
          <BugReportsTab />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
        <TabsContent value="deployments">
          <DeploymentsTab />
        </TabsContent>
      </Tabs>
      <AdminBottomNav />
    </div>
  );
};

export default ProjectManagement;
