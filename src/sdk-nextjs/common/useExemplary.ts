import { useCntrlContext } from "../provider/useCntrlContext";

export const useExemplary = () => {
  const { exemplary } = useCntrlContext();
  return exemplary;
};
