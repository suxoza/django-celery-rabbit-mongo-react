import { useRef, useState, useContext, useEffect, useMemo } from "react";
import AuthContext from '../AuthProvider'


const Login = () => {


    const storage = sessionStorage

    const { loginUser } = useContext(AuthContext)
    const [status, setStatus] = useState<boolean>(false)
    const [errorStatus, setErrorStatus ] = useState<boolean>(false)
    const [userName, setUserName] = useState<string>('')
    const [password, setPassword] = useState<string>('')


    const [ isBlocked, setIsBlocked ] = useState<number>(0)

    const submitForm = async (evt) => {
        evt.preventDefault()
        setErrorStatus(false)
        loginUser({username: userName, password}).then(response => {
            console.log(response.data)
        }).catch(e => {
          storage.setItem('errorsCount', storage.getItem('errorsCount')?(Number(storage.getItem('errorsCount')) + 1).toString():'1')
          setErrorStatus(true)
          setUserName('')
          setPassword('')
          setStatus(false)
        })
    }

    const statusMessage = useMemo(() => {
        return userName.length >=5 && password.length >= 5
    }, [userName, password])

    useEffect(() => {
        setStatus(statusMessage)

        if(storage.getItem('errorsCount')){
            const errorsCount = Number(storage.getItem('errorsCount'))
            if(errorsCount > 3){
                sessionStorage.removeItem('errorsCount')
                sessionStorage.setItem('lastErrorDate', (new Date().getTime() / 1000).toString())
                location.reload()
            }
        }
    }, [statusMessage])

    const getLastBlockedDate = (lastErrorDate) => {
        const currentDate = (new Date().getTime() / 1000)
        return Math.round(30 - (currentDate - lastErrorDate))
    }

    const _clearInterval = (interval) => {
        setIsBlocked(0)
        clearInterval(interval)
        sessionStorage.removeItem('lastErrorDate')
    }

    useEffect(() => { 
        let interval = null
        if(sessionStorage.getItem('lastErrorDate')){
            const lastErrorDate = Number(sessionStorage.getItem('lastErrorDate'))
            let timeLeft = getLastBlockedDate(lastErrorDate)
            if(timeLeft >= 1){
                setIsBlocked(timeLeft)
                interval = setInterval(() => {
                    timeLeft = getLastBlockedDate(lastErrorDate)
                    if(timeLeft <= 0 )
                        _clearInterval(interval)
                    setIsBlocked(timeLeft)
                }, 1000);
            }else{
                _clearInterval(interval)
            }
        }
    }, [])

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="px-8 py-6 mt-4 text-left bg-white w-11/12 md:w-1/2 xl:w-1/4 rounded-xl shadow-2xl">
                    <h3 className="text-2xl font-bold text-center">Login to your account</h3>
                    <div className="flex items-center justify-center pt-3">
                        <h4 className="text-red-500 text-xm h-3">
                            {errorStatus && <>user not found</>}
                            {isBlocked > 0 && <>Try after {isBlocked} seconds!!!</>}
                        </h4>
                    </div>
                    <form onSubmit={submitForm} action="">
                        <div className="mt-4">
                            <div>
                                <label className="block" htmlFor="username">User</label>
                                <input onChange={(event) => setUserName(event.target.value)} value={userName} required name="username" type="text" placeholder="User" className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" pattern="^(?=.*[a-zA-Z]).{5,}$"/>
                            </div>
                            <div className="mt-4">
                                <label className="block">Password</label>
                                <input onChange={(event) => setPassword(event.target.value)} value={password} required name="password" type="password" placeholder="Password" className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"  pattern="^(?=.*[a-zA-Z]).{4,}$"/>
                            </div>
                            <div className="flex items-baseline justify-between">
                                {!isBlocked && 
                                    <button className={`px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 w-full `+(!status?'opacity-25':'')}>Login</button>
                                }
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login;