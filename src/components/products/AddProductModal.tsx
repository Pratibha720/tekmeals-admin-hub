import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Product, City, Kitchen } from '@/types';
import { Upload, X } from 'lucide-react';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
  cities: City[];
  kitchens: Kitchen[];
}

export default function AddProductModal({ open, onClose, onSuccess, cities, kitchens }: AddProductModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);

  const [form, setForm] = useState({
    name: '',
    isMeal: 'no',
    description: '',
    category: '',
    subCategory: '',
    restaurant: '',
    vegNonVeg: 'veg',
    costPrice: '',
    sellingPrice: '',
    status: 'active',
  });

  const subCategories: Record<string, string[]> = {
    breakfast: ['South Indian', 'North Indian', 'Continental', 'Beverages'],
    lunch: ['Thali', 'Rice', 'Curry', 'Combo'],
    dinner: ['Thali', 'Rice', 'Curry', 'Combo'],
    snacks: ['Fried', 'Baked', 'Healthy', 'Quick Bites'],
    beverages: ['Hot', 'Cold', 'Juice', 'Smoothie'],
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.subCategory || !form.restaurant || !form.costPrice || !form.sellingPrice) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const newProduct: Product = {
      id: `p${Date.now()}`,
      name: form.name,
      description: form.description || undefined,
      category: form.category as Product['category'],
      price: Number(form.sellingPrice),
      image: imagePreview || undefined,
      city: cities.find(c => kitchens.find(k => k.id === form.restaurant)?.city === c.name)?.name || 'Mumbai',
      kitchenId: form.restaurant,
      kitchenName: kitchens.find(k => k.id === form.restaurant)?.name || 'Kitchen',
      isAvailable: form.status === 'active',
      tags: [form.vegNonVeg, form.category],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLoading(false);
    onSuccess(newProduct);
    toast({ title: 'Product added successfully!' });
    resetForm();
  };

  const resetForm = () => {
    setForm({ name: '', isMeal: 'no', description: '', category: '', subCategory: '', restaurant: '', vegNonVeg: 'veg', costPrice: '', sellingPrice: '', status: 'active' });
    setImagePreview(null);
    setShowDescription(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); resetForm(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Product Name <span className="text-destructive">*</span></Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
          </div>

          <div className="space-y-2">
            <Label>Is this a Meal?</Label>
            <Select value={form.isMeal} onValueChange={v => setForm({ ...form, isMeal: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!showDescription ? (
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setShowDescription(true)}>
              + Add Description
            </Button>
          ) : (
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description" rows={3} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v, subCategory: '' })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
              <Label>Sub Category <span className="text-destructive">*</span></Label>
              <Select value={form.subCategory} onValueChange={v => setForm({ ...form, subCategory: v })} disabled={!form.category}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {(subCategories[form.category] || []).map(sc => (
                    <SelectItem key={sc} value={sc.toLowerCase()}>{sc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Restaurant / Kitchen <span className="text-destructive">*</span></Label>
            <Select value={form.restaurant} onValueChange={v => setForm({ ...form, restaurant: v })}>
              <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
              <SelectContent>
                {kitchens.map(k => (
                  <SelectItem key={k.id} value={k.id}>{k.name} ({k.city})</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cost Price <span className="text-destructive">*</span></Label>
              <Input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} placeholder="₹0" />
            </div>
            <div className="space-y-2">
              <Label>Selling Price <span className="text-destructive">*</span></Label>
              <Input type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} placeholder="₹0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { onClose(); resetForm(); }}>Close</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
