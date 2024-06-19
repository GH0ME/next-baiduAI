'use client'

import React, { startTransition, useEffect, useRef, useState, Suspense } from 'react';
import { uploadAudio } from './service';
import Resampler from './resampler'
// import Spline from '@splinetool/react-spline';
import '../styles/micro.css'
import { apiHttpClient } from '../service';
import { urlEncode } from '../../util/urlencode';
import Image from 'next/image';
import activeIcon from '../../public/images/active.gif'
import notActiveIcon from '../../public/images/notactive.png'
import { stopLoading } from '../../util/controlLoading';
import Tip from '../components/Tip';
//懒加载Spline
const Spline = React.lazy(()=>import('@splinetool/react-spline'))

// declare global {
//   interface Window{
//     webkitSpeechRecognition:any
//   }
// }
declare global {
  interface Window {
    webkitAudioContext?: AudioContext;
  }
}

const BUFSIZE = 8192

const MicrophoneAccess = () => {
  let audio //用于播放声音
  const [recordingStatus,setStatus] = useState('inactive')
  const [audioContext,setAudioContext] = useState<AudioContext|null>(null)
  const [reSampler,setReSampler] = useState<Resampler|null>(null)
  const [microStream,setMicroStream] = useState<MediaStream|null>(null)
  const bufferArray = useRef<number[]>([])
  const sourceNode = useRef<MediaStreamAudioSourceNode|null>(null)
  const scriptNode = useRef<ScriptProcessorNode|null>(null)
  const salutation = useRef<string>('')
  const chatRef = useRef<string[]>([])
  const [chats,setChats] = useState<string[]>([])
  const [loading,setLoading] = useState<boolean>(false)
  const wave = "M 0 100 Q 75 130,150 100 T 300 100 T 450 100 T 600 100 L 600 0 L 0 0 L 0 100Z"

  const initMicroPhone = ()=>{
    if(audioContext) return
    console.log('请求麦克风权限');

    const context = new (window.AudioContext||window.webkitAudioContext)()
    const reSampler = new Resampler(context.sampleRate, 16000, 1, BUFSIZE)

    navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
      setAudioContext(context)
      setReSampler(reSampler)
      setMicroStream(stream)
    }).catch(err => {
      console.log(`麦克风权限获取失败：${err}`);
    })
  }

  const getChatId = async()=>{
    const chatId = localStorage.getItem('chatId')
    if(chatId){
      const sign = JSON.parse(chatId)
      const sevenDays = Number(process.env.NEXT_PUBLIC_SEVEN_DAYS)
      if(new Date().getTime() - sign.timeStamp < sevenDays) return
    }

    const qianfanKey = process.env.NEXT_PUBLIC_QIANFAN_KEY || ''
    const qianfanID = process.env.NEXT_PUBLIC_QIANFAN_ID || ''
    const options = {
      "method": "POST",
      "headers": {
        'Content-Type': 'application/json',
        'X-Appbuilder-Authorization': `Bearer ${qianfanKey}`
      },
      "body": JSON.stringify({
        'app_id': qianfanID
      })
    }

    const newChatId = await apiHttpClient('qianfan',{init:options})
    
    localStorage.setItem('chatId',JSON.stringify({
      id:newChatId.conversation_id,
      timeStamp:new Date().getTime()
    }))
    
  }

  useEffect(()=>{
    initMicroPhone()
    getChatId()
  },[])

  const startRecording = ()=>{
    if(!audioContext||!microStream) return
    const inner = document.getElementsByClassName('inner')[0]
    inner.classList.add('close-inner')
    setStatus('recording')
    bufferArray.current = []
    return new Promise(async(_resolve,_reject)=>{
      await audioContext.resume()
      sourceNode.current = audioContext.createMediaStreamSource(microStream)
      scriptNode.current = audioContext.createScriptProcessor(BUFSIZE,1,1)

      sourceNode.current.connect(scriptNode.current)
      scriptNode.current.addEventListener('audioprocess',processAudioCallback)
      scriptNode.current.connect(audioContext.destination)
    })
  }

  const processAudioCallback = (e:AudioProcessingEvent)=>{
    if(!reSampler) return
    const reSampled = reSampler.resample(e.inputBuffer.getChannelData(0)) as number[]
    bufferArray.current.push(...reSampled)
  }

  const resetListening = async()=>{
    if(audioContext){
      await audioContext.suspend()
    }
    if(scriptNode.current){
      scriptNode.current.removeEventListener('audioprocess',processAudioCallback)
      scriptNode.current.disconnect()
    }
    if(sourceNode.current){
      sourceNode.current.disconnect()
    }
  }

  const stopRecording = async()=>{
    const activeBtn = document.getElementById('active-btn')
    activeBtn!.style.filter = 'grayscale(1)'
    resetListening()
    const dataLength = bufferArray.current.length*2 //16bit
    const buffer = new ArrayBuffer(dataLength)
    const data = new DataView(buffer)
    let offset = 0

    for(let i = 0;i<bufferArray.current.length;i++,offset+=2){
      const s = Math.max(-1,Math.min(1,bufferArray.current[i]))
      
      data.setInt16(offset,s<0?s*0x8000:s*0x7FFF,true)
    }

    const blob = new Blob([data],{type:'audio/wav'})
    const reader = new FileReader()

    reader.onload = async() => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]

      const speech = await uploadAudio(base64,dataLength)
      bufferArray.current = []
      // setSpeech(speech)
      chatRef.current = [...chatRef.current,speech]
      setChats(chatRef.current)
      setLoading(true)
      const resultChat = await askAI2(speech) as string
      
      startTransition(()=>{
        chatRef.current = [...chatRef.current,resultChat]
        activeBtn!.style.filter = 'grayscale(0)'
        const inner = document.getElementsByClassName('inner')[0]
        inner.classList.remove('close-inner')
        setStatus('inactive')
        setChats(chatRef.current)
        setLoading(false)
      })
    }
    reader.readAsDataURL(blob)
  }

  //普通模型
  const askAI = async(content:string)=>{
    const AK = process.env.NEXT_PUBLIC_ERNIE_API_KEY || '';
    const SK = process.env.NEXT_PUBLIC_ERNIE_SECRET_KEY || '';
    const token = await apiHttpClient('getAccessToken', { AK, SK });
    
    const body = JSON.stringify({
      messages: [
        {
          role: 'user',
          content: `你可以称呼我${salutation.current},遇到问题使用搜索引擎协助回答，尽量以轻松的口语化的回答。`,
        },
        {
          role: 'assistant',
          content: `没问题${salutation.current},就咱两这关系，有问题尽管找我。`,
        },
        { role: 'user', content: content },
      ],
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    };

    const result = await apiHttpClient('baiduAI', {
      server: 'chat',
      init: options,
      query: token.access_token,
    });

    return result.result
  }

  //自训练模型
  const askAI2 = async(content:string)=>{
    const chatId = localStorage.getItem('chatId')
    const sign = JSON.parse(chatId!)
    const qianfanKey = process.env.NEXT_PUBLIC_QIANFAN_KEY || ''
    const qianfanID = process.env.NEXT_PUBLIC_QIANFAN_ID || ''
    const options = {
      "method": "POST",
      "headers": {
        'Content-Type': 'application/json',
        'X-Appbuilder-Authorization': `Bearer ${qianfanKey}`
      },
      "body": JSON.stringify({
        'app_id': qianfanID,
        'stream': false,
        'conversation_id': sign.id,
        "query": content,
      })
    }

    const result = await apiHttpClient('qianfan',{server:'chat',init:options})

    //先让它讲话，再将字体渲染到页面
    await tts(result.answer)

    return result.answer
  }

  const tts = async(content:string)=>{
    const AK = process.env.NEXT_PUBLIC_SPEECH_API_KEY || ''
    const SK = process.env.NEXT_PUBLIC_SPEECH_SECRET_KEY || ''
    const token = await apiHttpClient('getAccessToken', { AK, SK })

    const ttsOptions = {
      "method": "POST",
      "headers": {
        "Content-Type": 'application/x-www-form-urlencoded',
        "Accept": '*/*'
      },
      "body": `tex="${urlEncode(content)}"&tok=${token.access_token}&cuid="GH0ME"&ctp=1&lan=zh&spd=5&pit=5&vol=5&per=5118&aue=3`
    }

    const ttsResult = await apiHttpClient('baiduAI',{server:'tts',init:ttsOptions})
    
    const url = URL.createObjectURL(ttsResult)
    
    audio = new Audio(url)
    audio.onended = ()=>{
      URL.revokeObjectURL(url)
      audio = null
    }
    audio.play()
  }

  return (
    <div>
        <div style={{position:'relative',maxHeight:'95vh'}}>
          <Tip 
            title='简单介绍'
            content='该模型为作者专门为自己训练的AI，所以会称呼我“吴哥”。简单测试使用，目标以后能做到每个人都能在我这简便创建属于自己的AI助手。'
            top={100}
            left={300}
          />
          <div className='inner'/>
          <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 300 300" className="box-waves">
            <path d={wave}></path>
            <path d={wave}></path>
            <path d={wave}></path>
          </svg>
          <div className='spline-box'>
            <Suspense fallback={null}>
              <Spline scene="https://prod.spline.design/oWgiXeq3KyhDRQEz/scene.splinecode" onLoad={stopLoading} className="spline"/>
            </Suspense>
            <Image  
              id='active-btn'
              src={recordingStatus==='recording'?activeIcon:notActiveIcon} 
              width={260}
              height={190}
              priority
              alt='Recording'
              onClick={recordingStatus==='recording'?stopRecording:startRecording}
            />
          </div>
        </div>
    </div>
  );
};

export default MicrophoneAccess;