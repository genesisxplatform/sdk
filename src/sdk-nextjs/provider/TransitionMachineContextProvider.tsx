import { FC, PropsWithChildren } from 'react';
import { TransitionMachineContext } from './TransitionMachineContext';
import { Relation } from '../../sdk/types/project/Relation';
import { useIframePreviewWindow } from '../components/Preview/IframePreviewWindowContext';

interface Props {
  startScene: string;
  relations: Relation[];
  scenes: { id: string }[];
}

export const TransitionMachineContextProvider: FC<PropsWithChildren<Props>> = ({ children, startScene, relations, scenes }) => {
  const iframePreviewWindow = useIframePreviewWindow();
  return (
    <TransitionMachineContext.Provider
    options={{
      input: {
        startScene,
        relations,
        scenes,
        previewWindow: iframePreviewWindow,
      }
    }}
  >
      {children}
    </TransitionMachineContext.Provider>
  );
};
