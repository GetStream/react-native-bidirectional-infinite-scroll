// Generate random integer, we will use this to use random message from list of dummy messages.
export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

// Generate unique key for message component of FlatList.
export const generateUniqueKey = () =>
  `_${Math.random().toString(36).substr(2, 9)}`;

export type Message = {
  id: number;
  text: string;
  isMyMessage: boolean;
};

// Mocks the api call to query 'n' number of messages.
export const queryMoreMessages: (n: number, before: number | null, after: number | null) => Promise<Array<Message>> = (
  n,
  before,
  after
) => {
  return new Promise((resolve) => {
    const newMessages: Array<Message> = [];

    if (before !== null) {
      for (let i = before - n; i < before; i++) {
        const messageText = testMessages[getRandomInt(0, testMessages.length)];
        newMessages.push({
          id: i,
          text: messageText,
          isMyMessage: Boolean(getRandomInt(0, 2)), // Randomly assign true or false.
        });
      }
    } else if (after !== null) {
      for (let i = after + 1; i <= n + after; i++) {
        const messageText = testMessages[getRandomInt(0, testMessages.length)];
        newMessages.push({
          id: i,
          text: messageText,
          isMyMessage: Boolean(getRandomInt(0, 2)), // Randomly assign true or false.
        });
      }
    } else {
      for (let i = 0; i < n; i++) {
        const messageText = testMessages[getRandomInt(0, testMessages.length)];
        newMessages.push({
          id: i,
          text: messageText,
          isMyMessage: Boolean(getRandomInt(0, 2)), // Randomly assign true or false.
        });
      }
    }
      // Lets resolve after 500 ms, to simulate network latency.
      setTimeout(() => {
        resolve(newMessages);
      }, 2000);
  });
};

// List of test messages to generate chat data.
export const testMessages = [
  'Hey, where were you yesterday? I was trying to call you',
  'Yeah dude!! Had a really bad night. I was really hungover',
  'lol, thats so typical you. Who did you go out with?',
  'Dont even ask me about it, I am never going drink with Uthred again. That dude is a beast',
  'hahahaha, I can totally imagine!!',
  'Ciao :)',
];
