import { useState } from 'react';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PlaceGuestOrderModalProps {
  open: boolean;
  onClose: () => void;
  type: 'guest' | 'custom';
  onOrderPlaced?: (data: { name: string; type: 'guest' | 'custom'; city: string; items: number; total: number }) => void;
}

const menuItems = [
  { name: 'Butter Chicken', price: 250 },
  { name: 'Paneer Butter Masala', price: 200 },
  { name: 'Dal Makhani', price: 160 },
  { name: 'Veg Biryani', price: 180 },
  { name: 'Chicken Biryani', price: 240 },
  { name: 'Naan', price: 40 },
  { name: 'Roti', price: 20 },
  { name: 'Fried Rice', price: 170 },
  { name: 'Manchurian', price: 130 },
  { name: 'Momos (6 pcs)', price: 120 },
  { name: 'Pasta', price: 200 },
  { name: 'Caesar Salad', price: 150 },
];

const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

export default function PlaceGuestOrderModal({ open, onClose, type, onOrderPlaced }: PlaceGuestOrderModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [city, setCity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: 0 },
  ]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), name: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<OrderItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const handleMenuSelect = (id: string, name: string) => {
    const found = menuItems.find(m => m.name === name);
    updateItem(id, { name, unitPrice: found?.price ?? 0 });
  };

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const resetForm = () => {
    setGuestName(''); setGuestEmail(''); setGuestPhone('');
    setCity(''); setDeliveryDate(''); setDeliveryTime('');
    setDeliveryAddress(''); setNotes('');
    setItems([{ id: '1', name: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleSubmit = async () => {
    if (!guestName || !city || !deliveryDate || items.some(i => !i.name)) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);

    if (onOrderPlaced) {
      onOrderPlaced({
        name: guestName,
        type,
        city,
        items: totalQty,
        total: totalAmount,
      });
    }

    resetForm();
    onClose();
  };

  const title = type === 'guest' ? 'Place Guest Order' : 'Place Custom Order';

  return (
    <Dialog open={open} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            {title}
            <Badge variant="secondary" className="text-xs capitalize">{type}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Info Banner */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/5 border border-warning/20">
            <span className="text-sm">📋</span>
            <p className="text-[11px] text-warning leading-relaxed">
              This order will be sent to <strong>Super Admin</strong> for approval. Once approved, it will appear in your orders list.
            </p>
          </div>

          {/* Customer Details */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {type === 'guest' ? 'Guest' : 'Customer'} Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Rahul Sharma" value={guestName} onChange={e => setGuestName(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input type="email" placeholder="rahul@email.com" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input type="tel" placeholder="+91 98765 43210" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">City <span className="text-destructive">*</span></Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {cities.map(c => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Details */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Delivery Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Delivery Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Delivery Time</Label>
                <Input type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Delivery Address</Label>
                <Input placeholder="Building, street, area..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Order Items <span className="text-destructive">*</span>
              </p>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-1">
                <p className="col-span-5 text-[10px] font-medium text-muted-foreground">Item</p>
                <p className="col-span-2 text-[10px] font-medium text-muted-foreground">Qty</p>
                <p className="col-span-3 text-[10px] font-medium text-muted-foreground">Unit Price (₹)</p>
                <p className="col-span-2 text-[10px] font-medium text-muted-foreground">Total</p>
              </div>

              {items.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Select value={item.name} onValueChange={v => handleMenuSelect(item.id, v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select item" /></SelectTrigger>
                      <SelectContent>
                        {menuItems.map(m => (
                          <SelectItem key={m.name} value={m.name} className="text-xs">{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })} className="h-8 text-xs text-center" />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" min={0} value={item.unitPrice || ''} onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })} className="h-8 text-xs" placeholder="0" />
                  </div>
                  <div className="col-span-1 text-xs font-medium text-foreground text-right">
                    ₹{item.quantity * item.unitPrice}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className={cn('text-muted-foreground hover:text-destructive transition-colors', items.length === 1 && 'opacity-30 cursor-not-allowed')}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Special Instructions / Notes</Label>
            <Textarea placeholder="Allergies, dietary restrictions, delivery notes..." value={notes} onChange={e => setNotes(e.target.value)} className="text-sm resize-none" rows={2} />
          </div>

          {/* Order Summary */}
          <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-medium">{totalQty}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>Total Amount</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => { resetForm(); onClose(); }} className="text-sm">Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="text-sm">
              {saving ? 'Submitting…' : `Submit for Approval`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
