import { BreakPoint, BREAKPOINT } from '@angular/flex-layout';

const PRINT_BREAKPOINTS = [{
  alias: 'sm',
  suffix: 'sm',
  mediaQuery: 'screen and (min-width: 640px)',
  overlapping: false,
  priority: 1001 // Needed if overriding the default print breakpoint
}];

export const CustomBreakPointsProvider = {
  provide: BREAKPOINT,
  // useValue: PRINT_BREAKPOINTS,
  useFactory: customizeBreakPoints,
  multi: true
};
export function customizeBreakPoints(): BreakPoint[] {

  const customBreakPoints = [ // config same tailwind without 2xl
    {
      alias: 'sm',
      mediaQuery: 'screen and (min-width: 640px)',
      priority: -900,
    },
    {
      alias: 'md',
      mediaQuery: 'screen and (min-width: 768px)',
      priority: -800,
    },
    {
      alias: 'lg',
      mediaQuery: 'screen and (min-width: 1024px)',
      priority: -700,
    },
    {
      alias: 'xl',
      mediaQuery: 'screen and (min-width: 1440px)',
      priority: -600,
    }
  ];
  return customBreakPoints;
}


// tailwind
//  'sm': '640px',    // => @media (min-width: 640px) { ... }
//  'md': '768px',    // => @media (min-width: 768px) { ... }
//  'lg': '1024px',   // => @media (min-width: 1024px) { ... }
//  'xl': '1280px',   // => @media (min-width: 1280px) { ... }
//  '2xl': '1536px',  // => @media (min-width: 1536px) { ... } --> 1440px


// flex-layout
// xs	'screen and (max-width: 599px)'
// sm	'screen and (min-width: 600px) and (max-width: 959px)'
// md	'screen and (min-width: 960px) and (max-width: 1279px)'
// lg	'screen and (min-width: 1280px) and (max-width: 1919px)'
// xl	'screen and (min-width: 1920px) and (max-width: 5000px)'
// lt - sm	'screen and (max-width: 599px)'
// lt - md	'screen and (max-width: 959px)'
// lt - lg	'screen and (max-width: 1279px)'
// lt - xl	'screen and (max-width: 1919px)'
// gt - xs	'screen and (min-width: 600px)'
// gt - sm	'screen and (min-width: 960px)'
// gt - md	'screen and (min-width: 1280px)'
// gt - lg	'screen and (min-width: 1920px)'