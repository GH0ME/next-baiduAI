import { notFound } from "next/navigation"

export interface apiReqType {
  AK?:string,
  SK?:string,
  server?: 'speech'|'tts'|'chat',
  init?: RequestInit,
  query?: string
}

export const apiHttpClient = async(api:string,body?:apiReqType)=>{
  const isTTS = body?.server==='tts'?true:false
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/${api}`,{
    method:"POST",
    body:JSON.stringify(body)
  }).then(res=>{
    return isTTS?res.blob():res.json()
  })

  if(response.status === 500){
    throw new Error('服务器出了点问题')
  }

  if(response.status === 404){
    notFound()
  }

  return response
}