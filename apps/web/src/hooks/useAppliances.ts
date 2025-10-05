import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appliance } from '@/types/appliance';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Transform API response to match frontend Appliance type
const transformApiAppliance = (apiAppliance: any): Appliance => ({
  ...apiAppliance,
  purchaseDate: new Date(apiAppliance.purchaseDate),
  maintenanceTasks: apiAppliance.maintenanceTasks?.map((task: any) => ({
    ...task,
    scheduledDate: new Date(task.scheduledDate),
    completedDate: task.completedDate ? new Date(task.completedDate) : undefined,
  })) || [],
  supportContacts: apiAppliance.supportContacts || [],
  linkedDocuments: apiAppliance.linkedDocuments || [],
});

export const useAppliances = () => {
  const queryClient = useQueryClient();

  // Fetch all appliances
  const {
    data: appliancesResponse,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['appliances'],
    queryFn: () => api.appliances.getAll({ limit: 100 }), // Get all appliances
    retry: 3,
    retryDelay: 1000,
  });

  const appliances = appliancesResponse?.data?.map(transformApiAppliance) || [];

  // Add appliance mutation
  const addApplianceMutation = useMutation({
    mutationFn: (appliance: Omit<Appliance, 'id' | 'supportContacts' | 'maintenanceTasks' | 'linkedDocuments'>) => 
      api.appliances.create(appliance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
      toast({
        title: 'Success',
        description: 'Appliance added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add appliance',
        variant: 'destructive',
      });
    },
  });

  // Update appliance mutation
  const updateApplianceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appliance> }) => 
      api.appliances.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
      toast({
        title: 'Success',
        description: 'Appliance updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update appliance',
        variant: 'destructive',
      });
    },
  });

  // Delete appliance mutation
  const deleteApplianceMutation = useMutation({
    mutationFn: (id: string) => api.appliances.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
      toast({
        title: 'Success',
        description: 'Appliance deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete appliance',
        variant: 'destructive',
      });
    },
  });

  const addAppliance = (appliance: Omit<Appliance, 'id' | 'supportContacts' | 'maintenanceTasks' | 'linkedDocuments'>) => {
    addApplianceMutation.mutate(appliance);
  };

  const updateAppliance = (id: string, updates: Partial<Appliance>) => {
    updateApplianceMutation.mutate({ id, updates });
  };

  const deleteAppliance = (id: string) => {
    deleteApplianceMutation.mutate(id);
  };

  const resetToSampleData = () => {
    // This functionality isn't needed with API backend
    // The backend already has seeded data
    toast({
      title: 'Info',
      description: 'Data is managed by the database. Use the backend seed command to reset data.',
    });
  };

  return {
    appliances,
    loading: loading || addApplianceMutation.isPending || updateApplianceMutation.isPending || deleteApplianceMutation.isPending,
    error,
    addAppliance,
    updateAppliance,
    deleteAppliance,
    resetToSampleData,
  };
};