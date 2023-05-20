
import { useEffect, useMemo, useState, useContext } from 'react'
import axiosInstance from '../config/axiosConfig'
import AuthContext from '@/AuthProvider'
import Loading from './components/loading'

import fileDownload from 'js-file-download';

const HomePage = () => {

    const [manifest_id, setId] = useState<string>('')
    const [buttonStatus, setButtonStatus] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(false)
    const [serverError, setError] = useState<string>('')

    const getButtonStatus = useMemo(() => {
        return manifest_id.toString().length > 5
    }, [manifest_id])
    
    useEffect(() => {
        setButtonStatus(getButtonStatus)
    }, [getButtonStatus])

    const download = () => {
        axiosInstance.get(`${import.meta.env.VITE_SERVER_ADDRESS}download/${manifest_id}`, {
            responseType: 'blob',
        }).then(response => {
            console.log(response)
            fileDownload(response.data, 'test.csv')
            setId('')
        }).catch(error => {
            console.log(error)
            setError('default')
            setLoading(false)
        }).then(() => {
            setLoading(false)
        })
    }

    const delay = async (secs) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true)
            }, secs);
        })
    }

    const getStatus = async (celery_id: number) => {
        axiosInstance.get(`${import.meta.env.VITE_SERVER_ADDRESS}generate/${manifest_id}/${celery_id}`).then(async response => {
            if(response.data.status !== 'SUCCESS'){
                await delay(3000);
                return getStatus(celery_id)
            }else{
                if(response.data.file !== true){
                    throw new Error("ID not found")
                }
            }
            await download()
        }).catch(error => {
            console.log(error)
            setError(error)
            setLoading(false)
        }).then(() => {})
    }

    const submitForm = (evt) => {
        evt.preventDefault()
        if(!getButtonStatus)return
        setError('')
        setLoading(true)
        axiosInstance.get(`${import.meta.env.VITE_SERVER_ADDRESS}generate/${manifest_id}`).then(async response => {
            console.log(response.data)    
            await getStatus(response.data.celery_id)
        }).catch(error => {
            console.log(error?.response)
            setError(error?.response?.data?.error || 'default')
            setLoading(false)
        }).then(() => {})
    }


    return (
        <>
            <Loading status={isLoading}></Loading>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className='flex items-center justify-center flex-col w-11/12 xl:w-1/3 mb-5'>
                    <img src="/manifest1.png" alt="" className='mb-3 border border-gray-800 shadow-2xl rounded-lg w-full lg:w-9/12 xl:w-auto h-full lg:h-auto'/>
                    <div className='mb-3 px-3 text-sm'>
                        ჩასვი აიდი (სურათზე მონიშნული) <span className='bold underline text-md'>manifest.ge</span> ვებსაიტიდან, რომლიდანაც გინდა რომ მონაცემები ამოიღო,
                        მხოლოდ აიდი, (როგორც წესი 5-8 ნომრისგან უნდა შედგებოდეს)
                    </div>
                    <form onSubmit={submitForm} className='flex flex-col w-full'>
                        {/* @ts-ignore */}
                        <input className='py-4 px-3 rounded-lg border border-gray-500' type="text" value={manifest_id} onChange={evt => setId(parseInt(evt.target.value) || '')} pattern='[0-9]+'/>
                        <input className={`mt-3 flex items-center justify-center py-3 px-5 bg-green-800 text-bold rounded-lg text-white hover:text-green-500 cursor-pointer hover:outline-dashed `+(!buttonStatus?'opacity-25':'')} type="submit" value={'submit'} />
                    </form>
                    {isLoading && <div className="mt-2 text-red-800 text-extrabold text-lg shadow-2xl">მეითმინე ორი წამი და იქნება, სად გეჩქარება?</div>}
                    {serverError && <div className="mt-2 p-5 bg-transparent text-center text-red-500 text-extrabold text-lg shadow-2xl">
                        {serverError !== 'default'?serverError:<>შეცდომა დაფიქსირდა სერვერზე, ვნახავ მერე ლოგებს,<br/> მოგვიანებით ცადე მოკლედ!</>}
                    </div>}
                </div>
            </div>
        </>
    )
}

export default HomePage;