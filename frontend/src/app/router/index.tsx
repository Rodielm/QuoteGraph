import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app/layouts/AppLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { CollectionDetailPage } from "@/features/collections/CollectionDetailPage";
import { CollectionsPage } from "@/features/collections/CollectionsPage";
import { GraphPage } from "@/features/graph/GraphPage";
import { FavoritesPage } from "@/features/quotes/FavoritesPage";
import { QuotesPage } from "@/features/quotes/QuotesPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <QuotesPage /> },
          { path: "/favorites", element: <FavoritesPage /> },
          { path: "/collections", element: <CollectionsPage /> },
          { path: "/collections/:collectionId", element: <CollectionDetailPage /> },
          { path: "/graph/:quoteId", element: <GraphPage /> },
        ],
      },
    ],
  },
]);
