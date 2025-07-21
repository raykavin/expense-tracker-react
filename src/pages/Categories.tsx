import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Edit, Trash2, FolderPlus } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CategoryForm } from '@/components/forms/CategoryForm';

export default function Categories() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const { categories, deleteCategory } = useAppStore();

  const handleDeleteCategory = (id: string) => {
    if (confirm(t('are_you_sure_you_want_to_delete_this_category'))) {
      deleteCategory(id);
    }
  };

  const handleEditCategory = (id: string) => {
    setEditingCategory(id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('categories')}</h1>
          <p className="text-muted-foreground">
            {t('organize_your_transactions_with_custom_categories')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('add_category')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? t('edit_category') : t('add_new_category')}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm 
              categoryId={editingCategory}
              onSuccess={handleCloseDialog}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                      {category.type}
                    </Badge>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(category.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {category.subcategories.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('subcategories')} ({category.subcategories.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {category.subcategories.slice(0, 4).map((sub) => (
                      <Badge key={sub.id} variant="outline" className="text-xs">
                        {sub.name}
                      </Badge>
                    ))}
                    {category.subcategories.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{category.subcategories.length - 4} {t('more')}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('no_subcategories')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderPlus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('no_categories_yet')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('create_your_first_category_to_start_organizing_your_transactions')}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('add_category')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
