import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components'
import Layout from './Layout';
import theme from './theme';
import fetch from 'sync-fetch'

const API = 'http://api.dexera.online';
// const API = "http://localhost:3001";

const ctg = fetch(API + "/catergory").json()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/s/?path=.%2Fdocs%2FHome" replace />
  },
  {
    path: "/s",
    element: <Layout ctg={ctg} api={API} />
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
