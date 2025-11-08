// utils/storage.ts
const SAVE_KEY = 'rpgGameState';

// Type guard to check for Telegram WebApp and CloudStorage availability
const isCloudStorageSupported = (): boolean => {
    try {
        // @ts-ignore
        // Cloud Storage is supported from version 6.9 of the Web App
        return window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.isVersionAtLeast('6.9');
    } catch (e) {
        return false;
    }
};

export const saveGameState = async (data: object): Promise<boolean> => {
    const dataString = JSON.stringify(data);
    if (isCloudStorageSupported()) {
        return new Promise((resolve) => {
            // @ts-ignore
            window.Telegram.WebApp.CloudStorage.setItem(SAVE_KEY, dataString, (err, success) => {
                if (err) {
                    // This case should be rare now with the version check, but kept as a fallback
                    console.error("Telegram Cloud save failed, falling back to localStorage.", err);
                    try {
                        localStorage.setItem(SAVE_KEY, dataString);
                        resolve(true);
                    } catch (localErr) {
                        console.error("LocalStorage save failed:", localErr);
                        resolve(false);
                    }
                } else {
                    resolve(success || false);
                }
            });
        });
    } else {
        try {
            localStorage.setItem(SAVE_KEY, dataString);
            return Promise.resolve(true);
        } catch (e) {
            console.error("LocalStorage save failed:", e);
            return Promise.resolve(false);
        }
    }
};

export const loadGameState = async (): Promise<any | null> => {
    // Helper to load from localStorage
    const loadFromLocal = () => {
        try {
            const value = localStorage.getItem(SAVE_KEY);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error("Failed to load or parse from localStorage:", e);
            return null;
        }
    };
    
    if (isCloudStorageSupported()) {
        return new Promise((resolve) => {
            // @ts-ignore
            window.Telegram.WebApp.CloudStorage.getItem(SAVE_KEY, (err, value) => {
                if (err || !value) {
                    if (err) console.error("Telegram Cloud load failed, falling back to localStorage.", err);
                    // Fallback to localStorage if cloud fails or has no value
                    resolve(loadFromLocal());
                } else {
                    try {
                        resolve(JSON.parse(value));
                    } catch (e) {
                        console.error("Failed to parse cloud data, falling back to localStorage:", e);
                        resolve(loadFromLocal());
                    }
                }
            });
        });
    } else {
        return Promise.resolve(loadFromLocal());
    }
};

export const checkSaveExists = async (): Promise<boolean> => {
    const localExists = localStorage.getItem(SAVE_KEY) !== null;
    if (isCloudStorageSupported()) {
        return new Promise((resolve) => {
            // @ts-ignore
            window.Telegram.WebApp.CloudStorage.getKeys((err, keys) => {
                if (err) {
                    console.error('Telegram Cloud getKeys failed, checking localStorage.', err);
                    resolve(localExists);
                } else {
                    const cloudExists = keys && keys.includes(SAVE_KEY);
                    resolve(cloudExists || localExists);
                }
            });
        });
    } else {
        return Promise.resolve(localExists);
    }
};

export const clearSave = async (): Promise<boolean> => {
    if (isCloudStorageSupported()) {
        await new Promise<void>((resolve) => {
            // @ts-ignore
            window.Telegram.WebApp.CloudStorage.removeItem(SAVE_KEY, (err, success) => {
                 if (err) {
                    console.error('Failed to remove from Telegram Cloud:', err);
                 }
                 resolve(); // Always resolve to proceed with local storage clearing
            });
        });
    }
    
    try {
        localStorage.removeItem(SAVE_KEY);
        return true;
    } catch(e) {
        console.error("Failed to remove from localStorage:", e);
        return false;
    }
};