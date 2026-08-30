import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { LearningDataProvider } from './data/LearningDataProvider';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LearningDataProvider><App /></LearningDataProvider>
  </StrictMode>,
);
