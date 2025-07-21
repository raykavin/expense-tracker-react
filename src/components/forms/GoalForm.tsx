import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useAppStore } from "@/lib/store";
import { goalSchema, type GoalFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface GoalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const { t } = useTranslation();
  const [targetDate, setTargetDate] = useState<Date>();
  const { addGoal } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      currentAmount: 0,
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      addGoal({
        ...data,
        name: data.name || "",
        targetAmount: data.targetAmount || 0,
        currentAmount: data.currentAmount || 0,
        targetDate: targetDate
          ? format(targetDate, "yyyy-MM-dd")
          : data.targetDate,
        category: data.category || "",
        isCompleted: false,
      });
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("add_new_goal")}</CardTitle>
        <CardDescription>
          {t("set_a_financial_goal_and_track_your_progress")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("goal_name")}</Label>
            <Input
              id="name"
              placeholder={t("eg_emergency_fund_vacation_new_car")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("description_optional")}</Label>
            <Textarea
              id="description"
              placeholder={t("add_more_details_about_your_goal")}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="targetAmount">{t("target_amount")}</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register("targetAmount", { valueAsNumber: true })}
            />
            {errors.targetAmount && (
              <p className="text-sm text-destructive">
                {errors.targetAmount.message}
              </p>
            )}
          </div>

          {/* Current Amount */}
          <div className="space-y-2">
            <Label htmlFor="currentAmount">{t("current_amount")}</Label>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("currentAmount", { valueAsNumber: true })}
            />
            {errors.currentAmount && (
              <p className="text-sm text-destructive">
                {errors.currentAmount.message}
              </p>
            )}
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label>{t("target_date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? (
                    format(targetDate, "PPP")
                  ) : (
                    <span>{t("pick_a_target_date")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={(date) => {
                    setTargetDate(date);
                    setValue(
                      "targetDate",
                      date ? format(date, "yyyy-MM-dd") : ""
                    );
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.targetDate && (
              <p className="text-sm text-destructive">
                {errors.targetDate.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{t("category")}</Label>
            <Input
              id="category"
              placeholder={t("eg_savings_investment_purchase")}
              {...register("category")}
            />
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? t("creating") : t("create_goal")}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
