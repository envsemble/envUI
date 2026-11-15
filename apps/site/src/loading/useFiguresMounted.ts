import { createContext, use } from 'react';

export const FiguresMounted = createContext(false);

export const useFiguresMounted = () => use(FiguresMounted);
