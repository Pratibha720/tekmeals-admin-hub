import { useState } from 'react';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
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

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface PlaceGroceryOrderModalProps {
  open: boolean;
  onClose: () => void;
}

const groceryCategories = ['Vegetables', 'Fruits', 'Dairy', 'Grains & Pulses', 'Spices', 'Beverages', 'Snacks', 'Frozen Foods', 'Other'];

const units = ['kg', 'gm', 'litre', 'ml', 'pieces', 'dozen', 'packet', 'box', 'can'];

const commonGroceries = [
  { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', price: 40 },
  { name: 'Onions', category: 'Vegetables', unit: 'kg', price: 35 },
  { name: 'Potatoes', category: 'Vegetables', unit: 'kg', price: 30 },
  { name: 'Spinach', category: 'Vegetables', unit: 'kg', price: 50 },
  { name: 'Milk (Full Fat)', category: 'Dairy', unit: 'litre', price: 60 },
  { name: 'Curd', category: 'Dairy', unit: 'kg', price: 80 },
  { name: 'Paneer', category: 'Dairy', unit: 'kg', price: 300 },
  { name: 'Rice (Basmati)', category: 'Grains & Pulses', unit: 'kg', price: 120 },
  { name: 'Wheat Flour', category: 'Grains & Pulses', unit: 'kg', price: 45 },
  { name: 'Dal (Toor)', category: 'Grains & Pulses', unit: 'kg', price: 130 },
  { name: 'Cooking Oil', category: 'Other', unit: 'litre', price: 150 },
  { name: 'Salt', category: 'Spices', unit: 'kg', price: 20 },
];

const vendors = ['Fresh Farm Supplies', 'Metro Cash & Carry', 'City Grocers', 'Daily Fresh', 'BigBasket B2B'];
const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

export default function PlaceGroceryOrderModal({ open, onClose }: PlaceGroceryOrderModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [vendor, setVendor] = useState('');
  const [city, setCity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<GroceryItem[]>([
    { id: '1', name: '', category: '', quantity: 1, unit: 'kg', unitPrice: 0 },
  ]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), name: '', category: '', quantity: 1, unit: 'kg', unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<GroceryItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const handleGrocerySelect = (id: string, name: string) => {
    const found = commonGroceries.find(g => g.name === name);
    updateItem(id, {
      name,
      category: found?.category ?? '',
      unit: found?.unit ?? 'kg',
      unitPrice: found?.price ?? 0,
    });
  };

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalItems = items.length;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleSubmit = async () => {
    if (!vendor || !city || !deliveryDate || items.some(i => !i.name)) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    toast({
      title: '✅ Grocery Order Placed!',
      description: `${totalItems} item(s) ordered from ${vendor} — ${formatCurrency(totalAmount)}.`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Place Grocery Order
            <Badge variant="secondary" className="text-xs">Groceries</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">

          {/* Vendor & Delivery Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Vendor / Supplier <span className="text-destructive">*</span></Label>
                <Select value={vendor} onValueChange={setVendor}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => <SelectItem key={v} value={v} className="text-sm">{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">City <span className="text-destructive">*</span></Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(c => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Delivery Date <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Delivery Location</Label>
                <Input
                  placeholder="Kitchen / warehouse address"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Grocery Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Grocery Items <span className="text-destructive">*</span>
              </p>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-1">
                <p className="col-span-4 text-[10px] font-medium text-muted-foreground">Item</p>
                <p className="col-span-3 text-[10px] font-medium text-muted-foreground">Category</p>
                <p className="col-span-1 text-[10px] font-medium text-muted-foreground">Qty</p>
                <p className="col-span-1 text-[10px] font-medium text-muted-foreground">Unit</p>
                <p className="col-span-2 text-[10px] font-medium text-muted-foreground">Price (₹)</p>
                <p className="col-span-1"></p>
              </div>

              {items.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Select value={item.name} onValueChange={v => handleGrocerySelect(item.id, v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonGroceries.map(g => (
                          <SelectItem key={g.name} value={g.name} className="text-xs">{g.name}</SelectItem>
                        ))}
                        <SelectItem value="__custom__" className="text-xs text-muted-foreground">+ Custom item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Select value={item.category} onValueChange={v => updateItem(item.id, { category: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {groceryCategories.map(c => (
                          <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="h-8 text-xs text-center px-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <Select value={item.unit} onValueChange={v => updateItem(item.id, { unit: v })}>
                      <SelectTrigger className="h-8 text-xs px-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(u => (
                          <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice || ''}
                      onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-xs"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className={cn(
                        'text-muted-foreground hover:text-destructive transition-colors',
                        items.length === 1 && 'opacity-30 cursor-not-allowed',
                      )}
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
            <Label className="text-xs">Special Notes / Instructions</Label>
            <Textarea
              placeholder="Quality requirements, brand preferences, storage notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order Summary</p>
            {vendor && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendor</span>
                <span className="font-medium">{vendor}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Line Items</span>
              <span className="font-medium">{totalItems} items</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>Estimated Total</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="text-sm">
              {saving ? 'Placing Order…' : 'Place Grocery Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
