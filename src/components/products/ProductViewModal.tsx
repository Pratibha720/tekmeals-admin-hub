import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types';

interface ProductViewModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductViewModal({ open, onClose, product }: ProductViewModalProps) {
  if (!product) return null;

  const isVeg = product.tags?.includes('veg');
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {product.image && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.city}</p>
            </div>
            <p className="text-xl font-bold text-primary shrink-0">{formatCurrency(product.price)}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={product.isAvailable ? 'default' : 'secondary'}
              className={product.isAvailable ? 'bg-success' : ''}>
              {product.isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
            <span className="text-base">{isVeg ? '🟢' : '🔴'}</span>
            <span className="text-xs text-muted-foreground">{isVeg ? 'Veg' : 'Non-Veg'}</span>
            <Badge variant="outline" className="capitalize text-xs">{product.category}</Badge>
          </div>

          {product.description && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground">{product.description}</p>
              </div>
            </>
          )}

          {product.nutritionInfo && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Nutrition Info</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Calories', value: product.nutritionInfo.calories },
                    { label: 'Protein', value: product.nutritionInfo.protein ? `${product.nutritionInfo.protein}g` : '-' },
                    { label: 'Carbs', value: product.nutritionInfo.carbs ? `${product.nutritionInfo.carbs}g` : '-' },
                    { label: 'Fat', value: product.nutritionInfo.fat ? `${product.nutritionInfo.fat}g` : '-' },
                  ].map(n => (
                    <div key={n.label} className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-bold text-foreground">{n.value}</p>
                      <p className="text-[10px] text-muted-foreground">{n.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {product.tags && product.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                <div className="flex gap-1.5 flex-wrap">
                  {product.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
