import * as React from 'react';

type Props = {
  children?: React.ReactNode;
};

const useSSREffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export const NoSsr = ({ children }: Props) => {
  const [mounted, setMounted] = React.useState(false);
  useSSREffect(() => {
    setMounted(true);
  }, []);
  return <>{mounted && children}</>;
};

export default NoSsr;
