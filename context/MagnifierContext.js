import React, { createContext, useRef, useState } from 'react';

export const MagnifierContext = createContext({
  captureRef: null,
  isEnabled: false,
  setIsEnabled: () => {},
});

export function MagnifierProvider({ children }) {
  const captureRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <MagnifierContext.Provider value={{ captureRef, isEnabled, setIsEnabled }}>
      {children}
    </MagnifierContext.Provider>
  );
}


