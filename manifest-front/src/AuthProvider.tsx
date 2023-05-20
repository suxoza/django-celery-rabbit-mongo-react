import { createContext, useState, useMemo, ReactNode, useCallback, useEffect } from "react";
import axiosInstance, { setHeaders } from './config/axiosConfig'


export interface User {
    id?: string,
    username?: string,
    password?: string,
    token?:string
}

interface UserInterface {
  user?: User,
  username?: string,
  isLoading: boolean,
  authenticated?: boolean,
  loginUser?: CallableFunction,
  logoutUser?: CallableFunction
}

const AuthContext = createContext<UserInterface | null>(null);

export default AuthContext;

interface Props {
  children?: ReactNode
}

class UserStorage {

  private static instance: UserStorage;
  private static storage: any;
  private static keyName = 'user';

  private constructor() { 
    UserStorage.storage = sessionStorage
    console.log(typeof(UserStorage.storage))
  }

  public static getInstance(): UserStorage {
      if (!UserStorage.instance) 
        UserStorage.instance = new UserStorage();
      return UserStorage.instance;
  }

  public get storage() : User | null {
    return JSON.parse(UserStorage.storage.getItem(UserStorage.keyName));
  }

  public set storage(userData: object) {
    UserStorage.storage.setItem(UserStorage.keyName, JSON.stringify(userData))
  }

  public delUser() {
    UserStorage.storage.removeItem(UserStorage.keyName)
  }

  public get authenticated() {
      const status = !["undefined", null].includes(UserStorage.storage.getItem(UserStorage.keyName))
      return status || false
  }
}

export const AuthProvider = ({ children, ...props }: Props) => {
  const [user, setUser] = useState(() => UserStorage.getInstance().storage)
  const [isLoading, setLoading ] = useState<boolean>(false)
  
  const loginUser = async (userData: User) => {
    setLoading(true)
    axiosInstance.post(`${import.meta.env.VITE_SERVER_ADDRESS}login`, userData).then(async response => {
      UserStorage.getInstance().storage = response?.data
      setUser(response?.data)
      await setHeaders(response?.data?.token)
    }).catch(() => {
      setLoading(false)
      throw new Error("");
    }).then(() => {
      setLoading(false)
    })
  };

  const logoutUser = useCallback(async () => {
    try {
      setLoading(true)
      await axiosInstance.get(`${import.meta.env.VITE_SERVER_ADDRESS}logout`)
    } catch (error) {
        console.log(error)   
    } finally {
        setUser(null)
        UserStorage.getInstance().delUser()
        setLoading(false)
        await setHeaders(null)
    } 
  }, [])

  useEffect(() => {
    if(user && user?.token)
      setHeaders(user?.token)
  }, [])

  const authenticated =  Boolean(user)

  const contextData: UserInterface = {
    user,
    authenticated,
    loginUser,
    isLoading,
    logoutUser
  };


  return (
    <AuthContext.Provider value={contextData}>
      { children }
    </AuthContext.Provider>
  );
};