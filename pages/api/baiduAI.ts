import { NextApiRequest, NextApiResponse } from "next"
import { apiReqType } from "../../app/service"

export interface baiduAIType {
  server: 'speech'|'tts'|'chat'
}

interface initType {
  init:RequestInit,
  query?:string
}

const apiHttp = {
  'speech': 'http://vop.baidu.com/server_api',
  'tts': 'https://tsn.baidu.com/text2audio',
  'chat': 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k-preview'
}

//语音识别
const speech = async(init:initType)=>{
  const res = await fetch(apiHttp['speech'],init.init).then(res=>res.json()).then(res=>res)

  if(res?.result){
    return {status:200,result:res.result[0]}
  }else{
    console.log({res});
    
    return {status:400,result:res?.err_msg||res?.error_msg}
  }
}

//语音合成
const tts = async(init:initType)=>{
  let error = false
  const res = await fetch(apiHttp['tts'],init.init).then(res=>{
    //若正确返回，Content-Type为audio/mp3
    if(res.headers.get('Content-Type')==='audio/mp3'){
      return res.blob()
    }else{
      error = true
      return res.json()
    }
  }).then(res=>res)

  if(!error){
    return {status:200,result:res}
  }else{
    console.log({res});
    return {status:400,result:res.err_detail}
  }
}

//对话
const chat = async(init:initType)=>{
  const url = apiHttp['chat'] + `?access_token=${init.query}`
  const res = await fetch(url,init.init).then(res=>res.json()).then(res=>res)

  if(res?.result){
    return {status:200,result:res.result}
  }else{
    console.log({res});
    return {status:400,result:res?.err_msg||res?.error_msg}
  }
}

const functions = {
  'speech': speech,
  'tts': tts,
  'chat': chat
}

const handler = async(request:NextApiRequest,response:NextApiResponse)=>{
  const { server,init,query }:apiReqType = JSON.parse(request.body)
  if(!server||!init) return response.status(400).send('缺少 服务类型 或 body 🙂')

  const fun = functions[server]
  const res = await fun({init,query})

  switch(server){
    case 'chat':
      return response.status(res.status).send({result:res.result})
    case 'speech':
      return response.status(res.status).send({result:res.result})
    case 'tts':
      if(typeof(res.result)==='string'){
        //说明是error
        return response.status(res.status).send({result:res.result})
      }else{
        //将blob转为base64传输
        const arrayBuffer = await res.result.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        return response.status(res.status).setHeader('Content-Type','audio/mp3').setHeader('Content-Length',res.result.size).send(buffer)
      }
  }
}

export default handler