'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

      let modifiedMessage = message;

      if (userstate.emotes) {
        const emoteIds = Object.keys(userstate.emotes);

        emoteIds.forEach((emoteId) => {
          const emoteInstances = userstate.emotes[emoteId];

          emoteInstances.forEach((emoteInstance: any) => {
            const [start, end] = emoteInstance.split('-');
            const emoteCode = message.substring(parseInt(start, 10), parseInt(end, 10) + 1);
            const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`;
            modifiedMessage = `<span style="display: flex; flex-direction:row; gap: 5px;">${modifiedMessage.replace(
              emoteCode,
              `<img src='${emoteUrl}' /> `
            )}`;
          });
        });
      }
      modifiedMessage = modifiedMessage.replace(
        /(@\w+)/g,
        '<span style="background-color: grey;" class="p-1 rounded-lg">$1</span>'
      );
      modifiedMessage = modifiedMessage.replace(
        /\b(https?:\/\/\S+|www\.\S+)\b/g,
        '<a class="text-blue-500 underline" href="$1" target="_blank">$1</a>'
      );
      console.log(modifiedMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        () => (
          <div key={Date.now()} style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
            <span key={Date.now() + 1} style={{ color: `${userstate['color'] ?? '#00FF7F'}` }}>
              {userstate['display-name']}:
            </span>{' '}
            <span key={Date.now() + 2} dangerouslySetInnerHTML={{ __html: modifiedMessage }} />
          </div>
        ),
      ]);
    };

    // Adiciona o ouvinte de mensagem ao cliente
    client.on('message', handleMessage);

    // Conecta ao chat da Twitch
    client.connect().then(() => {
      console.log('Conectado ao chat da Twitch');
    });

    // Limpa a conexão quando o componente é desmontado
    return () => {
      client.removeListener('message', handleMessage);
      client.disconnect();
    };
  }, []);

  return (
    <div>
      <h1 className='text-red-500'>Chat da Twitch</h1>
      <div className='space-y-2'>
        {messages.map((Message, index) => (
          <Message />
        ))}
      </div>
    </div>
  );
};

export default Chat;
