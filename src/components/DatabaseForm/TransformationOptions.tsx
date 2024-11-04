import React from 'react';
import { Settings } from 'lucide-react';
import type { TransformationConfigData } from '../../utils/validation';

interface TransformationOptionsProps {
  config: TransformationConfigData;
  onChange: (updates: Partial<TransformationConfigData>) => void;
}

export function TransformationOptions({ config, onChange }: TransformationOptionsProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Transformation Options</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Batch Size</span>
            <input
              type="number"
              min="1"
              max="10000"
              value={config.batchSize}
              onChange={(e) => onChange({ batchSize: parseInt(e.target.value, 10) })}
              className="w-32 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Number of records to process in each batch (1-10,000)
          </p>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.validateData}
              onChange={(e) => onChange({ validateData: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Validate Data</span>
          </label>
          <p className="mt-1 text-sm text-gray-500 ml-6">
            Perform data integrity checks during transformation
          </p>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.preserveIds}
              onChange={(e) => onChange({ preserveIds: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Preserve IDs</span>
          </label>
          <p className="mt-1 text-sm text-gray-500 ml-6">
            Maintain original record IDs in MongoDB
          </p>
        </div>
      </div>
    </div>
  );
}