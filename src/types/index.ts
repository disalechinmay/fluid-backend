export interface IUserBase {
  uid: string;
  email: string;
}

export interface IBroadcastMessage {
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  participants: IUserBase[];
}
