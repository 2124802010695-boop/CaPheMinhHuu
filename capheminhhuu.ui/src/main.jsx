import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'; // Quan trọng: Nhập Router
import { CssBaseline } from '@mui/material'; // Quan trọng: Reset CSS
import './index.css' //
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />   {/* <--- QUAN TRỌNG: Không được bọc BrowserRouter ở đây nữa */}
  </React.StrictMode>,
)
