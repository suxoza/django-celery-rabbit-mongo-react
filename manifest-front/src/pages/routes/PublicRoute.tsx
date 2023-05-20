import AuthContext from '../../AuthProvider'
import Loading from "../components/loading"
import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom'


const PrivateRotue = () => {

    const { isLoading, user } = useContext(AuthContext)
   
    if(user)
        return <Navigate to='/' replace />

    return (
        <>
            <Loading status={isLoading}></Loading>
            <Outlet />
        </>
    )

}

export default PrivateRotue;