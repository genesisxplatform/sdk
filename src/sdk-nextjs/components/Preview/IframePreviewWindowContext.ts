import { useContext } from 'react';
import { createContext } from 'react';

export const IframePreviewWindowContext = createContext<Window | null>(null);

export const useIframePreviewWindow = () => useContext(IframePreviewWindowContext);
