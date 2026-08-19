import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app/layouts/AppLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { AuthorPage } from "@/features/authors/AuthorPage";
import { CollectionDetailPage } from "@/features/collections/CollectionDetailPage";
import { CollectionsPage } from "@/features/collections/CollectionsPage";
import { GraphPage } from "@/features/graph/GraphPage";
import { FavoritesPage } from "@/features/quotes/FavoritesPage";
import { QuotesPage } from "@/features/quotes/QuotesPage";
import { MyReflectionsPage } from "@/features/reflections/MyReflectionsPage";
import { TopicDetailPage } from "@/features/topics/TopicDetailPage";
import { TopicsPage } from "@/features/topics/TopicsPage";

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
          { path: "/my-reflections", element: <MyReflectionsPage /> },
          { path: "/collections", element: <CollectionsPage /> },
          { path: "/collections/:collectionId", element: <CollectionDetailPage /> },
          { path: "/graph/:quoteId", element: <GraphPage /> },
          { path: "/authors/:authorSlug", element: <AuthorPage /> },
          { path: "/topics", element: <TopicsPage /> },
          { path: "/topics/:topicName", element: <TopicDetailPage /> },
        ],
      },
    ],
  },
]);
