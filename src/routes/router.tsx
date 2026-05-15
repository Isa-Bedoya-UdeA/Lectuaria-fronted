// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PATHS } from "@/constants/routes";
import Layout from "@/components/Layout/MainLayout";
import NotFound from "@/pages/404/NotFound";
import Books from "@/pages/books/Books";
import BookDetail from "@/pages/books/BookDetail";
import Lists from "@/pages/account/Lists";
import Profile from "@/pages/account/Profile";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ListDetail from "@/pages/account/ListDetail";
import MyLibrary from "@/pages/library/MyLibrary";
import AddBook from "@/pages/library/AddBook";
import EditBook from "@/pages/library/EditBook";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import SharedList from "@/pages/account/SharedList";

const Home = lazy(() => import("@/pages/home/Home"));
const UserProfile = lazy(() => import("@/pages/users/UserProfile"));
const SharedWithMe = lazy(() => import("@/pages/shared/SharedWithMe"));
const TopRated = lazy(() => import("@/pages/books/TopRated"));
const Popular = lazy(() => import("@/pages/books/Popular"));

export const router = createBrowserRouter([
    {
        path: PATHS.HOME,
        element: <Layout />,
        errorElement: <div>¡Ups! Algo salió mal.</div>,
        children: [
            { index: true, element: <Suspense fallback="..."><Home /></Suspense> },
            { path: PATHS.BOOKS, element: <Suspense fallback="..."><Books /></Suspense> },
            { path: `${PATHS.BOOKS}/:isbn`, element: <Suspense fallback="..."><BookDetail /></Suspense> },
            { path: PATHS.SIGNIN, element: <Suspense fallback="..."><SignIn /></Suspense> },
            { path: PATHS.SIGNUP, element: <Suspense fallback="..."><SignUp /></Suspense> },

            // Public routes for featured sections
            { path: "/top-rated", element: <Suspense fallback="..."><TopRated /></Suspense> },
            { path: "/popular", element: <Suspense fallback="..."><Popular /></Suspense> },

            // Public route for viewing other users' profiles
            { path: "/users/:usernameSlug", element: <Suspense fallback="..."><UserProfile /></Suspense> },

            // Public route for viewing shared lists via token
            { path: "/shared/:token", element: <SharedList /> },

            // Protected routes for any logged in user
            { path: PATHS.LISTS, element: <ProtectedRoute allowedRole="READER"><Suspense fallback="..."><Lists /></Suspense></ProtectedRoute> },
            { path: `${PATHS.LISTS}/:id`, element: <ProtectedRoute allowedRole="READER"><Suspense fallback="..."><ListDetail /></Suspense></ProtectedRoute> },
            { path: PATHS.PROFILE, element: <ProtectedRoute><Suspense fallback="..."><Profile /></Suspense></ProtectedRoute> },
            { path: PATHS.SHARED_WITH_ME, element: <ProtectedRoute allowedRole="READER"><Suspense fallback="..."><SharedWithMe /></Suspense></ProtectedRoute> },

            { path: PATHS.MY_LIBRARY, element: <ProtectedRoute allowedRole="LIBRARIAN"><Suspense fallback="..."><MyLibrary /></Suspense></ProtectedRoute> },
            { path: PATHS.ADD_BOOK, element: <ProtectedRoute allowedRole="LIBRARIAN"><Suspense fallback="..."><AddBook /></Suspense></ProtectedRoute> },
            { path: PATHS.EDIT_BOOK, element: <ProtectedRoute allowedRole="LIBRARIAN"><Suspense fallback="..."><EditBook /></Suspense></ProtectedRoute> },

            { path: "*", element: <NotFound /> }
        ],
    },
]);