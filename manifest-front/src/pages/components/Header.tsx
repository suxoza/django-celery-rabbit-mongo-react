import AuthContext from '../../AuthProvider'
import { useContext } from 'react'

const Header = () => {

    const { logoutUser } = useContext(AuthContext)

    const logout = () => {
        logoutUser()
    }

    return (
        <div className="w-full h-15 py-3 flex items-center justify-end px-10">
            <div onClick={logout} className="hover:bg-gray-500 text-xl cursor-pointer hover:text-white flex items-center justify-center rounded-lg px-10 py-3 border border-gray-500">LogOut</div>
        </div>
    )
}

export default Header;