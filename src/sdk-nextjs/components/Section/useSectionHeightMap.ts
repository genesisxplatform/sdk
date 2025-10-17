import { useContext } from 'react';
import { CntrlContext } from '../../provider/CntrlContext';
import { getSectionHeight } from './Section';

export const useSectionHeightData = (sectionId: string): string=> {
  const sectionHeightContext = useContext(CntrlContext);
  const sectionHeightData = sectionHeightContext.getSectionHeightData(sectionId);
  return sectionHeightData ? getSectionHeight(sectionHeightData) : '0';
};

