import React from 'react';
import ReactDOM from 'react-dom/client';
import Game from './src/Game';

// This file is a duplicate entry point and is not used by the Vite build process,
// which correctly uses /src/index.tsx as specified in index.html.
// It has been restored to prevent confusion.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
