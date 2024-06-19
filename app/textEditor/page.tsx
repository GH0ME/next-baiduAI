'use client'
import dynamic from "next/dynamic";
import React, { useState } from "react";
// import MyEditor from "../components/MyEditor";
import '../styles/editor.css'
const MyEditor = dynamic(
  () => import('../components/MyEditor'),
  {ssr:false}
)

const TextEditor = () => {
  // 编辑器内容
  const [html, setHtml] = useState('')
  const downloadHtml = ()=>{
    const blob = new Blob([html],{type:'text/plain;charset=utf-8'})
    const objectURL = URL.createObjectURL(blob)
    const aTag = document.createElement('a')
    aTag.href = objectURL
    aTag.download = `GHOME-document-${new Date().getTime()}.html`
    aTag.click()
    URL.revokeObjectURL(objectURL)
  }
  return <div id="editorBox">
    <div id="editorPart">
      {/* @ts-expect-error Server Component */}
      <MyEditor html={html} setHtml={setHtml}/>
      <div className="tip-tab">选中输入框,按下Tab键,让AI帮你写 <button  onClick={downloadHtml}>下载为html</button>
      </div>
    </div>
    <div id="showPart">
      <p dangerouslySetInnerHTML={{__html:html}}></p>
    </div>
  </div>
}

export default TextEditor;
