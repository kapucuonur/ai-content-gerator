import React, { useState } from 'react';
import './index.css';
import GeneratorForm from './components/GeneratorForm';
import ResultDisplay from './components/ResultDisplay';
import { generateContent } from './services/aiService';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setContent(''); // Clear previous result
    try {
      const result = await generateContent(formData);
      setContent(result);
    } catch (error) {
      console.error('Error generating content:', error);
      setContent(`⚠️ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1
          className="gradient-text"
          style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}
        >
          AI Content Gen
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
          Create premium content in seconds with the power of AI.
        </p>
      </header>

      <main>
        <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
        <ResultDisplay content={content} />
      </main>
    </div>
  );
}

export default App;
