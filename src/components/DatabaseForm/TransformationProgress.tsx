import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export function TransformationProgress() {
  const { data, error } = useQuery({
    queryKey: ['transformationProgress'],
    queryFn: async () => {
      const response = await axios.get('/api/transform/status');
      return response.data;
    },
    refetchInterval: 1000,
    retry: true,
  });

  const progress = React.useMemo(() => {
    if (!data) return 0;
    const { processedRecords, totalRecords } = data;
    if (!totalRecords) return 0;
    return Math.round((processedRecords / totalRecords) * 100);
  }, [data]);

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-lg">
        Failed to fetch transformation progress
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Transforming database...</span>
        </div>
        <span>{progress}%</span>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-500">Processed Records</div>
            <div className="text-lg font-semibold text-gray-900">
              {data.processedRecords?.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-500">Processing Time</div>
            <div className="text-lg font-semibold text-gray-900">
              {((data.duration || 0) / 1000).toFixed(1)}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}