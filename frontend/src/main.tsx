import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";

import theme from "./theme.ts";
import App from "./App.tsx";
import ScanPage from "./pages/ScanPage.tsx";
import GroupPage from "./pages/GroupPage.tsx";
import ContactsPage from "./pages/ContactsPage.tsx";
import PhoneNumberPage from "./pages/PhoneNumberPage.tsx";
import BulkPhoneNumberPage from "./pages/BulkPhoneNumberPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import BulkImage from "./pages/BulkImagePage.tsx";
import BulkFile from "./pages/BulkFilePage.tsx";
import BulkVideo from "./pages/BulkVideoPage.tsx";
import BulkExcel from "./pages/BulkExcelPage.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<App />} />
      <Route path="/scan/:username" element={<ScanPage />} />
      <Route path="/group/:username" element={<GroupPage />} />
      <Route path="/contacts/:username" element={<ContactsPage />} />
      <Route path="/phone/:username" element={<PhoneNumberPage />} />
      <Route path="/bulk/:username" element={<BulkPhoneNumberPage />} />
      <Route path="/bulkimage/:username" element={<BulkImage />} />
      <Route path="/bulkfile/:username" element={<BulkFile />} />
      <Route path="/bulkvideo/:username" element={<BulkVideo />} />
      <Route path="/bulkexcel/:username" element={<BulkExcel />} />
      <Route path="/dashboard/:username" element={<DashboardPage />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer
          position="bottom-right"
          autoClose={3200}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
