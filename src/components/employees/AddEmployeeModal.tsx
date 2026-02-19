import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { employeesApi } from '@/services/api';
import { City, MealType } from '@/types';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  department: z.string().optional(),
  mealTypes: z.array(z.string()).min(1, 'Select at least one meal type'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cities: City[];
}

const mealTypeOptions: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
];

export default function AddEmployeeModal({ open, onClose, onSuccess, cities }: AddEmployeeModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      mealTypes: [],
    },
  });

  const selectedMealTypes = watch('mealTypes') || [];
  const selectedCity = watch('city');

  const toggleMealType = (type: string) => {
    const current = selectedMealTypes;
    if (current.includes(type)) {
      setValue('mealTypes', current.filter((t) => t !== type));
    } else {
      setValue('mealTypes', [...current, type]);
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true);
    try {
      await employeesApi.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        department: data.department,
        mealTypes: data.mealTypes as MealType[],
      });
      toast({
        title: 'Employee Added',
        description: `${data.name} has been added successfully.`,
      });
      reset();
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add employee. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="employee@company.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label>City *</Label>
            <Select value={selectedCity} onValueChange={(value) => setValue('city', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Engineering"
              {...register('department')}
            />
          </div>

          <div className="space-y-2">
            <Label>Meal Types *</Label>
            <div className="flex flex-wrap gap-4 pt-2">
              {mealTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedMealTypes.includes(option.value)}
                    onCheckedChange={() => toggleMealType(option.value)}
                  />
                  <Label htmlFor={option.value} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.mealTypes && (
              <p className="text-sm text-destructive">{errors.mealTypes.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
