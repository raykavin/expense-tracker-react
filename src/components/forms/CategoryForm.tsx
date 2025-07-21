import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { categorySchema, type CategoryFormData } from '@/lib/validations';
import { generateColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categoryIcons = [
  '🍽️', '🚗', '🏠', '💊', '🎓', '🛍️', '🎬', '📱', '💰', '📊',
  '✈️', '🏋️', '🎵', '📚', '🎨', '🔧', '🌱', '💡', '🎁', '⚡'
];

const categoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#686DE0', '#4B7BEC', '#A3CB38', '#FD79A8', '#FDCB6E'
];

interface CategoryFormProps {
  categoryId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ categoryId, onSuccess, onCancel }: CategoryFormProps) {
  const { t } = useTranslation();
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubcategory, setNewSubcategory] = useState('');
  const { categories, addCategory, updateCategory } = useAppStore();
  
  const isEditing = Boolean(categoryId);
  const existingCategory = isEditing ? categories.find(c => c.id === categoryId) : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: generateColor(),
      icon: categoryIcons[0],
      type: 'expense'
    }
  });

  const watchColor = watch('color');
  const watchIcon = watch('icon');

  useEffect(() => {
    if (existingCategory) {
      setValue('name', existingCategory.name);
      setValue('color', existingCategory.color);
      setValue('icon', existingCategory.icon);
      setValue('type', existingCategory.type);
      setValue('budgetLimit', existingCategory.budgetLimit);
      setSubcategories(existingCategory.subcategories.map(sub => sub.name));
    }
  }, [existingCategory, setValue]);

  const addSubcategory = () => {
    if (newSubcategory.trim() && !subcategories.includes(newSubcategory.trim())) {
      setSubcategories([...subcategories, newSubcategory.trim()]);
      setNewSubcategory('');
    }
  };

  const removeSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const categoryData = {
        ...data,
        name: data.name || '',
        type: data.type || 'expense',
        color: data.color || generateColor(),
        icon: data.icon || categoryIcons[0],
        subcategories: subcategories.map((name, index) => ({
          id: `${categoryId || 'new'}-${index}`,
          name
        }))
      };

      if (isEditing && categoryId) {
        updateCategory(categoryId, categoryData);
      } else {
        addCategory(categoryData);
      }

      reset();
      setSubcategories([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isEditing ? t('edit_category') : t('add_new_category')}
        </CardTitle>
        <CardDescription>
          {t('create_and_customize_categories_to_organize_your_transactions')}
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
              {watchIcon}
            </div>
            <div>
              <p className="font-medium">{t('category_preview')}</p>
              <p className="text-sm text-muted-foreground">
                {t('this_is_how_your_category_will_appear')}
              </p>
            </div>
          </div>

          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('category_name')}</Label>
            <Input
              id="name"
              placeholder={t('enter_category_name')}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category Type */}
          <div className="space-y-2">
            <Label>{t('category_type')}</Label>
            <Select 
              value={watch('type')} 
              onValueChange={(value) => setValue('type', value as 'income' | 'expense' | 'both')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{t('income')}</SelectItem>
                <SelectItem value="expense">{t('expense')}</SelectItem>
                <SelectItem value="both">{t('both')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>{t('icon')}</Label>
            <div className="grid grid-cols-10 gap-2">
              {categoryIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue('icon', icon)}
                  className={`
                    w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-colors
                    ${watchIcon === icon 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>{t('color')}</Label>
            <div className="grid grid-cols-10 gap-2">
              {categoryColors.map((color) => (
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

          {/* Budget Limit */}
          <div className="space-y-2">
            <Label htmlFor="budgetLimit">{t('monthly_budget_limit_optional')}</Label>
            <Input
              id="budgetLimit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('budgetLimit', { valueAsNumber: true })}
            />
            {errors.budgetLimit && (
              <p className="text-sm text-destructive">{errors.budgetLimit.message}</p>
            )}
          </div>

          {/* Subcategories */}
          <div className="space-y-2">
            <Label>{t('subcategories')}</Label>
            <div className="flex space-x-2">
              <Input
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                placeholder={t('add_subcategory')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategory())}
              />
              <Button type="button" onClick={addSubcategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {subcategories.map((sub, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => removeSubcategory(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? t('saving') : isEditing ? t('update_category') : t('add_category')}
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
