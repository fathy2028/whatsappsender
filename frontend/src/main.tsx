import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import ScanPage from "./pages/ScanPage.tsx";
import GroupPage from "./pages/GroupPage.tsx";
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();
import { ReactQueryDevtools } from "react-query/devtools";
import PhoneNumberPage from "./pages/PhoneNumberPage.tsx";
import BulkPhoneNumberPage from "./pages/BulkPhoneNumberPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import BulkImage from "./pages/BulkImagePage.tsx";
import BulkFile from "./pages/BulkFilePage.tsx";
import BulkVideo from "./pages/BulkVideoPage.tsx";
import BulkExcel from "./pages/BulkExcelPage.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<App />} />
      <Route path="/scan/:username" element={<ScanPage />} />
      <Route path="/group/:username" element={<GroupPage />} />
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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
