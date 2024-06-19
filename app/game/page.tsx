'use client'

import { useEffect } from "react";
import { stopLoading } from "../../util/controlLoading";

const Game = () => {
  useEffect(()=>{
    setTimeout(()=>{
      stopLoading()
    })
  },[])
  return <div style={{width:'100%',height:'90vh',display:'flex',justifyContent:'center',alignItems:'center',fontSize:'2rem',fontWeight:'700'}}>
    🙂正在开发中...
  </div>
}

export default Game;
