import { NextApiRequest, NextApiResponse } from "next"

const handler = async(request:NextApiRequest,response:NextApiResponse)=>{
  const { server,init } = JSON.parse(request.body)
  
  const url = server ? 'https://qianfan.baidubce.com/v2/app/conversation/runs' : 'https://qianfan.baidubce.com/v2/app/conversation'

  const result = await fetch(url,init).then(res=>res.json()).then(res=>res)
  
  if(result?.conversation_id){
    const resultObj = result?.answer ? {
      answer:result.answer
    } : {
      conversation_id:result.conversation_id
    }
    return response.status(200).send(resultObj)
  }else{
    return response.status(400).send({result:'遇到错误 🙂：' + result.message})
  }
}

export default handler