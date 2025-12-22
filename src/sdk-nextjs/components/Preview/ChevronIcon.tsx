export const ChevronIcon = ({ className }: { className?: string }) => {
  return (
    <svg width="44px" height="44px" viewBox="0 0 44 44" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <defs>
          <circle id="path-1" cx="21.5" cy="21.5" r="21"></circle>
      </defs>
      <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="arrow">
              <g id="Oval" opacity="0.2">
                  <use fill="#000000" xlinkHref="#path-1"></use>
                  <use fill="#64686A" xlinkHref="#path-1"></use>
              </g>
              <polyline id="Path" stroke="#FFFFFF" stroke-width="2" points="20 16.5 25 21.5 20 26.5"></polyline>
          </g>
      </g>
  </svg>
  );
};
