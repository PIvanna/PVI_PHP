const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const userListUl = document.getElementById("userList");
const chatPartnerNameEl = document.getElementById("chatPartnerName");
const usernamePlaceholderEl = document.getElementById("usernamePlaceholder");
const currentUserDisplayDiv = document.getElementById("currentUserDisplay");

let myUsername = "";
let activeChatPartner = null; 
let activeChatType = "private"; 


const newChatRoomButton = document.getElementById("newChatRoomButton");
const newUserChatModal = document.getElementById("newUserChatModal");
const closeModalButton = newUserChatModal
  ? newUserChatModal.querySelector(".close-modal-button")
  : null;
const searchUserInput = document.getElementById("searchUserInput");
const modalTeacherList = document.getElementById("modalTeacherList");
const modalStudentList = document.getElementById("modalStudentList");
const chatGroupNameInput = document.getElementById("chatGroupName");
const createChatOrGroupButton = document.getElementById(
  "createChatOrGroupButton"
);

window.currentActiveChatInfo = null;
const USERS_API_URL = "/Project/public/api/users.php";

function getChatUsernameOnMessagePage() {
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  if (storedUser && storedUser.name) {
    return `${storedUser.name} ${storedUser.surname || ""}`.trim();
  }
  console.warn(
    "Неможливо отримати ім'я користувача на сторінці повідомлень! Використовується 'UnknownUser'."
  );
  return "UnknownUser";
}

// --- Обробники подій від WebSocket (через header.js) ---
document.addEventListener("socketregistered", (event) => {
  console.log(
    "[Message.js Event] Socket registered for user:",
    event.detail.username,
    "on messages page."
  );
  const attemptRedirect = () => {
    const redirectToChatType = sessionStorage.getItem("redirectToChatType");
    const redirectToChatId = sessionStorage.getItem("redirectToChatId");
    const redirectToChatName = sessionStorage.getItem("redirectToChatName");
    if (redirectToChatType && redirectToChatId) {
      if (userListUl && userListUl.children.length > 0) {
        selectChatPartner(
          redirectToChatId,
          redirectToChatType,
          redirectToChatName
        );
        sessionStorage.removeItem("redirectToChatType");
        sessionStorage.removeItem("redirectToChatId");
        sessionStorage.removeItem("redirectToChatName");
        return true;
      }
      return false;
    }
    if (!activeChatPartner) {
      if (messageInput) messageInput.disabled = true;
      if (sendButton) sendButton.disabled = true;
    }
    return true;
  };
  if (!attemptRedirect()) {
    const onUserListUpdatedForRedirect = () => {
      document.removeEventListener(
        "userlistupdated",
        onUserListUpdatedForRedirect
      );
      attemptRedirect();
    };
    document.addEventListener("userlistupdated", onUserListUpdatedForRedirect);
    setTimeout(() => {
      document.removeEventListener(
        "userlistupdated",
        onUserListUpdatedForRedirect
      );
      if (sessionStorage.getItem("redirectToChatType")) attemptRedirect();
    }, 3500);
  }
});

document.addEventListener("chatmessage", (event) => {
  const data = event.detail;
  console.log("[Message.js Event] Received 'chatmessage':", data);
  handleIncomingMessage(data);
});

document.addEventListener("groupcreated", (event) => {
  console.log(
    "[Message.js Event] Received 'groupcreated', userList should update."
  );
});

document.addEventListener("userlistupdated", (event) => {
  const chats = event.detail.chats;
  console.log(
    "[Message.js Event] Received 'userlistupdated':",
    chats ? chats.length : 0,
    "chats"
  );
  updateUserList(chats);
});

// --- Функції для модального вікна створення чату --- (без змін, якщо вони працювали)
function openNewUserChatModal() {
  if (!newUserChatModal) return;
  newUserChatModal.style.display = "block";
  if (searchUserInput) searchUserInput.value = "";
  if (chatGroupNameInput) chatGroupNameInput.value = "";
  loadUsersForModal();
  if (createChatOrGroupButton) updateCreateButtonState();
}
function closeNewUserChatModal() {
  if (!newUserChatModal) return;
  newUserChatModal.style.display = "none";
  if (modalTeacherList) modalTeacherList.innerHTML = "";
  if (modalStudentList) modalStudentList.innerHTML = "";
  const checkboxes = newUserChatModal.querySelectorAll(
    'input[type="checkbox"]'
  );
  checkboxes.forEach((cb) => (cb.checked = false));
  if (createChatOrGroupButton) updateCreateButtonState();
}
async function loadUsersForModal() {
  if (modalTeacherList) modalTeacherList.innerHTML = "<li>Завантаження...</li>";
  if (modalStudentList) modalStudentList.innerHTML = "<li>Завантаження...</li>";
  try {
    const response = await fetch(USERS_API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.success) {
      if (modalTeacherList)
        populateUserListInModal(data.teachers, modalTeacherList, "teacher");
      if (modalStudentList)
        populateUserListInModal(data.students, modalStudentList, "student");
    } else {
      throw new Error(data.message || "Не вдалося завантажити користувачів");
    }
  } catch (error) {
    console.error("Error loading users for modal:", error);
    if (modalTeacherList)
      modalTeacherList.innerHTML = "<li>Помилка завантаження.</li>";
    if (modalStudentList)
      modalStudentList.innerHTML = "<li>Помилка завантаження.</li>";
  }
}
function populateUserListInModal(users, listElement, role) {
  listElement.innerHTML = "";
  if (users && users.length > 0) {
    users.forEach((user) => {
      const userFullName = `${user.name} ${user.surname}`;
      if (userFullName === myUsername) return;
      const listItem = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = userFullName;
      checkbox.dataset.userId = user.id;
      checkbox.id = `user-checkbox-${user.id}`;
      checkbox.addEventListener("change", updateCreateButtonState);
      const wrapper = document.createElement("label");
      wrapper.classList.add("user-info-wrapper");
      wrapper.htmlFor = `user-checkbox-${user.id}`;
      const avatar = document.createElement("div");
      avatar.classList.add("avatar-placeholder");
      avatar.textContent = generateAvatarPlaceholder(userFullName);
      const userInfo = document.createElement("div");
      userInfo.classList.add("user-info");
      const userNameSpan = document.createElement("span");
      userNameSpan.textContent = userFullName;
      const userRoleSpan = document.createElement("span");
      userRoleSpan.classList.add("user-role");
      userRoleSpan.textContent =
        role === "teacher" ? "Викладач" : `Студент (${user.group || "N/A"})`;
      userInfo.appendChild(userNameSpan);
      userInfo.appendChild(userRoleSpan);
      wrapper.appendChild(avatar);
      wrapper.appendChild(userInfo);
      listItem.appendChild(checkbox);
      listItem.appendChild(wrapper);
      listElement.appendChild(listItem);
    });
  } else {
    listElement.innerHTML = `<li>Немає ${
      role === "teacher" ? "викладачів" : "студентів"
    }.</li>`;
  }
}
function filterUsersInModal() {
  if (!searchUserInput || !newUserChatModal) return;
  const searchTerm = searchUserInput.value.toLowerCase();
  const allUserItems = newUserChatModal.querySelectorAll(".modal-user-list li");
  allUserItems.forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox) {
      item.style.display =
        item.textContent.toLowerCase().includes(searchTerm) || searchTerm === ""
          ? "flex"
          : "none";
      return;
    }
    item.style.display = checkbox.value.toLowerCase().includes(searchTerm)
      ? "flex"
      : "none";
  });
}
function getSelectedUsersFromModal() {
  if (!newUserChatModal) return [];
  const selectedUsers = [];
  const checkboxes = newUserChatModal.querySelectorAll(
    '.modal-user-list input[type="checkbox"]:checked'
  );
  checkboxes.forEach((cb) =>
    selectedUsers.push({ username: cb.value, id: cb.dataset.userId })
  );
  return selectedUsers;
}
function updateCreateButtonState() {
  if (!createChatOrGroupButton) return;
  createChatOrGroupButton.disabled = getSelectedUsersFromModal().length === 0;
}
function handleCreateChatOrGroup() {
  const selectedUsers = getSelectedUsersFromModal();
  const groupName = chatGroupNameInput ? chatGroupNameInput.value.trim() : "";
  if (selectedUsers.length === 0) {
    alert("Будь ласка, оберіть хоча б одного користувача.");
    return;
  }

  if (selectedUsers.length === 1 && !groupName) {
    const partnerUsername = selectedUsers[0].username;
    console.log(`[Message.js] Спроба створити/відкрити приватний чат з: ${partnerUsername}`);
    if (
      window.globalSocket &&
      window.globalSocket.readyState === WebSocket.OPEN
    ) {
      window.globalSocket.send(
        JSON.stringify({
          type: "ensurePrivateChat", 
          partner: partnerUsername,
        })
      );      
      selectChatPartner(partnerUsername, "private"); 
    } else {
      alert("Немає з'єднання з сервером чату.");
    }
  } else { 
    if (!groupName && selectedUsers.length > 1) {
      alert("Будь ласка, введіть назву для групи.");
      if (chatGroupNameInput) chatGroupNameInput.focus();
      return;
    }
    const memberUsernames = selectedUsers.map((u) => u.username);
    if (
      window.globalSocket &&
      window.globalSocket.readyState === WebSocket.OPEN
    ) {
      window.globalSocket.send(
        JSON.stringify({
          type: "createGroupChat",
          groupName: groupName,
          members: [...memberUsernames, myUsername], 
        })
      );
    } else {
      alert("Немає з'єднання з сервером чату.");
    }
  }
  closeNewUserChatModal();
}

// --- Основні функції чату ---
function handleIncomingMessage(data) {
  const isPrivate = data.type === "privateMessage";
  const isGroup = data.type === "groupMessage";
  let isForActiveChat = false;

  if (window.currentActiveChatInfo) {
    if (
      isPrivate &&
      window.currentActiveChatInfo.type === "private" &&
      String(data.sender) === String(window.currentActiveChatInfo.id) &&
      String(data.recipient) === String(myUsername)
    ) {
      isForActiveChat = true;
    } else if (
      isGroup &&
      window.currentActiveChatInfo.type === "group" &&
      String(data.groupId) === String(window.currentActiveChatInfo.id)
    ) {
      isForActiveChat = true;
    }
  }

  if (isForActiveChat) {
    displayMessage(data);

  } else {

    console.log(
      `[Message.js] Incoming message for inactive chat or different user. Type: ${
        data.type
      }, Sender/GroupID: ${data.sender || data.groupId}`
    );
  }
}

function generateAvatarPlaceholder(nameOrId) {
  if (!nameOrId) return "??";
  let text = String(nameOrId);
  const parts = text.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1])
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  if (parts.length > 0 && parts[0])
    return parts[0].substring(0, 2).toUpperCase();
  return text.substring(0, 2).toUpperCase();
}

function updateUserList(chats) {
  if (!userListUl) return;
  const currentActiveChatId = activeChatPartner; 
  const currentActiveType = activeChatType;
  userListUl.innerHTML = "";
  let activeChatStillExists = false;

  if (chats && chats.length > 0) {
    chats.forEach((chat) => {
      if (chat.type === "private" && chat.username === myUsername) return;

      const listItem = document.createElement("li");
      listItem.dataset.chatType = chat.type;

      const avatarDiv = document.createElement("div");
      avatarDiv.classList.add("avatar");
      const nameSpan = document.createElement("span");
      nameSpan.classList.add("chat-name");

      if (chat.type === "private") {
        listItem.dataset.username = chat.username;
        avatarDiv.textContent = generateAvatarPlaceholder(chat.username);
        nameSpan.textContent = chat.username;
        const statusIndicator = document.createElement("span");
        statusIndicator.classList.add(
          "status-indicator",
          chat.isOnline ? "online" : "offline"
        );
        statusIndicator.title = chat.isOnline ? "Онлайн" : "Офлайн";
        nameSpan.appendChild(statusIndicator);
        if (
          String(chat.username) === String(currentActiveChatId) &&
          currentActiveType === "private"
        ) {
          listItem.classList.add("active");
          activeChatStillExists = true;
        }
        listItem.addEventListener("click", () =>
          selectChatPartner(chat.username, "private")
        );
      } else if (chat.type === "group") {
        listItem.dataset.chatId = chat.id;
        listItem.dataset.chatName = chat.name;
        avatarDiv.textContent = generateAvatarPlaceholder(
          chat.name ? chat.name[0] : "G"
        );
        nameSpan.textContent = chat.name;
        if (
          String(chat.id) === String(currentActiveChatId) &&
          currentActiveType === "group"
        ) {
          listItem.classList.add("active");
          activeChatStillExists = true;
        }
        listItem.addEventListener("click", () =>
          selectChatPartner(chat.id, "group", chat.name)
        );
      }

      if (chat.unreadCount && chat.unreadCount > 0) {
        let badge = listItem.querySelector(".notification-badge");
        if (!badge) {
          badge = document.createElement("span");
          badge.classList.add("notification-badge");
          const statusIndicator = nameSpan.querySelector(".status-indicator");
          if (statusIndicator)
            nameSpan.insertBefore(
              badge,
              statusIndicator.nextSibling
            ); // після індикатора
          else nameSpan.appendChild(badge);
        }
        badge.textContent =
          chat.unreadCount > 9 ? "9+" : chat.unreadCount.toString();
        listItem.style.fontWeight = "bold";
      } else {
        const existingBadge = listItem.querySelector(".notification-badge");
        if (existingBadge) existingBadge.remove();
        listItem.style.fontWeight = "normal";
      }

      listItem.appendChild(avatarDiv);
      listItem.appendChild(nameSpan);
      userListUl.appendChild(listItem);
    });
  }

  if (!activeChatStillExists && activeChatPartner) {
    activeChatPartner = null;
    activeChatType = "private";
    window.currentActiveChatInfo = null;
    if (chatPartnerNameEl) chatPartnerNameEl.textContent = "Оберіть чат";
    if (messagesDiv) messagesDiv.innerHTML = "";
    if (messageInput) {
      messageInput.disabled = true;
      messageInput.placeholder = "Введіть повідомлення...";
    }
    if (sendButton) sendButton.disabled = true;
  }
}

async function selectChatPartner(
  partnerId,
  type = "private",
  partnerDisplayName = null
) {
  const effectiveDisplayName =
    type === "group" && partnerDisplayName ? partnerDisplayName : partnerId;
  const newActiveChatInfo = {
    id: partnerId,
    type: type,
    name: effectiveDisplayName,
  };

  if (
    window.currentActiveChatInfo &&
    String(window.currentActiveChatInfo.id) === String(newActiveChatInfo.id) &&
    window.currentActiveChatInfo.type === newActiveChatInfo.type &&
    messageInput &&
    !messageInput.disabled
  ) {
    if (messageInput) messageInput.focus();
    return;
  }

  console.log(`[Message.js] Selecting chat: ID='${partnerId}', Type='${type}'`);
  window.currentActiveChatInfo = newActiveChatInfo;
  activeChatPartner = partnerId;
  activeChatType = type;

  if (chatPartnerNameEl) chatPartnerNameEl.textContent = effectiveDisplayName;
  if (messagesDiv) messagesDiv.innerHTML = "";
  if (messageInput) {
    messageInput.disabled = false;
    messageInput.placeholder = `Повідомлення до ${effectiveDisplayName}...`;
    setTimeout(() => {
      if (messageInput) messageInput.focus();
    }, 0);
  }
  if (sendButton) sendButton.disabled = false;

  if (
    window.globalSocket &&
    window.globalSocket.readyState === WebSocket.OPEN
  ) {
    console.log(
      `[Message.js] Sending markChatAsRead for ${type} chat ID: ${partnerId}`
    );
    window.globalSocket.send(
      JSON.stringify({
        type: "markChatAsRead",
        chatId: partnerId,
        chatType: type,
      })
    );
  }

  if (userListUl) {
    Array.from(userListUl.children).forEach((li) => {
      const liType = li.dataset.chatType;
      const liId =
        liType === "private" ? li.dataset.username : li.dataset.chatId;
      const isNowActive = String(liId) === String(partnerId) && liType === type;
      li.classList.toggle("active", isNowActive);
      if (isNowActive) {
        li.style.fontWeight = "normal";
        const badge = li.querySelector(".notification-badge");
        if (badge) badge.remove(); // Миттєво прибираємо, сервер оновить userList
      }
    });
  }

  const fetchOptions = {};
  let historyUrl;
  const serverHost =
    window.GLOBAL_NODE_JS_SERVER_HOST || window.location.hostname; // З header.js
  const serverPort = window.GLOBAL_NODE_JS_SERVER_PORT || 3001; // З header.js

  if (type === "private") {
    historyUrl = `http://${serverHost}:${serverPort}/messages/${myUsername}/${partnerId}`;
  } else {
    historyUrl = `http://${serverHost}:${serverPort}/group_messages/${partnerId}`;
    fetchOptions.headers = { "x-username": myUsername }; // Передаємо для оновлення статусу на сервері
  }

  try {
    const response = await fetch(historyUrl, fetchOptions);
    if (!response.ok) {
      if (response.status === 404 || response.status === 200) {
        // 200 з порожнім масивом теж ок
        const data = await response.json();
        if (Array.isArray(data) && data.length === 0) {
          if (messagesDiv)
            messagesDiv.innerHTML =
              '<div class="system-message">Повідомлень ще немає.</div>';
        } else if (response.status === 404) {
          // Строго 404
          if (messagesDiv)
            messagesDiv.innerHTML =
              '<div class="system-message">Історія чату не знайдена.</div>';
        } else {
          // 200 з даними
          data.forEach((msg) => displayMessage(msg));
        }
      } else {
        throw new Error(
          `HTTP error! status: ${
            response.status
          }, message: ${await response.text()}`
        );
      }
    } else {
      const history = await response.json();
      if (history.length === 0) {
        if (messagesDiv)
          messagesDiv.innerHTML =
            '<div class="system-message">Повідомлень ще немає.</div>';
      } else {
        history.forEach((msg) => displayMessage(msg));
      }
    }
    if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (error) {
    console.error("Не вдалося завантажити історію чату:", error);
    if (messagesDiv)
      displaySystemMessage(
        "Не вдалося завантажити історію чату. " + error.message
      );
  }
}

function displayMessage(data) {
  if (!messagesDiv) return;
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "message",
    data.sender === myUsername ? "my-message" : "other-message"
  );
  const meta = document.createElement("span");
  meta.classList.add("message-meta");
  const timeString = new Date(data.timestamp).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  meta.textContent =
    (data.type === "groupMessage" && data.sender !== myUsername) ||
    (data.type === "privateMessage" && data.sender !== myUsername)
      ? `${data.sender} - ${timeString}`
      : timeString;
  const textDiv = document.createElement("div");
  textDiv.textContent = data.text;
  messageElement.appendChild(meta);
  messageElement.appendChild(textDiv);
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function displaySystemMessage(text) {
  if (!messagesDiv) return;
  const messageElement = document.createElement("div");
  messageElement.classList.add("system-message");
  messageElement.textContent = text;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
  if (
    !messageInput ||
    !window.globalSocket ||
    window.globalSocket.readyState !== WebSocket.OPEN
  ) {
    console.warn("SendMessage: WebSocket не доступний.");
    if (messagesDiv)
      displaySystemMessage(
        !window.globalSocket
          ? "Немає з'єднання."
          : "З'єднання встановлюється..."
      );
    return;
  }
  const text = messageInput.value.trim();
  if (text && activeChatPartner) {
    const timestamp = new Date().toISOString();
    let messagePayload, messageForDisplay;
    if (activeChatType === "private") {
      messagePayload = {
        type: "privateMessage",
        recipient: activeChatPartner,
        text: text,
      };
      messageForDisplay = {
        type: "privateMessage",
        sender: myUsername,
        recipient: activeChatPartner,
        text: text,
        timestamp: timestamp,
      };
    } else {
      messagePayload = {
        type: "groupMessage",
        groupId: activeChatPartner,
        text: text,
      };
      messageForDisplay = {
        type: "groupMessage",
        sender: myUsername,
        groupId: activeChatPartner,
        text: text,
        timestamp: timestamp,
        groupName: window.currentActiveChatInfo.name,
      };
    }
    displayMessage(messageForDisplay);
    window.globalSocket.send(JSON.stringify(messagePayload));
    messageInput.value = "";
    messageInput.focus();
  } else if (!activeChatPartner && messagesDiv) {
    displaySystemMessage("Будь ласка, оберіть чат або групу.");
  }
}

// --- Ініціалізація ---
document.addEventListener("DOMContentLoaded", () => {
  myUsername = getChatUsernameOnMessagePage();
  if (usernamePlaceholderEl) usernamePlaceholderEl.textContent = myUsername;
  if (currentUserDisplayDiv) currentUserDisplayDiv.style.display = "block";

  if (messageInput) messageInput.disabled = true;
  if (sendButton) sendButton.disabled = true;
  if (chatPartnerNameEl) chatPartnerNameEl.textContent = "Оберіть чат";

  // Event Listeners for Modal (перенесено сюди для гарантії існування елементів)
  if (newChatRoomButton)
    newChatRoomButton.addEventListener("click", openNewUserChatModal);
  if (closeModalButton)
    closeModalButton.addEventListener("click", closeNewUserChatModal);
  if (newUserChatModal) {
    // Додано перевірку
    window.addEventListener("click", (event) => {
      if (event.target == newUserChatModal) closeNewUserChatModal();
    });
  }
  if (searchUserInput)
    searchUserInput.addEventListener("keyup", filterUsersInModal);
  if (createChatOrGroupButton)
    createChatOrGroupButton.addEventListener("click", handleCreateChatOrGroup);

  // Event listeners for sending message
  if (sendButton) sendButton.addEventListener("click", sendMessage);
  if (messageInput) {
    messageInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });
  }
});

