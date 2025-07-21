import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/lib/store';
import { budgetSchema, type BudgetFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BudgetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BudgetForm({ onSuccess, onCancel }: BudgetFormProps) {
  const { t } = useTranslation();
  const { categories, addBudget } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly',
      alertThreshold: 80
    }
  });

  const watchCategory = watch('categoryId');
  const selectedCategory = categories.find(c => c.id === watchCategory);

  const onSubmit = async (data: BudgetFormData) => {
    try {
      addBudget({
        ...data,
        categoryId: data.categoryId || '',
        limit: data.limit || 0,
        period: data.period || 'monthly',
        alertThreshold: data.alertThreshold || 80
      });
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('add_new_budget')}</CardTitle>
        <CardDescription>
          {t('set_spending_limits_for_your_categories')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <Select onValueChange={(value) => setValue('categoryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('select_a_category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(cat => cat.type === 'expense' || cat.type === 'both').map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Subcategory Selection */}
          {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
            <div className="space-y-2">
              <Label>{t('subcategory_optional')}</Label>
              <Select onValueChange={(value) => setValue('subcategoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_a_subcategory_or_leave_empty_for_entire_category')} />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Budget Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">{t('budget_limit')}</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register('limit', { valueAsNumber: true })}
            />
            {errors.limit && (
              <p className="text-sm text-destructive">{errors.limit.message}</p>
            )}
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label>{t('period')}</Label>
            <Select 
              value={watch('period')} 
              onValueChange={(value) => setValue('period', value as 'monthly' | 'yearly')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{t('monthly')}</SelectItem>
                <SelectItem value="yearly">{t('yearly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2">
            <Label htmlFor="alertThreshold">{t('alert_threshold')}</Label>
            <Input
              id="alertThreshold"
              type="number"
              min="0"
              max="100"
              placeholder="80"
              {...register('alertThreshold', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              {t('get_notified_when_you_reach_this_percentage_of_your_budget')}
            </p>
            {errors.alertThreshold && (
              <p className="text-sm text-destructive">{errors.alertThreshold.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? t('creating') : t('create_budget')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('cancel')}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
