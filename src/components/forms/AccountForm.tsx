import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/lib/store';
import { accountSchema, type AccountFormData } from '@/lib/validations';
import { generateColor, getAccountTypeIcon } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const accountColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#686DE0', '#4B7BEC', '#A3CB38', '#FD79A8', '#FDCB6E'
];

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

interface AccountFormProps {
  accountId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AccountForm({ accountId, onSuccess, onCancel }: AccountFormProps) {
  const { t } = useTranslation();
  const { accounts, addAccount, updateAccount } = useAppStore();
  
  const isEditing = Boolean(accountId);
  const existingAccount = isEditing ? accounts.find(a => a.id === accountId) : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'bank',
      balance: 0,
      currency: 'USD',
      color: generateColor(),
      isActive: true
    }
  });

  const watchType = watch('type');
  const watchColor = watch('color');

  useEffect(() => {
    if (existingAccount) {
      setValue('name', existingAccount.name);
      setValue('type', existingAccount.type);
      setValue('balance', existingAccount.balance);
      setValue('currency', existingAccount.currency);
      setValue('color', existingAccount.color);
      setValue('isActive', existingAccount.isActive);
    }
  }, [existingAccount, setValue]);

  const onSubmit = async (data: AccountFormData) => {
    try {
      const accountData = {
        ...data,
        type: data.type || 'bank',
        name: data.name || '',
        color: data.color || generateColor(),
        balance: data.balance || 0,
        currency: data.currency || 'USD',
        isActive: data.isActive === undefined ? true : data.isActive
      };
      if (isEditing && accountId) {
        updateAccount(accountId, accountData);
      } else {
        addAccount(accountData);
      }

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isEditing ? t('edit_account') : t('add_new_account')}
        </CardTitle>
        <CardDescription>
          {t('create_and_manage_your_financial_accounts')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Preview */}
          <div className="flex items-center space-x-4 p-4 rounded-lg border bg-muted/50">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${watchColor}20`, color: watchColor }}
            >
              {getAccountTypeIcon(watchType)}
            </div>
            <div>
              <p className="font-medium">{t('account_preview')}</p>
              <p className="text-sm text-muted-foreground">
                {t('this_is_how_your_account_will_appear')}
              </p>
            </div>
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('account_name')}</Label>
            <Input
              id="name"
              placeholder={t('enter_account_name')}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label>{t('account_type')}</Label>
            <Select 
              value={watchType} 
              onValueChange={(value) => setValue('type', value as 'cash' | 'bank' | 'credit' | 'investment')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 {t('cash')}</SelectItem>
                <SelectItem value="bank">🏦 {t('bank_account')}</SelectItem>
                <SelectItem value="credit">💳 {t('credit_card')}</SelectItem>
                <SelectItem value="investment">📈 {t('investment')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">{t('initial_balance')}</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('balance', { valueAsNumber: true })}
            />
            {errors.balance && (
              <p className="text-sm text-destructive">{errors.balance.message}</p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label>{t('currency')}</Label>
            <Select 
              value={watch('currency')} 
              onValueChange={(value) => setValue('currency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-destructive">{errors.currency.message}</p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>{t('color')}</Label>
            <div className="grid grid-cols-10 gap-2">
              {accountColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`
                    w-10 h-10 rounded-lg border-2 transition-transform
                    ${watchColor === color 
                      ? 'border-foreground scale-110' 
                      : 'border-border hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">{t('active_account')}</Label>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? t('saving') : isEditing ? t('update_account') : t('add_account')}
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
