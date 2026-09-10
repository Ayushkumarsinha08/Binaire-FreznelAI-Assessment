import { useContext } from 'react';
import { ModelContext, ModelContextType } from '../context/ModelContext';

export function useModels(): ModelContextType {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModels must be used within a ModelProvider');
  }
  return context;
}
