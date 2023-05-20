import axios from 'axios';
axios.defaults.withCredentials = true
export const baseURL = import.meta.env.VITE_SERVER_ADDRESS

const instance = axios.create({
    withCredentials: true,
    baseURL: baseURL
});

export default instance;


export const setHeaders = async (token: string | null = null) => {
    return new Promise((resolve) => {
        if(token)
            instance.defaults.headers.common['Authorization'] = `Token ${token}`;
        else
            delete instance.defaults.headers.common['Authorization']

        setTimeout(() => resolve(instance), 10);
    })
}