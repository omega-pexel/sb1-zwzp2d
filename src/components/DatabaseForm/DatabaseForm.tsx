import React from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import { FormInput } from './FormInput';
import { TransformationProgress } from './TransformationProgress';
import { TransformationOptions } from './TransformationOptions';
import { databaseFormSchema, transformationConfigSchema } from '../../utils/validation';
import type { DatabaseFormData, TransformationConfigData } from '../../utils/validation';

export function DatabaseForm() {
  const [formData, setFormData] = React.useState<DatabaseFormData>({
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: '',
    database: ''
  });

  const [config, setConfig] = React.useState<TransformationConfigData>({
    batchSize: 1000,
    validateData: true,
    preserveIds: true
  });

  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const transformMutation = useMutation({
    mutationFn: async (data: { form: DatabaseFormData; config: TransformationConfigData }) => {
      try {
        const validatedForm = databaseFormSchema.parse(data.form);
        const validatedConfig = transformationConfigSchema.parse(data.config);
        
        const response = await axios.post('/api/transform', {
          ...validatedForm,
          config: validatedConfig
        });
        
        return response.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors.reduce((acc, curr) => ({
            ...acc,
            [curr.path[0]]: curr.message,
          }), {});
          setValidationErrors(errors);
          throw new Error('Validation failed');
        }
        throw error;
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setValidationErrors({
          api: error.response?.data?.message || 'An unexpected error occurred'
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    transformMutation.mutate({ form: formData, config });
  };

  const handleInputChange = (field: keyof DatabaseFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleConfigChange = (updates: Partial<TransformationConfigData>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <FormInput
          label="Host"
          value={formData.host}
          onChange={handleInputChange('host')}
          placeholder="localhost"
          error={validationErrors.host}
        />
        <FormInput
          label="Port"
          value={formData.port}
          onChange={handleInputChange('port')}
          placeholder="3306"
          type="number"
          error={validationErrors.port}
        />
        <FormInput
          label="Username"
          value={formData.username}
          onChange={handleInputChange('username')}
          placeholder="root"
          error={validationErrors.username}
        />
        <FormInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={validationErrors.password}
        />
        <div className="md:col-span-2">
          <FormInput
            label="Database Name"
            value={formData.database}
            onChange={handleInputChange('database')}
            placeholder="mydb"
            error={validationErrors.database}
          />
        </div>
      </div>

      <TransformationOptions
        config={config}
        onChange={handleConfigChange}
      />

      {(transformMutation.isError || validationErrors.api) && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{validationErrors.api || 'An error occurred while processing your request'}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={transformMutation.isPending}
        className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="h-5 w-5" />
        <span>{transformMutation.isPending ? 'Processing...' : 'Start Transformation'}</span>
      </button>

      {transformMutation.isPending && (
        <TransformationProgress />
      )}
    </form>
  );
}