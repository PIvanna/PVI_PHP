// nodefile.js (СЕРВЕР)

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true, credentials: true })); // Дозволяє всі джерела, обережно в продакшені!


app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/mydb") // Ваш рядок підключення
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- СХЕМИ ---
const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, 
  recipient: { type: String, required: true }, 
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false } 
});
const Message = mongoose.model("Message", MessageSchema);

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: String, required: true }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
});
const Group = mongoose.model("Group", GroupSchema);

const GroupMessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const GroupMessage = mongoose.model("GroupMessage", GroupMessageSchema);

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }],
  lastActivity: { type: Date, default: Date.now },
});
ConversationSchema.index({ participants: 1 }, { unique: false });
const Conversation = mongoose.model("Conversation", ConversationSchema);

const UserConversationStatusSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  partnerId: { type: String, required: true, index: true },
  unreadCount: { type: Number, default: 0 },
  lastReadTimestamp: { type: Date, default: null },
  lastActivity: { type: Date, default: Date.now }, // Додано для сортування чатів
});
UserConversationStatusSchema.index({ userId: 1, partnerId: 1 }, { unique: true });
const UserConversationStatus = mongoose.model("UserConversationStatus", UserConversationStatusSchema);

const UserGroupStatusSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  unreadCount: { type: Number, default: 0 },
  lastReadTimestampInGroup: { type: Date, default: null },
  lastActivity: { type: Date, default: Date.now }, // Додано для сортування чатів
});
UserGroupStatusSchema.index({ userId: 1, groupId: 1 }, { unique: true });
const UserGroupStatus = mongoose.model("UserGroupStatus", UserGroupStatusSchema);

// --- ГЛОБАЛЬНІ ЗМІННІ ---
const onlineUsers = new Map();
const MAX_PREVIEWS_STORED_IN_DOM_SERVER = 3; 

// --- API ЕНДПОІНТИ ---

// Ендпоінт для отримання останніх прев'ю
app.get("/api/users/:username/latest-previews", async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "Ім'я користувача обов'язкове" });
    }
    const allUserMessagesForPreview = [];
    // 1. Останні приватні повідомлення
    const privateMessages = await Message.find({ recipient: username, sender: { $ne: username } })
      .sort({ timestamp: -1 })
      .limit(MAX_PREVIEWS_STORED_IN_DOM_SERVER * 2)
      .lean();

    privateMessages.forEach(msg => {
      allUserMessagesForPreview.push({
        type: "privateMessage",
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
      });
    });

    // 2. Останні групові повідомлення з груп, де користувач є учасником 
    const userGroups = await Group.find({ members: username }).select('_id name').lean();
    const groupIds = userGroups.map(g => g._id);

    if (groupIds.length > 0) {
      const groupMessages = await GroupMessage.find({ 
          groupId: { $in: groupIds },
          sender: { $ne: username } 
        })
        .sort({ timestamp: -1 })
        .limit(MAX_PREVIEWS_STORED_IN_DOM_SERVER * 2)
        .populate({ path: 'groupId', select: 'name _id' }) 
        .lean();

      groupMessages.forEach(msg => {
        if (msg.groupId && msg.groupId.name) { 
            allUserMessagesForPreview.push({
                type: "groupMessage",
                groupId: msg.groupId._id.toString(),
                groupName: msg.groupId.name,
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.timestamp.toISOString(),
            });
        }
      });
    }
    
    allUserMessagesForPreview.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestPreviews = allUserMessagesForPreview.slice(0, MAX_PREVIEWS_STORED_IN_DOM_SERVER);
    res.json(latestPreviews);

  } catch (error) {
    res.status(500).json({ message: "Помилка сервера при отриманні прев'ю", error: error.message });
  }
});


app.get("/messages/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    if (!user1 || !user2) {
      return res.status(400).json({ message: "Обидва імена користувачів обов'язкові" });
    }

    await UserConversationStatus.findOneAndUpdate(
        { userId: user1, partnerId: user2 },
        { unreadCount: 0, lastReadTimestamp: new Date() },
        { upsert: true, new: true }
    );
    
    const messages = await Message.find({
      $or: [ { sender: user1, recipient: user2 }, { sender: user2, recipient: user1 } ],
    }).sort({ timestamp: 1 }).limit(100);

    if (!messages || messages.length === 0) {
      console.log(`[API] Повідомлень між ${user1} та ${user2} не знайдено.`);
      return res.status(200).json([]); 
    }
    console.log(`[API] Знайдено ${messages.length} повідомлень між ${user1} та ${user2}.`);
    res.json(messages);
  } catch (error) {
    console.error("[API] Помилка отримання приватних повідомлень:", error);
    res.status(500).json({ message: "Помилка сервера при отриманні повідомлень", error: error.message });
  }
});

app.get("/group_messages/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;
        const requestingUser = req.headers['x-username']; 

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Неправильний формат ID групи" });
        }
        if (requestingUser) { 
            console.log(`[API] ${requestingUser} запитує історію для групи ${groupId}`);
            await UserGroupStatus.findOneAndUpdate(
                { userId: requestingUser, groupId: groupId },
                { unreadCount: 0, lastReadTimestampInGroup: new Date() },
                { upsert: true, new: true }
            );
        } else {
            console.warn(`[API /group_messages] Анонімний запит історії для групи ${groupId}`);
        }

        const messages = await GroupMessage.find({ groupId: groupId })
            .sort({ timestamp: 1 })
            .limit(100);
        
        if (!messages || messages.length === 0) {
          console.log(`[API] Повідомлень для групи ${groupId} не знайдено.`);
        } else {
          console.log(`[API] Знайдено ${messages.length} повідомлень для групи ${groupId}.`);
        }
        res.json(messages);
    } catch (error) {
        console.error("[API] Помилка отримання групових повідомлень:", error);
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});



// --- ДОПОМІЖНІ ФУНКЦІЇ ---
async function findOrCreateConversation(user1, user2) {
    const participantsArray = [user1, user2].sort();
    const now = new Date();
    let conversation = await Conversation.findOne({
        participants: { $all: participantsArray, $size: 2 } 
    });
    if (!conversation) {
        conversation = new Conversation({ participants: participantsArray, lastActivity: now });
        await conversation.save();
        console.log(`Створено нову розмову між ${user1} та ${user2}`);

        await UserConversationStatus.findOneAndUpdate(
            {userId: user1, partnerId: user2}, 
            {unreadCount: 0, lastActivity: now }, 
            {upsert: true}
        );
        await UserConversationStatus.findOneAndUpdate(
            {userId: user2, partnerId: user1}, 
            {unreadCount: 0, lastActivity: now }, 
            {upsert: true}
        );

    } else {
        conversation.lastActivity = now;
        await conversation.save();
        await UserConversationStatus.updateMany(
            { $or: [{userId: user1, partnerId: user2}, {userId: user2, partnerId: user1}] },
            { lastActivity: now }
        );
    }
    return conversation;
}

async function getUserChats(username) {
  console.log(`[getUserChats] Запит чатів для: ${username}`);
  const userChats = [];

  // Приватні чати
  const privateStatuses = await UserConversationStatus.find({ userId: username }).sort({ lastActivity: -1 });
  for (const status of privateStatuses) {
    userChats.push({
      type: "private",
      username: status.partnerId, 
      isOnline: onlineUsers.has(status.partnerId),
      lastActivity: status.lastActivity, 
      unreadCount: status.unreadCount
    });
  }

  // Групові чати
  const groupStatuses = await UserGroupStatus.find({ userId: username })
    .populate({ path: 'groupId', select: 'name lastActivity' }) 
    .sort({ lastActivity: -1 });

  for (const status of groupStatuses) {
    if (status.groupId) { 
        userChats.push({
            type: "group",
            id: status.groupId._id.toString(),
            name: status.groupId.name,
            lastActivity: status.lastActivity, 
            unreadCount: status.unreadCount
        });
    }
  }
  
  userChats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  console.log(`[getUserChats] Всього чатів для повернення ${username}: ${userChats.length}`);
  return userChats;
}

async function sendChatListToUser(username, wsClient) {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    try {
        const chatsArray = await getUserChats(username);
        wsClient.send(JSON.stringify({ type: "userList", chats: chatsArray }));
        console.log(`Надіслано список чатів до ${username}: ${chatsArray.length} чатів.`);
    } catch (error) {
        console.error(`Помилка надсилання списку чатів до ${username}:`, error);
    }
  }
}

async function notifyContactsOfStatusChange(username, isOnline) {
    const conversations = await Conversation.find({ participants: username });
    const involvedUsernames = new Set();
    conversations.forEach(conv => {
        conv.participants.forEach(p => {
            if (p !== username) involvedUsernames.add(p);
        });
    });
    const userGroups = await Group.find({ members: username });
    userGroups.forEach(group => {
        group.members.forEach(m => {
            if (m !== username) involvedUsernames.add(m);
        });
    });

    for (const contactUsername of involvedUsernames) {
        const contactWs = onlineUsers.get(contactUsername);
        if (contactWs) {
            await sendChatListToUser(contactUsername, contactWs);
        }
    }
}

// --- WEBSOCKET СЕРВЕР ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  let currentUsername = null;

  ws.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      console.log(`Отримано від ${currentUsername || 'Гість'} (${ws._socket.remoteAddress}): Тип: ${parsedMessage.type}, Дані:`, JSON.stringify(parsedMessage, null, 2));


      if (parsedMessage.type === "register") {
        const username = parsedMessage.username;
        if (username && typeof username === 'string' && username.trim() !== "") {
          if (onlineUsers.has(username)) {
            console.warn(`Користувач ${username} вже онлайн. Оновлення WebSocket з'єднання.`);
            const oldWs = onlineUsers.get(username);
            if (oldWs && oldWs !== ws) {
                oldWs.close(1011, "Нове з'єднання для цього користувача встановлено.");
            }
            onlineUsers.set(username, ws); 
            currentUsername = username; 
            ws.send(JSON.stringify({ type: "registered", username: currentUsername }));
            await sendChatListToUser(currentUsername, ws);
            await notifyContactsOfStatusChange(currentUsername, true); 
          } else {
            currentUsername = username;
            onlineUsers.set(currentUsername, ws);
            ws.send(JSON.stringify({ type: "registered", username: currentUsername }));
            await sendChatListToUser(currentUsername, ws);
            await notifyContactsOfStatusChange(currentUsername, true);
            console.log(`Користувач зареєстрований: ${currentUsername}. Всього онлайн: ${onlineUsers.size}`);
          }
        } else {
             ws.send(JSON.stringify({ type: 'error', text: 'Неправильне або порожнє ім\'я користувача для реєстрації.' }));
             ws.close(1008, "Invalid username"); 
        }
      } else if (!currentUsername) {
        console.warn("Отримано повідомлення від незареєстрованого WebSocket з'єднання. Тип:", parsedMessage.type);
        return ws.send(JSON.stringify({ type: 'error', text: 'Користувач не зареєстрований для цього з\'єднання. Спочатку надішліть "register".' }));
      }
      else if (parsedMessage.type === "ensurePrivateChat") { 
        const { partner } = parsedMessage;
        if (!partner || typeof partner !== 'string' || partner.trim() === "") {
          console.error(`[ensurePrivateChat] Помилка: Не вказано або невірний партнер. Отримано: ${partner}`);
          return ws.send(JSON.stringify({ type: 'error', text: 'Не вказано або невірний партнер для приватного чату.'}));
        }
        if (partner === currentUsername) {
          console.warn(`[ensurePrivateChat] ${currentUsername} намагається створити чат із самим собою.`);
          return ws.send(JSON.stringify({ type: 'error', text: 'Неможливо створити чат із самим собою.'}));
        }

        console.log(`[WebSocket ensurePrivateChat] ${currentUsername} забезпечує приватний чат з ${partner}`);
        
        try {
            await findOrCreateConversation(currentUsername, partner);
            
            await sendChatListToUser(currentUsername, ws);
            const partnerWs = onlineUsers.get(partner);
            if (partnerWs) {
              await sendChatListToUser(partner, partnerWs);
            }
            console.log(`[ensurePrivateChat] Приватний чат між ${currentUsername} та ${partner} забезпечено/перевірено.`);
        } catch (dbError) {
            console.error(`[ensurePrivateChat] Помилка бази даних при забезпеченні чату між ${currentUsername} та ${partner}:`, dbError);
            ws.send(JSON.stringify({ type: 'error', text: 'Помилка сервера при створенні/перевірці приватного чату.' }));
        }

      } else if (parsedMessage.type === "privateMessage") {
        const { recipient, text } = parsedMessage;
        if (!recipient || !text || typeof recipient !== 'string' || recipient.trim() === "" || typeof text !== 'string' || text.trim() === "") {
            console.error(`[privateMessage] Помилка: Немає отримувача або тексту. Recipient: ${recipient}, Text: ${text ? 'є' : 'немає'}`);
            return ws.send(JSON.stringify({ type: 'error', text: 'Повідомлення не має отримувача або тексту, або вони некоректні.'}));
        }

        const newMessage = new Message({ sender: currentUsername, recipient, text });
        await newMessage.save();
        console.log(`[privateMessage] Повідомлення від ${currentUsername} до ${recipient} збережено.`);
        
        const conversation = await findOrCreateConversation(currentUsername, recipient); 
 

        console.log(`[privateMessage] Оновлено lastActivity для розмови між ${currentUsername} та ${recipient}.`);

        await UserConversationStatus.findOneAndUpdate(
            { userId: recipient, partnerId: currentUsername },
            { $inc: { unreadCount: 1 }, lastActivity: newMessage.timestamp }, 
            { upsert: true }
        );
        console.log(`[privateMessage] Оновлено unreadCount для ${recipient} (від ${currentUsername}).`);
        
        const messageData = { 
            type: "privateMessage", 
            sender: currentUsername, 
            recipient, 
            text: newMessage.text, 
            timestamp: newMessage.timestamp.toISOString()
        };
        
        const recipientWs = onlineUsers.get(recipient);
        if (recipientWs) {
          recipientWs.send(JSON.stringify(messageData));
          console.log(`[privateMessage] Надіслано повідомлення до ${recipient} (онлайн).`);
          await sendChatListToUser(recipient, recipientWs); 
        } else {
          console.log(`[privateMessage] Отримувач ${recipient} не онлайн. Повідомлення збережено.`);
        }
        
        await UserConversationStatus.findOneAndUpdate(
            { userId: currentUsername, partnerId: recipient },
            { unreadCount: 0, lastReadTimestamp: new Date(), lastActivity: newMessage.timestamp }, 
            { upsert: true }
        );
        console.log(`[privateMessage] Чат позначено як прочитаний для ${currentUsername} (з ${recipient}).`);
        await sendChatListToUser(currentUsername, ws);

      } else if (parsedMessage.type === "createGroupChat") {
        const { groupName, members } = parsedMessage; 
        if (!groupName || typeof groupName !== 'string' || groupName.trim() === "" || 
            !members || !Array.isArray(members) || members.length === 0) {
            console.error(`[createGroupChat] Помилка: Не вказано назву групи або учасників. Name: ${groupName}, Members: ${members}`);
            return ws.send(JSON.stringify({ type: 'error', text: 'Не вказано назву групи або учасників, або вони некоректні.'}));
        }
        if (members.some(m => typeof m !== 'string' || m.trim() === "")) {
            console.error(`[createGroupChat] Помилка: Некоректні імена учасників у списку: ${members}`);
            return ws.send(JSON.stringify({ type: 'error', text: 'Список учасників містить некоректні імена.' }));
        }

        const uniqueMembers = [...new Set(members.map(m => String(m).trim()))]; 
        if (!uniqueMembers.includes(currentUsername)) {
            uniqueMembers.push(currentUsername);
        }
        
        const now = new Date();
        const newGroup = new Group({ name: groupName.trim(), members: uniqueMembers, createdBy: currentUsername, createdAt: now, lastActivity: now });
        await newGroup.save();
        console.log(`[createGroupChat] Групу "${newGroup.name}" створено користувачем ${currentUsername}. ID: ${newGroup._id}`);

        for (const member of uniqueMembers) {
            await UserGroupStatus.findOneAndUpdate(
                { userId: member, groupId: newGroup._id },
                { unreadCount: (member === currentUsername ? 0 : 1), 
                  lastReadTimestampInGroup: (member === currentUsername ? now : null),
                  lastActivity: now }, 
                { upsert: true }
            );
        }
        console.log(`[createGroupChat] Ініціалізовано UserGroupStatus для учасників групи "${newGroup.name}".`);

        const groupDataForClient = { id: newGroup._id.toString(), name: newGroup.name, members: newGroup.members };
        for (const memberUsername of newGroup.members) {
          const memberWs = onlineUsers.get(memberUsername);
          if (memberWs) {
            memberWs.send(JSON.stringify({ type: "groupCreated", group: groupDataForClient }));
            await sendChatListToUser(memberUsername, memberWs);
          }
        }
        console.log(`[createGroupChat] Сповіщення про створення групи "${newGroup.name}" надіслано учасникам.`);

      } else if (parsedMessage.type === "groupMessage") {
        const { groupId, text } = parsedMessage;
        if (!groupId || !text || typeof groupId !== 'string' || groupId.trim() === "" || typeof text !== 'string' || text.trim() === "") {
            console.error(`[groupMessage] Помилка: Не вказано ID групи або текст. GroupID: ${groupId}, Text: ${text ? 'є' : 'немає'}`);
            return ws.send(JSON.stringify({ type: 'error', text: 'Не вказано ID групи або текст повідомлення, або вони некоректні.'}));
        }
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
             console.error(`[groupMessage] Помилка: Неправильний формат ID групи: ${groupId}`);
             return ws.send(JSON.stringify({ type: 'error', text: 'Неправильний формат ID групи.'}));
        }

        const group = await Group.findById(groupId);
        if (group && group.members.includes(currentUsername)) {
          const newGroupMessage = new GroupMessage({ groupId: group._id, sender: currentUsername, text });
          await newGroupMessage.save();
          console.log(`[groupMessage] Повідомлення від ${currentUsername} в групу "${group.name}" (ID: ${group._id}) збережено.`);
          
          const now = newGroupMessage.timestamp;
          group.lastActivity = now;
          await group.save();
          console.log(`[groupMessage] Оновлено lastActivity для групи "${group.name}".`);

          const messageData = { 
              type: "groupMessage", 
              groupId: group._id.toString(), 
              groupName: group.name, 
              sender: currentUsername, 
              text: newGroupMessage.text, 
              timestamp: now.toISOString() 
          };
          
          for (const memberUsername of group.members) {
            if (memberUsername === currentUsername) {
                await UserGroupStatus.findOneAndUpdate(
                    { userId: currentUsername, groupId: group._id },
                    { unreadCount: 0, lastReadTimestampInGroup: now, lastActivity: now },
                    { upsert: true }
                );
            } else {
                await UserGroupStatus.findOneAndUpdate(
                    { userId: memberUsername, groupId: group._id },
                    { $inc: { unreadCount: 1 }, lastActivity: now },
                    { upsert: true }
                );
            }
            const memberWs = onlineUsers.get(memberUsername);
            if (memberWs) {
              memberWs.send(JSON.stringify(messageData));
              await sendChatListToUser(memberUsername, memberWs);
            }
          }
          console.log(`[groupMessage] Повідомлення в групі "${group.name}" надіслано учасникам.`);
        } else {
            console.warn(`[groupMessage] ${currentUsername} не є учасником групи ${groupId} або група не існує.`);
            ws.send(JSON.stringify({ type: 'error', text: 'Ви не є учасником цієї групи або група не існує.'}));
        }
      } else if (parsedMessage.type === "markChatAsRead") {
        const { chatId, chatType } = parsedMessage;        
        if (!chatId || !chatType || typeof chatId !== 'string' || chatId.trim() === "" || typeof chatType !== 'string' || chatType.trim() === "") {
            console.error(`[markChatAsRead] Помилка: Не вказано chatId або chatType. ChatID: ${chatId}, ChatType: ${chatType}`);
            return ws.send(JSON.stringify({ type: 'error', text: 'Не вказано chatId або chatType, або вони некоректні.'}));
        }
        console.log(`[WebSocket markChatAsRead] ${currentUsername} позначив ${chatType} чат ${chatId} як прочитаний.`);
        const now = new Date();
        if (chatType === "private") {
            await UserConversationStatus.findOneAndUpdate(
                { userId: currentUsername, partnerId: chatId },
                { unreadCount: 0, lastReadTimestamp: now }, // lastActivity тут не оновлюємо, бо це дія користувача, а не нове повідомлення
                { upsert: true }
            );
        } else if (chatType === "group") {
            if (!mongoose.Types.ObjectId.isValid(chatId)) {
                 console.error(`[markChatAsRead] Помилка: Неправильний формат ID групи: ${chatId}`);
                 return ws.send(JSON.stringify({ type: 'error', text: 'Неправильний формат ID групи.'}));
            }
            await UserGroupStatus.findOneAndUpdate(
                { userId: currentUsername, groupId: chatId },
                { unreadCount: 0, lastReadTimestampInGroup: now }, // Аналогічно, lastActivity не чіпаємо
                { upsert: true }
            );
        }
        await sendChatListToUser(currentUsername, ws); 
        console.log(`[markChatAsRead] Оновлено список чатів для ${currentUsername} після позначення як прочитаний.`);
      } else {
        console.warn(`[WebSocket] Отримано невідомий тип повідомлення від ${currentUsername}: ${parsedMessage.type}`);
        ws.send(JSON.stringify({ type: 'error', text: `Невідомий тип повідомлення: ${parsedMessage.type}` }));
      }

    } catch (error) {
      console.error(`Помилка обробки повідомлення від ${currentUsername || 'Гість'}:`, error);
      if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'error', text: 'Помилка на сервері при обробці вашого запиту.'}));
      }
    }
  });

  ws.on("close", async (code, reason) => {
    const reasonString = reason instanceof Buffer ? reason.toString() : reason;
    console.log(`WebSocket з'єднання закрито. Користувач: ${currentUsername || 'невідомий'}, Код: ${code}, Причина: ${reasonString || 'не вказана'}`);
    if (currentUsername) {
      let isTrulyOffline = true;
      for (const [user, clientWs] of onlineUsers.entries()) {
          if (user === currentUsername && clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
              isTrulyOffline = false;
              break;
          }
      }
      if (onlineUsers.get(currentUsername) === ws) {
          onlineUsers.delete(currentUsername);
      }


      if (isTrulyOffline || !onlineUsers.has(currentUsername)) {
        await notifyContactsOfStatusChange(currentUsername, false);
        console.log(`Користувач ${currentUsername} вважається офлайн. Всього онлайн: ${onlineUsers.size}`);
      } else {
        console.log(`Користувач ${currentUsername} все ще має активні з'єднання.`);
      }
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket помилка для ${currentUsername || 'невідомий користувач'}:`, error);
    if (currentUsername && onlineUsers.get(currentUsername) === ws) { 
        onlineUsers.delete(currentUsername);
        notifyContactsOfStatusChange(currentUsername, false)
            .catch(e => console.error("Помилка сповіщення контактів при помилці WebSocket з'єднання:", e));
        console.log(`Користувач ${currentUsername} видалений з онлайн через помилку WebSocket. Всього онлайн: ${onlineUsers.size}`);
    }
  });
});

const NODE_JS_PORT = 3001; 
server.listen(NODE_JS_PORT, '0.0.0.0', () => { 
  console.log(`Node.js CHAT Server запущено на http://localhost:${NODE_JS_PORT} (і на всіх мережевих інтерфейсах)`);
});