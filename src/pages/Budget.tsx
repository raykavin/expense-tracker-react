import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { Plus, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BudgetForm } from '@/components/forms/BudgetForm';

export default function Budget() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { budgets, categories, getCategorySpending } = useAppStore();

  const budgetData = useMemo(() => {
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const spent = getCategorySpending(budget.categoryId, 'month');
      const percentage = calculatePercentage(spent, budget.limit);
      const remaining = budget.limit - spent;
      const isOverBudget = spent > budget.limit;
      const isNearLimit = percentage >= budget.alertThreshold;

      return {
        ...budget,
        category,
        spent,
        percentage,
        remaining,
        isOverBudget,
        isNearLimit
      };
    });
  }, [budgets, categories, getCategorySpending]);

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0);
  const overBudgetCount = budgetData.filter(item => item.isOverBudget).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('budget')}</h1>
          <p className="text-muted-foreground">
            {t('set_spending_limits_and_track_your_progress')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('add_budget')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('add_new_budget')}</DialogTitle>
            </DialogHeader>
            <BudgetForm 
              onSuccess={() => setIsDialogOpen(false)}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_budgeted')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
            <p className="text-xs text-muted-foreground">
              {t('this_months_budget_limits')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_spent')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(totalSpent, totalBudgeted)}{t('of_budget_used')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('over_budget')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overBudgetCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('categories_exceeding_limits')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('budget_categories')}</h2>
        
        {budgetData.length > 0 ? (
          <div className="space-y-4">
            {budgetData.map((item) => (
              <Card key={item.id} className={item.isOverBudget ? 'border-red-200 bg-red-50/50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ 
                          backgroundColor: `${item.category?.color || '#666'}20`, 
                          color: item.category?.color || '#666' 
                        }}
                      >
                        {item.category?.icon || '📊'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.category?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t(item.period)} {t('budget')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {item.isOverBudget && (
                          <Badge variant="destructive">{t('over_budget')}</Badge>
                        )}
                        {item.isNearLimit && !item.isOverBudget && (
                          <Badge variant="secondary">{t('near_limit')}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{t('spent')}: <span className="font-medium text-red-600">{formatCurrency(item.spent)}</span></span>
                      <span>{t('budget')}: <span className="font-medium">{formatCurrency(item.limit)}</span></span>
                    </div>
                    
                    <Progress 
                      value={Math.min(item.percentage, 100)} 
                      className={`h-3 ${item.isOverBudget ? 'bg-red-100' : ''}`}
                    />
                    
                    <div className="flex justify-between text-sm">
                      <span className={item.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.remaining >= 0 ? `${t('remaining')}: ` : `${t('over_by')}: `}
                        <span className="font-medium">
                          {formatCurrency(Math.abs(item.remaining))}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {item.percentage}% {t('used')}
                      </span>
                    </div>

                    {item.isNearLimit && (
                      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">
                          {t('youve_reached')} {item.alertThreshold}{t('of_your_budget_limit')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Target className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('no_budgets_set')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('create_your_first_budget_to_start_tracking_your_spending_limits')}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('add_budget')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
