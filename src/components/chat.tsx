'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import tmi from 'tmi.js';

const Chat = ({ channel }: any) => {
  const pathname = usePathname();
  console.log(pathname);

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const client = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: [channel],
    });

    const handleMessage = (channel: any, userstate: { [x: string]: any }, message: any, self: any) => {
      if (self) return;
      console.log(userstate);
      console.log(userstate.badges);
      let modifiedMessage = message;
      modifiedMessage = modifiedMessage.replace(
        /\b(https?:\/\/\S+|www\.\S+)\b/g,
        '<a class="text-blue-500 underline" href="$1" target="_blank">$1</a>'
      );
      if (userstate.emotes) {
        const emoteIds = Object.keys(userstate.emotes);
        emoteIds.forEach((emoteId) => {
          const emoteInstances = userstate.emotes[emoteId];

          emoteInstances.forEach((emoteInstance: any) => {
            const [start, end] = emoteInstance.split('-');
            const emoteCode = message.substring(parseInt(start, 10), parseInt(end, 10) + 1);
            const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`;
            modifiedMessage = `<div class="flex flex-row max-h-[24px] gap-1">${modifiedMessage.replace(
              emoteCode,
              `<img src='${emoteUrl}' /> `
            )}</ div>`;
          });
        });
      }
      modifiedMessage = modifiedMessage.replace(
        /(@\w+)/g,
        '<p class="inline-block px-1 rounded-lg bg-gray-400 text-center">$1</p>'
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        () => (
          <>
            <span className='flex items-center gap-1 '>
              {userstate.badges?.moderator && (
                <img
                  style={{ height: 18, width: 18 }}
                  src='https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1'
                />
              )}
              {userstate.badges?.partner && (
                <img
                  style={{ height: 18, width: 18 }}
                  src='https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/1'
                />
              )}
              {userstate.badges?.broadcaster && (
                <img
                  style={{ height: 18, width: 18 }}
                  src='https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1'
                />
              )}
              <p key={Date.now() + 1} style={{ color: `${userstate['color'] ?? '#00FF7F'}`, lineHeight: '25px' }}>
                {userstate['display-name']}:
              </p>
            </span>
            <span className='inline-block' dangerouslySetInnerHTML={{ __html: modifiedMessage }}></span>
          </>
        ),
      ]);
    };

    client.on('message', handleMessage);

    client.connect().then(() => {
      console.log(`Conectado ao chat do(a) ${channel}`);
    });

    return () => {
      client.removeListener('message', handleMessage);
      client.disconnect();
    };
  }, []);

  const messagesEndRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const bgSource = '/bg.png';
  return (
    <>
      <Image src={bgSource} fill alt='bg' style={{ display: 'absolute', zIndex: -1, opacity: 0.5 }} />
      <div className='min-h-screen min-w-screen'>
        <div className='flex flex-col items-center justify-center h-screen w-full'>
          <div className='h-3/4 w-3/4 border-solid rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border  border-gray-100'>
            <div className='py-2 flex fl  ex-row justify-center items-center'>
              <h1 className='text-purple-500 font-bold m-2 h-full '>Chat de {channel}</h1>
            </div>
            <div
              style={{ maxHeight: 'calc(100% - 57px)' }}
              className='flex flex-col gap-2 p-3 h-full overflow-y-scroll
          '>
              {messages.map((Message) => (
                <Message />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
