import { createContext, useEffect, useRef, useState } from 'react';

export const TreeViewControllerPortal = createContext<HTMLDivElement | null>(
  null,
);

export function useTreeViewControl() {
  const treeViewControlRef = useRef<HTMLDivElement>(null);
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    setPortal(treeViewControlRef.current);
  });

  return { treeViewControlRef, portal };
}
