import { useEffect } from 'react';
import { TransitionMachineContext } from '../../provider/TransitionMachineContext';
import { useIframePreviewWindow } from './IframePreviewWindowContext';

export const PreviewListener = () => {
  const actorRef = TransitionMachineContext.useActorRef();
  const { isActive } = TransitionMachineContext.useSelector((state) => ({
    isActive: state.matches('active'),
   }));
  const iframePreviewWindow = useIframePreviewWindow();

  useEffect(() => {
    if (!iframePreviewWindow) return;
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "TRANSITION_TRIGGER") {
        const { direction, to, transitionType } = e.data;
        actorRef.send({
          type: 'TRANSITION_TRIGGER',
          transition: transitionType,
          to,
          direction
        });
      }
    };
    iframePreviewWindow.addEventListener("message", handleMessage);
    return () => {
      if (iframePreviewWindow) {
        iframePreviewWindow.removeEventListener("message", handleMessage);
      }
    };
  }, [iframePreviewWindow]);

  useEffect(() => {
    if (isActive && actorRef && iframePreviewWindow) {
      const { context } = actorRef.getSnapshot();
      const { scenes } = context;
      const [activeScene] = scenes;
      iframePreviewWindow.parent.postMessage(
        {
          type: "ACTIVE_SCENE_CHANGE",
          activeScene: activeScene.id,
        },
        "*"
      );
    }
  }, [isActive, actorRef, iframePreviewWindow]);

  return null;
};
