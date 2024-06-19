import { NextApiRequest, NextApiResponse } from "next"
import { apiReqType } from "../../app/service";

const handler = async(request:NextApiRequest,response:NextApiResponse)=>{
  const { AK,SK }:apiReqType = JSON.parse(request.body)
  
  if(!AK||!SK) return response.status(400).send('缺少apiKey或Secret 🙂')
  
  const tokens = await fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${AK}&client_secret=${SK}`,{
    'method':'POST'
  }).then(res=>res.json()).then(res=>res)
  
  return response.status(200).send({access_token:tokens.access_token})
}

// const handler = (request:NextApiRequest,response:NextApiResponse) =>{
  // if(request.method!=='GET'){
  //   return response.status(400).send('无效请求 🙂')
  // }
  // return response.status(200).send('欢迎访问Next.js')
// }

export default handler