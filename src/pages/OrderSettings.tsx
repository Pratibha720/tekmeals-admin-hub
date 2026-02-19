import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, CalendarDays, ShoppingCart, Utensils } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

interface MealSelection {
  id: string;
  cuisine: string;
  name: string;
  enabled: boolean;
  items: string[];
  quantity: number;
  type: 'breakfast' | 'lunch' | 'dinner';
  vegNonVeg: 'veg' | 'non-veg';
}

const cuisineMenuItems: Record<string, string[]> = {
  chinese: ['Fried Rice', 'Noodles', 'Manchurian', 'Spring Rolls', 'Soup', 'Momos'],
  indian: ['Dal Makhani', 'Paneer Butter Masala', 'Roti', 'Rice', 'Raita', 'Biryani', 'Chole Bhature'],
  meal: ['Thali Veg', 'Thali Non-Veg', 'Mini Meal', 'Executive Meal', 'Diet Meal'],
};

const defaultMeals: Record<string, MealSelection[]> = {
  chinese: [
    { id: 'ch-veg', cuisine: 'chinese', name: 'Chinese Veg Meal', enabled: false, items: [], quantity: 0, type: 'lunch', vegNonVeg: 'veg' },
    { id: 'ch-nv', cuisine: 'chinese', name: 'Chinese Non-Veg Meal', enabled: false, items: [], quantity: 0, type: 'lunch', vegNonVeg: 'non-veg' },
  ],
  indian: [
    { id: 'in-veg', cuisine: 'indian', name: 'Indian Veg Meal', enabled: false, items: [], quantity: 0, type: 'lunch', vegNonVeg: 'veg' },
    { id: 'in-nv', cuisine: 'indian', name: 'Indian Non-Veg Meal', enabled: false, items: [], quantity: 0, type: 'dinner', vegNonVeg: 'non-veg' },
  ],
  meal: [
    { id: 'ml-std', cuisine: 'meal', name: 'Standard Meal', enabled: false, items: [], quantity: 0, type: 'lunch', vegNonVeg: 'veg' },
    { id: 'ml-prem', cuisine: 'meal', name: 'Premium Meal', enabled: false, items: [], quantity: 0, type: 'lunch', vegNonVeg: 'veg' },
  ],
};

const kitchenMapping: Record<string, { kitchen: string; restaurant: string }> = {
  chinese: { kitchen: 'Dragon Kitchen', restaurant: 'China Bowl' },
  indian: { kitchen: 'Spice Garden', restaurant: 'Desi Flavors' },
  meal: { kitchen: 'Paradise Kitchen', restaurant: 'Meal Box' },
};

const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

export default function OrderSettings() {
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Record<string, MealSelection[]>>(JSON.parse(JSON.stringify(defaultMeals)));
  const [saving, setSaving] = useState(false);

  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const toggleMeal = (cuisine: string, mealId: string) => {
    setMeals(prev => ({
      ...prev,
      [cuisine]: prev[cuisine].map(m =>
        m.id === mealId ? { ...m, enabled: !m.enabled, quantity: !m.enabled ? m.quantity : 0 } : m
      ),
    }));
  };

  const updateMeal = (cuisine: string, mealId: string, field: Partial<MealSelection>) => {
    setMeals(prev => ({
      ...prev,
      [cuisine]: prev[cuisine].map(m => (m.id === mealId ? { ...m, ...field } : m)),
    }));
  };

  const selectedMeals = Object.values(meals).flat().filter(m => m.enabled);
  const totalQuantity = selectedMeals.reduce((s, m) => s + m.quantity, 0);
  const estimatedCost = totalQuantity * 180; // avg cost

  const handleConfirm = async () => {
    if (selectedMeals.length === 0) {
      toast({ title: 'No meals selected', description: 'Please select at least one meal.', variant: 'destructive' });
      return;
    }
    if (selectedMeals.some(m => m.quantity <= 0)) {
      toast({ title: 'Invalid quantity', description: 'All selected meals must have quantity > 0.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    toast({
      title: 'Order Confirmed!',
      description: `${selectedMeals.length} meal(s) scheduled for ${format(selectedDate, 'dd MMM yyyy')}. Kitchen & Super Admin notified.`,
    });
    setMeals(JSON.parse(JSON.stringify(defaultMeals)));
  };

  return (
    <div className="space-y-6">
      {/* Location & Date Selector */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">City</p>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Select Date</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekStart(addDays(weekStart, -7))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekStart(addDays(weekStart, 7))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {weekDates.map(date => {
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center min-w-[80px] px-3 py-2 rounded-lg border transition-all ${
                        isSelected ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted border-border'
                      }`}
                    >
                      <span className="text-xs font-medium">{format(date, 'EEE')}</span>
                      <span className="text-lg font-bold">{format(date, 'dd')}</span>
                      <span className="text-xs">{format(date, 'MMM')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cuisine Accordion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Meal Selection for {format(selectedDate, 'EEEE, dd MMM yyyy')}
          </CardTitle>
          <CardDescription>Select cuisine, meals, items, and quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {Object.entries(meals).map(([cuisine, cuisineMeals]) => (
              <AccordionItem key={cuisine} value={cuisine} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="capitalize font-semibold">{cuisine === 'meal' ? '🍱 Custom Meal' : cuisine === 'chinese' ? '🥡 Chinese' : '🍛 Indian'}</span>
                    {cuisineMeals.some(m => m.enabled) && (
                      <Badge variant="secondary" className="text-xs">
                        {cuisineMeals.filter(m => m.enabled).length} selected
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {cuisineMeals.map(meal => (
                    <div key={meal.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={meal.enabled} onCheckedChange={() => toggleMeal(cuisine, meal.id)} />
                        <span className="font-medium">{meal.name}</span>
                        <Badge variant={meal.vegNonVeg === 'veg' ? 'secondary' : 'destructive'} className="text-xs">
                          {meal.vegNonVeg === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                        </Badge>
                      </div>
                      {meal.enabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-7">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Items</p>
                            <Select
                              value={meal.items[0] || ''}
                              onValueChange={v => updateMeal(cuisine, meal.id, { items: [v] })}
                            >
                              <SelectTrigger className="h-9"><SelectValue placeholder="Select items" /></SelectTrigger>
                              <SelectContent>
                                {cuisineMenuItems[cuisine]?.map(item => (
                                  <SelectItem key={item} value={item}>{item}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Quantity</p>
                            <Input
                              type="number"
                              min={1}
                              className="h-9"
                              value={meal.quantity || ''}
                              onChange={e => updateMeal(cuisine, meal.id, { quantity: Number(e.target.value) })}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Meal Type</p>
                            <Select value={meal.type} onValueChange={v => updateMeal(cuisine, meal.id, { type: v as MealSelection['type'] })}>
                              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="breakfast">Breakfast</SelectItem>
                                <SelectItem value="lunch">Lunch</SelectItem>
                                <SelectItem value="dinner">Dinner</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {selectedMeals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No meals selected</p>
              <p className="text-sm">Expand a cuisine section and select meals to schedule</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      {selectedMeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Selected Date</p>
                <p className="font-medium">{format(selectedDate, 'dd MMM yyyy (EEEE)')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{selectedCity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quantity</p>
                <p className="font-medium">{totalQuantity}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              {selectedMeals.map(meal => (
                <div key={meal.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={meal.vegNonVeg === 'veg' ? 'secondary' : 'destructive'} className="text-xs h-5">
                      {meal.vegNonVeg === 'veg' ? '🟢' : '🔴'}
                    </Badge>
                    <span>{meal.name}</span>
                    <span className="text-muted-foreground">× {meal.quantity}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {kitchenMapping[meal.cuisine]?.kitchen} / {kitchenMapping[meal.cuisine]?.restaurant}
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <span>Estimated Total Cost</span>
              <span className="text-lg text-primary">₹{estimatedCost.toLocaleString('en-IN')}</span>
            </div>
            <Button className="w-full" onClick={handleConfirm} disabled={saving}>
              {saving ? 'Confirming Order...' : 'Confirm Order'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
