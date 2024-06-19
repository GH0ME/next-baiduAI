'use client'
import { appConfig } from "../config";
import NavLink from "./nav-link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Switch from "./switch";

/**
 * AppHeader
 */
const AppHeader = () => {
  const pathName = usePathname()
  const [model,setModel] = useState<'dark'|'light'>('dark')
  return (<header className={`${model==='dark'?'dark-header':'light-header'}${pathName==='/micro'?' micro-header':''}${pathName==='/'?' home-header':''}`}>
      <div>
        <span>🐂🐂</span> {appConfig.appName}
      </div>
      <nav>
        <div>
          <NavLink href="/">首页</NavLink>
        </div>
        <div>
          <NavLink href="/textEditor">富文本编辑器[AI生成]</NavLink>
        </div>
        <div>
          <NavLink href="/micro">聊天机器人[AI对话]</NavLink>
        </div>
        <div>
          <NavLink href="/game">推理互动游戏[开发中]</NavLink>
        </div>
      </nav>
      <Switch model={model} setModel={setModel}/>
    </header>
  )
}

export default AppHeader;
