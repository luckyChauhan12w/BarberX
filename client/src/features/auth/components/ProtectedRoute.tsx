import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};