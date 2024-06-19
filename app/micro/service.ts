import { apiHttpClient } from "../service"

export const mimeType = "audio/webm;codecs=opus"

export const uploadAudio = async(base64:string,len:number)=>{
  const AK = process.env.NEXT_PUBLIC_SPEECH_API_KEY || ''
  const SK = process.env.NEXT_PUBLIC_SPEECH_SECRET_KEY || ''
  const token = await apiHttpClient('getAccessToken',{AK,SK})
  // console.log({token});
  
  const body = JSON.stringify({
    "format": "pcm",
    "rate": 16000,
    "channel": 1,
    "token": token.access_token,
    "cuid": "GH0ME",
    "len": len,
    "speech": base64,
})

  // console.log({body});

  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
    },
    'body': body
  }
  
  const response = await apiHttpClient('baiduAI',{server:'speech',init:options})
  
  return response.result
}