import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { parseCSVToTransactions } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface ImportTransaction {
  description: string;
  amount: number;
  date: string;
  category?: string;
  account: string;
  type?: 'income' | 'expense';
  isSelected: boolean;
  suggestedCategory?: string;
  suggestedType?: 'income' | 'expense';
}

export default function Import() {
  const { t } = useTranslation();
  const [importData, setImportData] = useState<ImportTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { categories, accounts, addTransaction } = useAppStore();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      setUploadStatus('error');
      setErrorMessage(t('please_upload_a_csv_file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const parsedData = parseCSVToTransactions(csvContent);
        
        const processedData: ImportTransaction[] = parsedData.map((row) => {
          const amount = parseFloat(row.amount) || 0;
          const description = row.description || '';
          
          // Auto-suggest category based on description keywords
          const suggestedCategory = categories.find(cat => 
            description.toLowerCase().includes(cat.name.toLowerCase())
          )?.id;
          
          // Auto-suggest type based on amount or keywords
          const suggestedType: 'income' | 'expense' = amount > 0 ? 'income' : 'expense';
          
          return {
            description,
            amount: Math.abs(amount),
            date: row.date || new Date().toISOString().split('T')[0],
            account: accounts[0]?.id || '',
            isSelected: true,
            suggestedCategory,
            suggestedType,
            type: suggestedType,
            category: suggestedCategory
          };
        });

        setImportData(processedData);
        setUploadStatus('success');
        setErrorMessage('');
      } catch (error) {
        setUploadStatus('error');
        setErrorMessage(t('error_parsing_csv_file'));
      }
    };
    
    reader.readAsText(file);
  }, [categories, accounts]);

  const updateTransaction = (index: number, field: keyof ImportTransaction, value: string | boolean) => {
    setImportData(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const toggleAllSelection = () => {
    const allSelected = importData.every(item => item.isSelected);
    setImportData(prev => 
      prev.map(item => ({ ...item, isSelected: !allSelected }))
    );
  };

  const importSelectedTransactions = async () => {
    const selectedTransactions = importData.filter(item => item.isSelected);
    if (selectedTransactions.length === 0) return;

    setIsProcessing(true);
    
    try {
      for (const transaction of selectedTransactions) {
        addTransaction({
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          category: transaction.category || categories[0]?.id || '',
          type: transaction.type || 'expense',
          account: transaction.account
        });
      }
      
      setImportData([]);
      setUploadStatus('idle');
    } catch (error) {
      setErrorMessage(t('error_importing_transactions'));
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'date,description,amount,type,category,account',
      '2024-01-01,Sample Transaction,100.00,expense,Food,Main Account',
      '2024-01-02,Salary,2500.00,income,Salary,Main Account'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transaction-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('import_transactions')}</h1>
          <p className="text-muted-foreground">
            {t('import_transactions_from_csv_files')}
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          {t('download_template')}
        </Button>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('upload_csv_file')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">{t('select_csv_file')}</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </div>

          {uploadStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t('successfully_loaded')} {importData.length} {t('transactions_from_csv_file')}
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>{t('csv_format')}</strong></p>
            <p>{t('required_columns')}</p>
            <p>{t('optional_columns')}</p>
            <p>{t('date_format')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {importData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('preview_and_edit_transactions')}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllSelection}
                >
                  {importData.every(item => item.isSelected) ? t('deselect_all') : t('select_all')}
                </Button>
                <Button
                  onClick={importSelectedTransactions}
                  disabled={isProcessing || !importData.some(item => item.isSelected)}
                >
                  {isProcessing ? t('importing') : `${t('import_selected')} (${importData.filter(item => item.isSelected).length})`}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={importData.every(item => item.isSelected)}
                        onCheckedChange={toggleAllSelection}
                      />
                    </TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('account')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox
                          checked={transaction.isSelected}
                          onCheckedChange={(checked) => 
                            updateTransaction(index, 'isSelected', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={transaction.date}
                          onChange={(e) => updateTransaction(index, 'date', e.target.value)}
                          className="w-40"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={transaction.description}
                          onChange={(e) => updateTransaction(index, 'description', e.target.value)}
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={transaction.amount}
                          onChange={(e) => updateTransaction(index, 'amount', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={transaction.type}
                          onValueChange={(value) => updateTransaction(index, 'type', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">{t('income')}</SelectItem>
                            <SelectItem value="expense">{t('expense')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={transaction.category}
                          onValueChange={(value) => updateTransaction(index, 'category', value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder={t('select_category')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.icon} {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={transaction.account}
                          onValueChange={(value) => updateTransaction(index, 'account', value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.filter(acc => acc.isActive).map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
