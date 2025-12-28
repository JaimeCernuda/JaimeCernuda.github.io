import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [cache, setCache] = useState({
        blog: null,
        projects: null,
        publications: null,
        home: null,
        cv: null
    });

    const updateCache = (key, data) => {
        setCache(prev => ({
            ...prev,
            [key]: data
        }));
    };

    return (
        <DataContext.Provider value={{ cache, updateCache }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
