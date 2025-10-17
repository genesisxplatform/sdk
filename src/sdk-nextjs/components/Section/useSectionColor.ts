import { useMemo } from 'react';
import { CntrlColor } from '@cntrl-site/color';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 0)';

export const useSectionColor = (color: string | null): CntrlColor => {
   return useMemo(() => {
     return CntrlColor.parse(color ?? DEFAULT_COLOR);
   }, [color]);
};
