import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { LearningDataProvider } from './data/LearningDataProvider';
import { ContentProvider, useContent } from './content/ContentProvider';
import './styles/global.css';

function OnlineApplication() {
  const content = useContent();
  return <LearningDataProvider defaultTextbookId={content.textbook.id}><App /></LearningDataProvider>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider><OnlineApplication /></ContentProvider>
  </StrictMode>,
);
