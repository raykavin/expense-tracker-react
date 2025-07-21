import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Save, User, Palette, Database, Download, Upload } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Settings() {
  const { t } = useTranslation();
  const { user, theme, toggleTheme, setUser, transactions, categories, accounts, budgets, goals } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || 'USD',
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          currency: formData.currency,
        });
      }
      setSaveMessage(t('settings_saved_successfully'));
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage(t('error_saving_settings'));
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      transactions,
      categories,
      accounts,
      budgets,
      goals,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        // Here you would implement the import logic
        setSaveMessage(t('data_imported_successfully'));
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        setSaveMessage(t('error_importing_data'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
        <p className="text-muted-foreground">
          {t('manage_your_account_and_application_preferences')}
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <Alert>
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t('profile_settings')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('full_name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('enter_your_full_name')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email_address')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('enter_your_email_address')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('default_currency')}</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
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
            </div>

            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? t('saving') : t('save_changes')}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>{t('appearance')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('dark_mode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('toggle_between_light_and_dark_themes')}
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t('theme_preview')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-background text-foreground">
                  <div className="h-6 w-6 rounded bg-primary mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-muted rounded"></div>
                    <div className="h-2 w-3/4 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium">{t('current_theme')}</div>
                  <div className="text-xs text-muted-foreground capitalize">{theme} mode</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>{t('data_management')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('export_data')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('download_a_backup_of_all_your_financial_data')}
              </p>
              <Button variant="outline" onClick={exportData} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {t('export_data')}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t('import_data')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('restore_data_from_a_previous_backup')}
              </p>
              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('data_statistics')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <div className="text-sm text-muted-foreground">{t('transactions')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-muted-foreground">{t('categories')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{accounts.length}</div>
                <div className="text-sm text-muted-foreground">{t('accounts')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{goals.length}</div>
                <div className="text-sm text-muted-foreground">{t('goals')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
