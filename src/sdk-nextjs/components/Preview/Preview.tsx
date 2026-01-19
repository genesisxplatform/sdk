import { FC, PropsWithChildren, useEffect, useState, createContext, useContext, useId } from 'react';
import { Relation } from '../../../sdk/types/project/Relation';
import { createRoot } from 'react-dom/client';
import { findRelation } from '../../../sdk/transitions/utils/findRelation';
import { getAvailableTransitions } from '../../../sdk/transitions/utils/getAvailableTransitions';
import JSXStyle from 'styled-jsx/style';
import { ChevronIcon } from './ChevronIcon';
import { IframePreviewWindowContext } from './IframePreviewWindowContext';

interface Props {
  relations: Relation[];
  startScene: string;
}

export const Preview: FC<PropsWithChildren<Props>> = ({ children, relations, startScene }) => {
  const id = useId();
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeScene, setActiveScene] = useState<string>(startScene);
  const [activeSides, setActiveSides] = useState<{ north: boolean; south: boolean; east: boolean; west: boolean }>(getAvailableTransitions(startScene, relations));
  const handleSwipeToScene = (direction: 'north' | 'south' | 'east' | 'west') => {
    if (!iframeRef || !iframeRef.contentWindow || !iframeRef.contentDocument) return;
    setIsTransitioning(true);
    const transition = findRelation(relations, activeScene, direction);
    const targetWindow = iframeRef.contentWindow;
    const message = {
      type: "TRANSITION_TRIGGER",
      direction,
      to: transition.to,
      transitionType: transition.type,
    };
    targetWindow.postMessage(message, "*");
  }
  useEffect(() => {
    if (!iframeRef) return;
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "ACTIVE_SCENE_CHANGE") {
        const activeScene = e.data.activeScene;
        if (activeScene) {
          const availableTransitions = getAvailableTransitions(activeScene, relations);
          setActiveSides(availableTransitions);
          setActiveScene(activeScene);
          setIsTransitioning(false);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [iframeRef, relations]);

  useEffect(() => {
    if (!iframeRef) return;
    const iframeDocument = iframeRef.contentDocument;
    if (!iframeDocument) return;
    const iframeWindow = iframeRef.contentWindow;
    if (!iframeWindow) return;
    const iframeHead = iframeDocument.head;
    if (!iframeHead) return;

    const copyStyleNode = (node: Node) => {
      if (node instanceof HTMLStyleElement) {
        const cloned = node.cloneNode(true) as HTMLStyleElement;
        iframeHead.appendChild(cloned);
      } else if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
        const cloned = node.cloneNode(true) as HTMLLinkElement;
        iframeHead.appendChild(cloned);
      }
    };

    const copyAllStyles = () => {
      const style = iframeDocument.createElement("style");
      style.innerHTML = `
        html, body {
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
        }
      `;
      iframeHead.appendChild(style);
      const parentHead = document.head;
      if (!parentHead) return;
      Array.from(parentHead.querySelectorAll('style, link[rel="stylesheet"]')).forEach((node) => {
        const href = node instanceof HTMLLinkElement ? node.href : null;
        const existing = href 
          ? iframeHead.querySelector(`link[href="${href}"]`)
          : null;
        if (!existing) {
          copyStyleNode(node);
        }
      });
    };

    copyAllStyles();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            (node instanceof HTMLStyleElement) ||
            (node instanceof HTMLLinkElement && node.rel === 'stylesheet')
          ) {
            copyStyleNode(node);
          }
        });
      });
    });
    observer.observe(document.head, {
      childList: true,
      subtree: true,
    });

    const mountNode = iframeDocument.createElement('div');
    mountNode.id = 'react-root';
    iframeDocument.body!.appendChild(mountNode);
    
    const root = createRoot(mountNode);
    root.render(
      <IframePreviewWindowContext.Provider value={iframeWindow}>
        {children}
      </IframePreviewWindowContext.Provider>
    );
    return () => {
      observer.disconnect();
    };
  }, [iframeRef, children]);

  return (
    <>
      <div
        className="preview-wrapper"
      >
        <div className="preview-inner"> 
        {Object.entries(activeSides).map(([direction, isActive]) => (
          isActive ? (
            <button
             key={direction}
              onClick={() => handleSwipeToScene(direction as 'north' | 'south' | 'east' | 'west')}
              disabled={isTransitioning}
              className={`chevron-button chevron-button-${direction}`}
            >
              <ChevronIcon className="chevron-icon" />
            </button>
          ) : null
        ))}
        <iframe className="iframe-preview" ref={setIframeRef} style={{  }} />
        </div>
      </div>
      <JSXStyle id={id}>{`
          .preview-wrapper {
            width: 100%;
            height: 100%;
            position: relative;
            padding: 66px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #000000;
          }
          .preview-inner {
            width: 100%;
            max-height: 844px;
            height: 100%;
            position: relative;
            display: flex;
            width: 390px;
            align-items: center;
            justify-content: center;
          }
          .iframe-preview {
            width: 390px;
            max-height: 700px;
            height: 100%;
            border: none;
            z-index: 1000;
            background-color: #FFFFFF;
          }
          .chevron-icon {
            width: 44px;
            height: 44px;
          }
          .chevron-button {
            border: none;
            background: none;
            padding: 0;
            margin: 0;
            cursor: pointer;
            position: absolute;
          }
          .chevron-button-north {
            top: 0;
            left: 50%;
            transform: translate(-50%, -125%) rotate(-90deg);
          }
          .chevron-button-south {
            bottom: 0;
            left: 50%;
            transform: translate(-50%, 125%) rotate(90deg);
          }
          .chevron-button-east {
            right: 0;
            top: 50%;
            transform: translate(125%, -50%);
          }
          .chevron-button-west {
            left: 0;
            top: 50%;
            transform: translate(-125%, -50%) rotate(180deg);
          }
        `}
      </JSXStyle>
    </>
  );
};
