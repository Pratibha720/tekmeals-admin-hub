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
  onOrderPlaced?: (data: { vendor: string; city: string; items: number; total: number }) => void;
}

// Static data — will be replaced with DB later
const groceryCategories = ['Vegetables', 'Fruits', 'Dairy', 'Grains & Pulses', 'Spices', 'Beverages', 'Snacks', 'Frozen Foods', 'Other'];
const units = ['kg', 'gm', 'litre', 'ml', 'pieces', 'dozen', 'packet', 'box', 'can'];

const groceryItemsByCategory: Record<string, { name: string; unit: string; price: number }[]> = {
  Vegetables: [
    { name: 'Tomatoes', unit: 'kg', price: 40 },
    { name: 'Onions', unit: 'kg', price: 35 },
    { name: 'Potatoes', unit: 'kg', price: 30 },
    { name: 'Spinach', unit: 'kg', price: 50 },
    { name: 'Capsicum', unit: 'kg', price: 60 },
    { name: 'Cauliflower', unit: 'kg', price: 45 },
    { name: 'Cabbage', unit: 'kg', price: 30 },
    { name: 'Brinjal', unit: 'kg', price: 40 },
    { name: 'Lady Finger', unit: 'kg', price: 55 },
    { name: 'Green Peas', unit: 'kg', price: 80 },
  ],
  Fruits: [
    { name: 'Bananas', unit: 'dozen', price: 50 },
    { name: 'Apples', unit: 'kg', price: 150 },
    { name: 'Oranges', unit: 'kg', price: 80 },
    { name: 'Mangoes', unit: 'kg', price: 120 },
    { name: 'Grapes', unit: 'kg', price: 90 },
    { name: 'Watermelon', unit: 'kg', price: 30 },
    { name: 'Papaya', unit: 'kg', price: 40 },
    { name: 'Pomegranate', unit: 'kg', price: 180 },
  ],
  Dairy: [
    { name: 'Milk (Full Fat)', unit: 'litre', price: 60 },
    { name: 'Curd', unit: 'kg', price: 80 },
    { name: 'Paneer', unit: 'kg', price: 300 },
    { name: 'Butter', unit: 'kg', price: 480 },
    { name: 'Cheese', unit: 'kg', price: 400 },
    { name: 'Cream', unit: 'litre', price: 200 },
    { name: 'Buttermilk', unit: 'litre', price: 30 },
  ],
  'Grains & Pulses': [
    { name: 'Rice (Basmati)', unit: 'kg', price: 120 },
    { name: 'Wheat Flour', unit: 'kg', price: 45 },
    { name: 'Dal (Toor)', unit: 'kg', price: 130 },
    { name: 'Dal (Moong)', unit: 'kg', price: 110 },
    { name: 'Chana Dal', unit: 'kg', price: 90 },
    { name: 'Rajma', unit: 'kg', price: 140 },
    { name: 'Poha', unit: 'kg', price: 50 },
    { name: 'Sooji', unit: 'kg', price: 45 },
  ],
  Spices: [
    { name: 'Salt', unit: 'kg', price: 20 },
    { name: 'Turmeric Powder', unit: 'kg', price: 200 },
    { name: 'Red Chilli Powder', unit: 'kg', price: 300 },
    { name: 'Cumin Seeds', unit: 'kg', price: 350 },
    { name: 'Coriander Powder', unit: 'kg', price: 180 },
    { name: 'Garam Masala', unit: 'kg', price: 500 },
    { name: 'Black Pepper', unit: 'kg', price: 800 },
  ],
  Beverages: [
    { name: 'Tea Leaves', unit: 'kg', price: 400 },
    { name: 'Coffee Powder', unit: 'kg', price: 500 },
    { name: 'Sugar', unit: 'kg', price: 45 },
    { name: 'Mineral Water (20L)', unit: 'can', price: 80 },
  ],
  Snacks: [
    { name: 'Biscuits (Parle-G)', unit: 'packet', price: 10 },
    { name: 'Bread', unit: 'packet', price: 40 },
    { name: 'Namkeen Mix', unit: 'kg', price: 200 },
    { name: 'Chips (Lays)', unit: 'packet', price: 20 },
  ],
  'Frozen Foods': [
    { name: 'Frozen Peas', unit: 'kg', price: 120 },
    { name: 'Frozen Mixed Veg', unit: 'kg', price: 140 },
    { name: 'Frozen Corn', unit: 'kg', price: 100 },
  ],
  Other: [
    { name: 'Cooking Oil', unit: 'litre', price: 150 },
    { name: 'Ghee', unit: 'kg', price: 550 },
    { name: 'Vinegar', unit: 'litre', price: 60 },
    { name: 'Soya Sauce', unit: 'litre', price: 120 },
  ],
};

const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

// Simulated default delivery location from DB
const defaultDeliveryLocation = 'TekMeals Central Kitchen, Hinjewadi Phase 1, Pune';

export default function PlaceGroceryOrderModal({ open, onClose, onOrderPlaced }: PlaceGroceryOrderModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [city, setCity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(defaultDeliveryLocation);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<GroceryItem[]>([
    { id: '1', name: '', category: '', quantity: 1, unit: 'kg', unitPrice: 0 },
  ]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), name: '', category: '', quantity: 1, unit: 'kg', unitPrice: 0 }]);
  };

  const addItemAfter = (afterId: string) => {
    const idx = items.findIndex(i => i.id === afterId);
    const newItem: GroceryItem = { id: Date.now().toString(), name: '', category: '', quantity: 1, unit: 'kg', unitPrice: 0 };
    setItems(prev => [...prev.slice(0, idx + 1), newItem, ...prev.slice(idx + 1)]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<GroceryItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const handleCategorySelect = (id: string, category: string) => {
    // Reset item when category changes
    updateItem(id, { category, name: '', unitPrice: 0, unit: 'kg' });
  };

  const handleItemSelect = (id: string, name: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const found = groceryItemsByCategory[item.category]?.find(g => g.name === name);
    updateItem(id, {
      name,
      unit: found?.unit ?? 'kg',
      unitPrice: found?.price ?? 0,
    });
  };

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalItems = items.length;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const resetForm = () => {
    setCity(''); setDeliveryDate(''); setDeliveryAddress(defaultDeliveryLocation); setNotes('');
    setItems([{ id: '1', name: '', category: '', quantity: 1, unit: 'kg', unitPrice: 0 }]);
  };

  const vendor = 'TekMeals';

  const handleSubmit = async () => {
    if (!city || !deliveryDate || items.some(i => !i.name || !i.category)) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);

    if (onOrderPlaced) {
      onOrderPlaced({ vendor, city, items: totalItems, total: totalAmount });
    }

    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Place Grocery Order
            <Badge variant="secondary" className="text-xs">Groceries</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Info Banner */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/5 border border-warning/20">
            <span className="text-sm">📋</span>
            <p className="text-[11px] text-warning leading-relaxed">
              This order will be sent to <strong>Super Admin</strong> for approval. Once approved, it will be processed.
            </p>
          </div>

          {/* Vendor & Delivery Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Vendor / Supplier</Label>
                <Input value="TekMeals" disabled className="h-9 text-sm bg-muted" />
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
              <div className="space-y-1.5">
                <Label className="text-xs">Delivery Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Delivery Location</Label>
                <Input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="h-9 text-sm" />
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
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-1">
                <p className="col-span-3 text-[10px] font-medium text-muted-foreground">Category</p>
                <p className="col-span-3 text-[10px] font-medium text-muted-foreground">Item</p>
                <p className="col-span-1 text-[10px] font-medium text-muted-foreground">Qty</p>
                <p className="col-span-1 text-[10px] font-medium text-muted-foreground">Unit</p>
                <p className="col-span-2 text-[10px] font-medium text-muted-foreground">Price (₹)</p>
                <p className="col-span-2"></p>
              </div>

              {items.map(item => {
                const categoryItems = item.category ? (groceryItemsByCategory[item.category] || []) : [];
                return (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    {/* Category first */}
                    <div className="col-span-3">
                      <Select value={item.category} onValueChange={v => handleCategorySelect(item.id, v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          {groceryCategories.map(c => (
                            <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Item filtered by category */}
                    <div className="col-span-3">
                      <Select
                        value={item.name}
                        onValueChange={v => handleItemSelect(item.id, v)}
                        disabled={!item.category}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={item.category ? 'Select item' : 'Pick category first'} /></SelectTrigger>
                        <SelectContent>
                          {categoryItems.map(g => (
                            <SelectItem key={g.name} value={g.name} className="text-xs">{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })} className="h-8 text-xs text-center px-1" />
                    </div>
                    <div className="col-span-1">
                      <Select value={item.unit} onValueChange={v => updateItem(item.id, { unit: v })}>
                        <SelectTrigger className="h-8 text-xs px-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {units.map(u => (
                            <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={0} value={item.unitPrice || ''} onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })} className="h-8 text-xs" placeholder="0" />
                    </div>
                    <div className="col-span-2 flex justify-center gap-1">
                      <button
                        onClick={() => addItemAfter(item.id)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Add item below"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={cn('text-muted-foreground hover:text-destructive transition-colors', items.length === 1 && 'opacity-30 cursor-not-allowed')}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Special Notes / Instructions</Label>
            <Textarea placeholder="Quality requirements, brand preferences, storage notes..." value={notes} onChange={e => setNotes(e.target.value)} className="text-sm resize-none" rows={2} />
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vendor</span>
              <span className="font-medium">TekMeals</span>
            </div>
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
            <Button variant="outline" onClick={() => { resetForm(); onClose(); }} className="text-sm">Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="text-sm">
              {saving ? 'Submitting…' : 'Submit for Approval'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
