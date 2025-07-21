import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, getAccountTypeIcon } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AccountForm } from '@/components/forms/AccountForm';

export default function Accounts() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const { accounts, deleteAccount, updateAccount, getTotalBalance } = useAppStore();

  const totalBalance = getTotalBalance();
  const activeAccounts = accounts.filter(acc => acc.isActive);
  const inactiveAccounts = accounts.filter(acc => !acc.isActive);

  const handleDeleteAccount = (id: string) => {
    if (confirm(t('are_you_sure_you_want_to_delete_this_account'))) {
      deleteAccount(id);
    }
  };

  const handleEditAccount = (id: string) => {
    setEditingAccount(id);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateAccount(id, { isActive });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('accounts')}</h1>
          <p className="text-muted-foreground">
            {t('manage_your_financial_accounts_and_track_balances')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('add_account')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? t('edit_account') : t('add_new_account')}
              </DialogTitle>
            </DialogHeader>
            <AccountForm 
              accountId={editingAccount}
              onSuccess={handleCloseDialog}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('account_summary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
              <p className="text-sm text-muted-foreground">{t('total_balance')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{activeAccounts.length}</p>
              <p className="text-sm text-muted-foreground">{t('active_accounts')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{accounts.length}</p>
              <p className="text-sm text-muted-foreground">{t('total_accounts')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Accounts */}
      {activeAccounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('active_accounts')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeAccounts.map((account) => (
              <Card key={account.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${account.color}20`, color: account.color }}
                      >
                        {getAccountTypeIcon(account.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {account.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAccount(account.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-2xl font-bold ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">{t('current_balance')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('active')}</span>
                      <Switch
                        checked={account.isActive}
                        onCheckedChange={(checked) => handleToggleActive(account.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Accounts */}
      {inactiveAccounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">{t('inactive_accounts')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactiveAccounts.map((account) => (
              <Card key={account.id} className="relative group opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${account.color}20`, color: account.color }}
                      >
                        {getAccountTypeIcon(account.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {account.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAccount(account.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-2xl font-bold ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">{t('current_balance')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('active')}</span>
                      <Switch
                        checked={account.isActive}
                        onCheckedChange={(checked) => handleToggleActive(account.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('no_accounts_yet')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('add_your_first_account_to_start_tracking_your_finances')}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('add_account')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
