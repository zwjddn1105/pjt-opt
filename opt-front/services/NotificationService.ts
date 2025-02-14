import * as Notifications from 'expo-notifications';

export const handleNewMessage = async (message: ChatMessage) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '새로운 메시지 도착 📩',
      body: message.content,
    },
    trigger: null,
  });
};
