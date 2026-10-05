import { createBrowserRouter } from "react-router-dom";
import { RequireAuth, RequireRole } from "./auth/guards";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import UsersPage from "./pages/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";
import AddProductPage from "./pages/AddProductPage";
import AddCategoryPage from "./pages/AddCategoryPage";
import ProfilePage from "./pages/ProfilePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AccountsPage from "./pages/AccountsPage";
import AddStockPage from "./pages/AddStockPage";
import AddUserPage from "./pages/AddUserPage";
import SaleHistoryPage from "./pages/SaleHistoryPage";
import ShopsPage from "./pages/ShopsPage";
import AddShopPage from "./pages/AddShopPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import StocksPage from "./pages/StocksPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "sale-history", element: <SaleHistoryPage /> },
          { path: "inventory", element: <InventoryPage /> },
          { path: "inventory/stocks", element: <StocksPage /> },
          { path: "inventory/categories", element: <CategoriesPage /> },
          { path: "inventory/products", element: <ProductsPage /> },
          {
            path: "inventory/products/add-product",
            element: <AddProductPage />,
          },
          {
            path: "inventory/categories/add-category",
            element: <AddCategoryPage />,
          },
          { path: "inventory/stocks/add-stock", element: <AddStockPage /> },
          {
            element: <RequireRole roles={["admin"]} />,
            children: [{ path: "users", element: <UsersPage /> }],
          },
          {
            element: <RequireRole roles={["admin"]} />,
            children: [{ path: "users/add-user", element: <AddUserPage /> }],
          },
          {
            element: <RequireRole roles={["admin"]} />,
            children: [{ path: "shops", element: <ShopsPage /> }],
          },
          {
            element: <RequireRole roles={["admin"]} />,
            children: [{ path: "shops/add-shop", element: <AddShopPage /> }],
          },
          { path: "profile", element: <ProfilePage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "accounts", element: <AccountsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
