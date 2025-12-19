import { useEffect } from 'react';



export const Test = ({ iframeWindow }: { iframeWindow?: Window }) => {
  useEffect(() => {
    if (!iframeWindow) return;
    const handleMessage = (e: MessageEvent) => {
      console.log('Received message:', e.data);
      if (e.data?.type === "SWIPE") {
        console.log('Received SWIPE message:', e.data);
      }
    };
    iframeWindow.addEventListener("message", handleMessage);
    return () => {
      iframeWindow.removeEventListener("message", handleMessage);
    };
  }, [iframeWindow]);

  const sendToParent = (data: any) => {
    if (!iframeWindow) return;
    iframeWindow.parent.postMessage(
      {
        type: "PREVIEW_EVENT",
        payload: data,
      },
      "*"
    );
  };
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'red' }}>
      <h1>Test</h1>
      but
    </div>
  );
};