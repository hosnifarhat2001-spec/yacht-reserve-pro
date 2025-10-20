import { useState } from 'react';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, User, Mail, Phone, Search, Users } from 'lucide-react';
import { clientService } from '@/lib/storage';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientManagementProps {
  clients: Client[];
  onUpdate: () => void;
}

export const ClientManagement = ({ clients, onUpdate }: ClientManagementProps) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const filteredClients = clients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
  );

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
    });
  };

  const handleUpdate = async () => {
    if (!editingClient) return;

    try {
      await clientService.updateClient(editingClient.id, formData);
      toast.success(t('تم تحديث بيانات العميل', 'Client updated successfully'));
      setEditingClient(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error(t('حدث خطأ في تحديث البيانات', 'Error updating client'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('هل أنت متأكد من حذف هذا العميل؟', 'Are you sure you want to delete this client?'))) {
      try {
        await clientService.deleteClient(id);
        toast.success(t('تم حذف العميل بنجاح', 'Client deleted successfully'));
        onUpdate();
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error(t('حدث خطأ في حذف العميل', 'Error deleting client'));
      }
    }
  };

  if (clients.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-xl text-muted-foreground">
          {t('لا يوجد عملاء حتى الآن', 'No clients yet')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">
          {t('إدارة العملاء', 'Client Management')}
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('بحث...', 'Search...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-bold text-lg">{client.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span dir="ltr">{client.phone}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('تاريخ التسجيل:', 'Registered:')} {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(client)} variant="outline" size="sm">
                  <Edit className="w-4 h-4 ml-1" />
                  {t('تعديل', 'Edit')}
                </Button>
                <Button onClick={() => handleDelete(client.id)} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 ml-1" />
                  {t('حذف', 'Delete')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('تعديل بيانات العميل', 'Edit Client')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('الاسم الكامل', 'Full Name')}</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('البريد الإلكتروني', 'Email')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('رقم الهاتف', 'Phone')}</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingClient(null)}>
                {t('إلغاء', 'Cancel')}
              </Button>
              <Button onClick={handleUpdate}>{t('حفظ', 'Save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
