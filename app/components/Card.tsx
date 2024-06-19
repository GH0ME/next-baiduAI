'use client'
import Image from 'next/image';
import './components.css'
import MyAvatar from '../../public/images/wuxi.jpg'
import { useSpring,  config, to  } from 'react-spring';
import { animated } from '@react-spring/web';

const calc = (x: number, y: number) => {
  const box = document.getElementById('card-box')
  const rect = box!.getBoundingClientRect()
  //相对毛玻璃中心 偏移
  return [-(y - rect.top - rect.height/2 ) / 20, (x - rect.left - rect.width/2) / 10, 1]
}

const trans = (x: number, y: number, s: number) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`

const Card = () => {
  //config:{mass:10,tension:200,friction:50}
  const [props,set] = useSpring(()=> ({xys:[0,0,1],config:config.default}))
  return <animated.div 
            id='card-box' 
            onMouseMove={(e)=>{
              const {clientX:x,clientY:y} = e
              set({xys:calc(x,y)})
            }}
            onMouseLeave={() => set({xys:[0,0,1]})}
            style={{
              transform: to(props.xys,trans)
          }}>
    <Image id='img' src={MyAvatar} alt='uploading' priority />
    <h1>GHOME</h1>
    <h2>一名前端开发者</h2>
    <h3>项目Github：<a href='https://github.com/GH0ME/next-baiduAI' target={'_blank'}>https://github.com/GH0ME/next-baiduAI</a></h3>
  </animated.div>
}


export default Card;
