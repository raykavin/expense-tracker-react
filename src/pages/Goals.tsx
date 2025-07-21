import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Plus, Target, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatDate, calculatePercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GoalForm } from "@/components/forms/GoalForm";

export default function Goals() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { goals, updateGoal } = useAppStore();

  const filteredGoals = goals.filter((goal) => {
    if (filter === "active") return !goal.isCompleted;
    if (filter === "completed") return goal.isCompleted;
    return true;
  });

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);
  const totalTargetAmount = activeGoals.reduce(
    (sum, goal) => sum + goal.targetAmount,
    0
  );
  const totalCurrentAmount = activeGoals.reduce(
    (sum, goal) => sum + goal.currentAmount,
    0
  );

  const markAsCompleted = (goalId: string) => {
    updateGoal(goalId, { isCompleted: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("goals")}</h1>
          <p className="text-muted-foreground">
            {t("set_and_track_your_financial_goals")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("add_goal")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("add_new_goal")}</DialogTitle>
            </DialogHeader>
            <GoalForm
              onSuccess={() => setIsDialogOpen(false)}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_goals")}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("all_time_goals")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("active_goals")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeGoals.length}
            </div>
            <p className="text-xs text-muted-foreground">{t("in_progress")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("completed")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedGoals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("achieved_goals")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("progress")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTargetAmount > 0
                ? calculatePercentage(totalCurrentAmount, totalTargetAmount)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {t("overall_completion")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          {t("all_goals")}
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          {t("active")} ({activeGoals.length})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          {t("completed")} ({completedGoals.length})
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const progress = calculatePercentage(
              goal.currentAmount,
              goal.targetAmount
            );
            const isCompleted = goal.isCompleted;
            const isOverdue =
              new Date(goal.targetDate) < new Date() && !isCompleted;

            return (
              <Card
                key={goal.id}
                className={
                  isCompleted
                    ? "bg-green-50/50 border-green-200"
                    : isOverdue
                    ? "bg-red-50/50 border-red-200"
                    : ""
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        {isCompleted && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {t("completed")}
                          </Badge>
                        )}
                        {isOverdue && (
                          <Badge variant="destructive">{t("overdue")}</Badge>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-muted-foreground text-sm mb-3">
                          {goal.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          {t("target")}: {formatDate(goal.targetDate)}
                        </span>
                        <span>
                          {t("category")}: {goal.category}
                        </span>
                      </div>
                    </div>
                    {!isCompleted && progress >= 100 && (
                      <Button
                        size="sm"
                        onClick={() => markAsCompleted(goal.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("mark_complete")}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {t("progress")}
                      </span>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>

                    <Progress value={Math.min(progress, 100)} className="h-3" />

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {t("current")}:{" "}
                        <span className="font-medium text-foreground">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                      </span>
                      <span>
                        {t("target")}:{" "}
                        <span className="font-medium text-foreground">
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {t("remaining")}:{" "}
                      </span>
                      <span
                        className={`font-medium ${
                          goal.targetAmount - goal.currentAmount <= 0
                            ? "text-green-600"
                            : "text-foreground"
                        }`}
                      >
                        {formatCurrency(
                          Math.max(0, goal.targetAmount - goal.currentAmount)
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Target className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {filter === "all"
                  ? t("no_goals_yet")
                  : t(`no_${filter}_goals_to_display`)}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filter === "all"
                  ? t("create_your_first_goal_to_start_tracking_your_progress")
                  : t(`no_${filter}_goals_to_display`)}
              </p>
              {filter === "all" && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("add_goal")}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
