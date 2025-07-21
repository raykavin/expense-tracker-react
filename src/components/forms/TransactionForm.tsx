import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { transactionSchema, type TransactionFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<TransactionFormData>;
  mode?: 'create' | 'edit';
}

export function TransactionForm({ onSuccess, onCancel, initialData, mode = 'create' }: TransactionFormProps) {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const { categories, accounts, addTransaction, updateTransaction } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      isRecurring: false,
      ...initialData,
      date: initialData?.date || format(new Date(), 'yyyy-MM-dd')
    }
  });

  const watchType = watch('type');
  const watchCategory = watch('category');
  const watchIsRecurring = watch('isRecurring');

  const filteredCategories = categories.filter(cat => 
    cat.type === watchType || cat.type === 'both'
  );

  const selectedCategory = categories.find(cat => cat.id === watchCategory);
  const subcategories = selectedCategory?.subcategories || [];

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const transactionData = {
        ...data,
        date: format(date, 'yyyy-MM-dd'),
        amount: Number(data.amount),
        description: data.description || '',
        category: data.category || '',
        account: data.account || '',
        type: data.type || 'expense'
      };

      if (mode === 'create') {
        addTransaction(transactionData);
      } else {
        // updateTransaction(initialData?.id!, transactionData);
      }

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? t('add_transaction') : t('edit_transaction')}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? t('record_a_new_income_or_expense_transaction')
            : t('update_transaction_details')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>{t('transaction_type')}</Label>
            <Select 
              value={watchType} 
              onValueChange={(value) => setValue('type', value as 'income' | 'expense')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{t('income')}</SelectItem>
                <SelectItem value="expense">{t('expense')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Input
              id="description"
              placeholder={t('enter_transaction_description')}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{t('date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>{t('pick_a_date')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    setDate(date || new Date());
                    setValue('date', format(date || new Date(), 'yyyy-MM-dd'));
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <Select 
              value={watchCategory} 
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('select_a_category')} />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Subcategory */}
          {subcategories.length > 0 && (
            <div className="space-y-2">
              <Label>{t('subcategory_optional')}</Label>
              <Select onValueChange={(value) => setValue('subcategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_a_subcategory')} />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Account */}
          <div className="space-y-2">
            <Label>{t('account')}</Label>
            <Select onValueChange={(value) => setValue('account', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('select_an_account')} />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(acc => acc.isActive).map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: account.color }}
                      />
                      <span>{account.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account && (
              <p className="text-sm text-destructive">{errors.account.message}</p>
            )}
          </div>

          {/* Recurring Transaction */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={watchIsRecurring}
                onCheckedChange={(checked) => setValue('isRecurring', checked)}
              />
              <Label htmlFor="recurring">{t('recurring_transaction')}</Label>
            </div>

            {watchIsRecurring && (
              <div className="space-y-2">
                <Label>{t('frequency')}</Label>
                <Select onValueChange={(value) => setValue('recurringFrequency', value as 'daily' | 'weekly' | 'monthly' | 'yearly')}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_frequency')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('daily')}</SelectItem>
                    <SelectItem value="weekly">{t('weekly')}</SelectItem>
                    <SelectItem value="monthly">{t('monthly')}</SelectItem>
                    <SelectItem value="yearly">{t('yearly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? t('saving') : mode === 'create' ? t('add_transaction') : t('update_transaction')}
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
