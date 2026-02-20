import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';

interface ProductEditModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

export default function ProductEditModal({ open, onClose, product, onSave }: ProductEditModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    vegNonVeg: 'veg',
    isAvailable: true,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: String(product.price),
        vegNonVeg: product.tags?.includes('veg') ? 'veg' : 'non-veg',
        isAvailable: product.isAvailable,
      });
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const updated: Product = {
      ...product,
      name: form.name,
      description: form.description || undefined,
      category: form.category as Product['category'],
      price: Number(form.price),
      isAvailable: form.isAvailable,
      tags: [form.vegNonVeg, ...(product.tags?.filter(t => t !== 'veg' && t !== 'non-veg') || [])],
      updatedAt: new Date().toISOString(),
    };
    setLoading(false);
    onSave(updated);
    toast({ title: 'Product updated successfully!' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Product Name <span className="text-destructive">*</span></Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Category <span className="text-destructive">*</span></Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Price (₹) <span className="text-destructive">*</span></Label>
            <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Veg / Non-Veg</Label>
            <div className="flex gap-2">
              <Button type="button" variant={form.vegNonVeg === 'veg' ? 'default' : 'outline'} size="sm"
                onClick={() => setForm({ ...form, vegNonVeg: 'veg' })}
                className={form.vegNonVeg === 'veg' ? 'bg-success hover:bg-success/90' : ''}>
                🟢 Veg
              </Button>
              <Button type="button" variant={form.vegNonVeg === 'non-veg' ? 'default' : 'outline'} size="sm"
                onClick={() => setForm({ ...form, vegNonVeg: 'non-veg' })}
                className={form.vegNonVeg === 'non-veg' ? 'bg-destructive hover:bg-destructive/90' : ''}>
                🔴 Non-Veg
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Available</Label>
            <Switch checked={form.isAvailable} onCheckedChange={v => setForm({ ...form, isAvailable: v })} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
