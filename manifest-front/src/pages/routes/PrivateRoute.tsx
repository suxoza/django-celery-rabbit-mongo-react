import AuthContext from '../../AuthProvider'
import Header from '../components/Header';
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRotue = () => {

    const { user } = useContext(AuthContext)

    console.log(user)

    if(!user)
        return <Navigate to='/login' replace />

    return (
        <>
            <Header />
            <Outlet />
        </>
    )

}

export default PrivateRotue;