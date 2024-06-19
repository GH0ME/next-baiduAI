'use client'
import './components.css'

interface tipProps{
  title: string
  content: string
  top:number
  left:number
  // width:number
  // height:number
  // borderRadius:number
}

const Tip = ({title,content,top,left}:tipProps) => {
  const openBox = ()=>{
    const box = document.getElementsByClassName('tip-box')[0]
    box.classList.add('open-tip-box')
  }
  const closeBox = ()=>{
    const box = document.getElementsByClassName('tip-box')[0]
    box.classList.remove('open-tip-box')
  }
  return <div className='tip-box' style={{top,left}} onClick={openBox} onBlur={closeBox} tabIndex={-1}>
    <h1>{title}</h1>
    <p>{content}</p>
  </div>
}

export default Tip;
