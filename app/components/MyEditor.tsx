'use client'

import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-react/dist/index';
import '@wangeditor/editor/dist/css/style.css';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import '../styles/editor.css';
import { apiHttpClient } from '../service';
import { stopLoading } from '../../util/controlLoading';

interface editorProps {
  html: string,
  setHtml: Dispatch<SetStateAction<string>>
}

const MyEditor = ({html, setHtml}:editorProps)=> {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  // 编辑器内容
  // const [html, setHtml] = useState('');

  //chat框状态
  const [status, setStatus] = useState(false);
  const state = useRef(false);

  //input value
  const value = useRef('');

  //loading
  const [loading, setLoading] = useState(false);

  // 模拟 ajax 请求，异步设置 html
  // useEffect(() => {
  //   setTimeout(() => {
  //     setHtml('<p>hello world</p>');
  //   }, 500);
  // }, []);

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {};

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '按下Tab键，让AI帮你写',
  };

  // 及时销毁 editor
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  const askAI = async (content: string) => {
    if (!editor) return;
    const AK = process.env.NEXT_PUBLIC_ERNIE_API_KEY || '';
    const SK = process.env.NEXT_PUBLIC_ERNIE_SECRET_KEY || '';
    const token = await apiHttpClient('getAccessToken', { AK, SK });

    const body = JSON.stringify({
      messages: [
        {
          role: 'user',
          content: '请根据我的提示为我写一篇文章或一些文字，格式请尽量规范。',
        },
        {
          role: 'assistant',
          content: '好的，我将会根据您的提示完成规范格式的文章。',
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

    //等待操作
    setLoading(true);

    const result = await apiHttpClient('baiduAI', {
      server: 'chat',
      init: options,
      query: token.access_token,
    });

    //完成操作
    setLoading(false);

    setHtml(result.result);
  };

  return (
    <>
      <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
          style={{ borderBottom: '1px solid #ccc' }}
        />
        <Editor
          defaultConfig={editorConfig}
          value={html}
          onCreated={(editor) => {
            stopLoading()
            editor.handleTab = () => {
              state.current = !state.current;
              setStatus(state.current);
            };
            setEditor(editor);
          }}
          onChange={(editor) => setHtml(editor.getHtml())}
          mode="default"
          style={{ height: '75vh', overflowY: 'hidden' }}
        />
      </div>
      <div className={`box-input ${status ? 'show-input' : 'hidden-input'}`}>
        <input
          className="real-input"
          placeholder="请输入联想主题(回车执行)"
          onChange={(e) => {
            value.current = e.target.value;
          }}
          onKeyDown={(e) => {
            console.log({ value: value.current });
            e.code === 'Enter' && askAI(value.current);
          }}
        />
      </div>
      {loading ? (
        <div className="cover-screen">
          <p>loading...</p>
        </div>
      ) : null}
    </>
  );
}

export default MyEditor;
