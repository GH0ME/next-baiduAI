'use client'

import { useEffect } from "react";
import { stopLoading } from "../util/controlLoading";
import XinYi from '../public/images/xinyi.png'
import Card from "./components/Card";

const Page = () => {  
  useEffect(()=>{
    setTimeout(()=>{
      stopLoading()
    },300)
  },[])
  return <div id="main-content">
      <div className="bgIm" style={{backgroundImage:`url(${XinYi.src})`}}></div>
      <div className="my-content">
        <div className="welcome">
          <h1>欢迎光临!👋~</h1>
          <h1>我是 <p>GHOME</p></h1>
          <h1>这是一个尝试结合 <p>AI</p> 的 </h1>
          <h1><p>Next.js</p> 项目</h1>
          <h1>🚀📝💬🎮🚀</h1>
        </div>
        <Card/>
      </div>
    </div>
  
}

export default Page;
