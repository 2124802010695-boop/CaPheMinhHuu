import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
    const [mode, setMode] = useState(
        () => localStorage.getItem('themeMode') || 'light'
    );

    const toggleMode = () => {
        setMode(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', next);
            return next;
        });
    };

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light' ? {
                primary: { main: '#6f4e37' },
                background: {
                    default: '#f4f6f8',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#1a1a2e',
                    secondary: '#6b7280',
                },
            } : {
                primary: { main: '#d19c5a' },
                background: {
                    default: '#0a0c10',
                    paper: '#111318',
                },
                text: {
                    primary: '#f0f2f7',
                    secondary: '#6b7280',
                },
            }),
        },
        typography: {
            fontFamily: "'Inter', sans-serif",
        },
        components: {
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'dark' ? '#111318' : '#ffffff',
                        borderRight: `1px solid ${mode === 'dark' ? '#ffffff0f' : '#e5e7eb'}`,
                    }
                }
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#111318' : '#ffffff',
                        color: mode === 'dark' ? '#f0f2f7' : '#1a1a2e',
                        boxShadow: mode === 'dark'
                            ? '0 1px 0 #ffffff0f'
                            : '0 1px 0 #e5e7eb',
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#111318' : '#ffffff',
                        border: `1px solid ${mode === 'dark' ? '#ffffff0f' : '#e5e7eb'}`,
                        boxShadow: 'none',
                        borderRadius: 12,
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    }
                }
            },
        },
        shape: { borderRadius: 10 },
    }), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleMode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}