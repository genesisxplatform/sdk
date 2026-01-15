import { createContext, FC, PropsWithChildren, useState } from 'react';

type InOutTransitionContextType = {
  isStartSceneInitialized: boolean;
  setIsStartSceneInitialized: (isStartSceneInitialized: boolean) => void;
};

export const InOutTransitionContext = createContext<InOutTransitionContextType>({
  isStartSceneInitialized: false,
  setIsStartSceneInitialized: () => {}
});

export const InOutTransitionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isStartSceneInitialized, setIsStartSceneInitialized] = useState(false);
  return (
    <InOutTransitionContext.Provider value={{ isStartSceneInitialized, setIsStartSceneInitialized }}>
      {children}
    </InOutTransitionContext.Provider>
  );
};
