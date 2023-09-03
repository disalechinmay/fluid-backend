import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IBroadcastMessage } from '../types';
import { saveMessage } from '../utils/messages';

export const socketHandler = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: any
) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });

  socket.on('msg', (data: IBroadcastMessage) => {
    io.sockets.emit('brdcst-' + data.chatId, data);
    saveMessage(data.chatId, data.senderId, data.text, data.timestamp);
    data.participants.forEach((p) => {
      if (p.uid !== data.senderId) {
        io.sockets.emit('brdcst-' + p.uid, data);
      }
    });
  });
};
