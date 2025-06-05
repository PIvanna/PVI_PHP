// /Project/public/js/header.js
console.log("HEADER.JS: Script execution started.");

// Глобальні змінні для WebSocket
window.globalSocket = null;
let globalMyUsername = "";
window.GLOBAL_NODE_JS_SERVER_HOST = window.location.hostname;
window.GLOBAL_NODE_JS_SERVER_PORT = 3001;

// --- Variables for Hover Dropdown ---
let hideWrapperTimeoutId = null;
const HIDE_WRAPPER_TIMEOUT_DURATION = 300; 
const MAX_PREVIEWS_ON_HOVER = 3; 
const MAX_PREVIEWS_STORED_IN_DOM = 3; 
let globalNotificationPreviews = []; 

async function fetchInitialPreviews() {
  if (!globalMyUsername) {
    console.log("HEADER.JS (fetchInitialPreviews): globalMyUsername не визначено, запит не виконується.");
    return;
  }
  console.log(`HEADER.JS (fetchInitialPreviews): Запит початкових прев'ю для користувача ${globalMyUsername}`);
  try {
    // ВАЖЛИВО: шлях до вашого API
    const apiUrl = `http://${window.GLOBAL_NODE_JS_SERVER_HOST}:${window.GLOBAL_NODE_JS_SERVER_PORT}/api/users/${encodeURIComponent(globalMyUsername)}/latest-previews`;
    console.log(`HEADER.JS (fetchInitialPreviews): Запит на URL: ${apiUrl}`);

    const response = await fetch(apiUrl); 
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }
    const previews = await response.json();
    console.log("HEADER.JS (fetchInitialPreviews): Отримано початкові прев'ю:", previews);

    if (previews && Array.isArray(previews)) { // Додано перевірку, що previews не порожній перед slice
      globalNotificationPreviews = previews.slice(0, MAX_PREVIEWS_STORED_IN_DOM);
      console.log("HEADER.JS (fetchInitialPreviews): globalNotificationPreviews оновлено:", globalNotificationPreviews);
      renderAllPreviewsFromStore();
    } else {
      console.log("HEADER.JS (fetchInitialPreviews): Початкових прев'ю не знайдено або відповідь порожня/не масив.");
      globalNotificationPreviews = []; // Переконуємося, що масив порожній
      renderAllPreviewsFromStore(); // Рендеримо порожній список
    }
  } catch (error) {
    console.error("HEADER.JS (fetchInitialPreviews): Помилка при завантаженні початкових прев'ю:", error);
    // Можна показати користувачу повідомлення про помилку або просто залишити прев'ю порожніми
    globalNotificationPreviews = [];
    renderAllPreviewsFromStore();
  }
}

function connectGlobalWebSocket() {
  if (!globalMyUsername) {
    console.log("HEADER.JS (connectGlobalWebSocket): Користувач не визначений. WebSocket не підключається.");
    return;
  }
  if (window.globalSocket && (window.globalSocket.readyState === WebSocket.OPEN || window.globalSocket.readyState === WebSocket.CONNECTING)) {
    console.log("HEADER.JS (connectGlobalWebSocket): З'єднання WebSocket вже існує або встановлюється.");
    return;
  }
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${window.GLOBAL_NODE_JS_SERVER_HOST}:${window.GLOBAL_NODE_JS_SERVER_PORT}/`;
  console.log(`HEADER.JS (connectGlobalWebSocket): Спроба підключення до ${wsUrl} як '${globalMyUsername}'`);
  try {
    window.globalSocket = new WebSocket(wsUrl);
  } catch (error) {
    console.error("HEADER.JS (connectGlobalWebSocket): Помилка при створенні WebSocket - ", error);
    return;
  }

  window.globalSocket.onopen = () => {
    console.log("HEADER.JS (WebSocket): З'єднання встановлено.");
    if (globalMyUsername) {
      window.globalSocket.send(JSON.stringify({ type: "register", username: globalMyUsername }));
    } else {
      console.warn("HEADER.JS (WebSocket onopen): globalMyUsername порожній, неможливо зареєструвати.");
    }
  };

  window.globalSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("HEADER.JS (WebSocket onmessage): Отримано повідомлення:", data);
      let eventToDispatch;
      switch (data.type) {
        case "privateMessage":
        case "groupMessage":
          console.log("HEADER.JS (onmessage): Обробка privateMessage/groupMessage. Sender:", data.sender, "globalMyUsername:", globalMyUsername);
          if (data.sender === globalMyUsername) {
            console.log("HEADER.JS (onmessage): Це власне повідомлення, прев'ю не показується.");

            eventToDispatch = new CustomEvent("chatmessage", { detail: data });
            document.dispatchEvent(eventToDispatch);
            return; 
          }
          showNotificationPreview(data); // Показуємо прев'ю для вхідних від інших
          eventToDispatch = new CustomEvent("chatmessage", { detail: data });
          document.dispatchEvent(eventToDispatch);
          break;
        case "userList":
          eventToDispatch = new CustomEvent("userlistupdated", { detail: { chats: data.chats } });
          document.dispatchEvent(eventToDispatch);
          let totalUnread = 0;
          if (data.chats && Array.isArray(data.chats)) {
            data.chats.forEach((chat) => {
              if (chat.unreadCount && chat.unreadCount > 0) totalUnread += chat.unreadCount;
            });
          }
          updateBellNotification(totalUnread);
          break;
        case "groupCreated":
          eventToDispatch = new CustomEvent("groupcreated", { detail: { group: data.group } });
          document.dispatchEvent(eventToDispatch);
          break;
        case "registered":
          console.log("HEADER.JS (WebSocket onmessage): Успішно зареєстровано як", data.username);
          const registeredEvent = new CustomEvent("socketregistered", { detail: { username: data.username } });
          document.dispatchEvent(registeredEvent);
          break;
        case "error":
          console.error("HEADER.JS (WebSocket onmessage): Помилка сервера:", data.text);
          break;
        default:
          console.warn("HEADER.JS (WebSocket onmessage): Отримано невідомий тип:", data.type, data);
      }
    } catch (e) {
      console.error("HEADER.JS (WebSocket onmessage): Помилка обробки:", e, "Raw data:", event.data);
    }
  };

  window.globalSocket.onclose = (event) => {
    console.log("HEADER.JS (WebSocket onclose): З'єднання закрито. Код:", event.code, "Причина:", event.reason);
    window.globalSocket = null;
    if (globalMyUsername && event.code !== 1000 && event.code !== 1005 && event.reason !== "User logged out or became guest" && event.reason !== "User changed, reconnecting") {
      console.log("HEADER.JS (WebSocket onclose): Спроба перепідключення через 5 секунд...");
      setTimeout(connectGlobalWebSocket, 5000);
    }
  };
  window.globalSocket.onerror = (error) => {
    console.error("HEADER.JS (WebSocket onerror): Помилка:", error);
  };
}

function updateBellNotification(currentTotalUnread = 0) {
  const bellIcon = document.getElementById("bell");
  const signNotDiv = document.getElementById("sign-not");
  if (!bellIcon || !signNotDiv) {
    return;
  }

  if (currentTotalUnread > 0) {
    signNotDiv.textContent = currentTotalUnread > 9 ? "9+" : currentTotalUnread.toString();
    signNotDiv.style.display = "block";
    bellIcon.classList.add("has-notifications");
  } else {
    signNotDiv.style.display = "none";
    bellIcon.classList.remove("has-notifications");
  }
}

function renderAllPreviewsFromStore() {
  console.log("HEADER.JS (renderAllPreviewsFromStore): Початок рендерингу прев'ю. Кількість у сховищі:", globalNotificationPreviews.length);
  const messageWrapper = document.getElementById("message-wraper");
  if (!messageWrapper) {
    console.warn("HEADER.JS (renderAllPreviewsFromStore): Елемент #message-wraper не знайдений. Рендеринг скасовано.");
    return;
  }
  messageWrapper.innerHTML = "";
  console.log("HEADER.JS (renderAllPreviewsFromStore): #message-wraper очищено.");

  const chatPageFilename = "index.html"; 
  if (globalNotificationPreviews.length === 0) {
    console.log("HEADER.JS (renderAllPreviewsFromStore): Сховище прев'ю порожнє, нічого рендерити.");
    const noPreviewElem = document.createElement("div");
    noPreviewElem.classList.add("message-elem", "no-previews"); // Додайте стиль для .no-previews
    noPreviewElem.textContent = "Немає нових сповіщень";
    messageWrapper.appendChild(noPreviewElem);
  } else {
    globalNotificationPreviews.forEach((messageData, index) => {
        console.log(`HEADER.JS (renderAllPreviewsFromStore): Рендеринг прев'ю #${index + 1}:`, messageData);
        if (!messageData || !messageData.type) { // Додаткова перевірка
            console.warn(`HEADER.JS (renderAllPreviewsFromStore): Пропущено невалідні дані прев'ю:`, messageData);
            return;
        }

        const previewElem = document.createElement("div");
        previewElem.classList.add("message-elem", "display_flex_r_sb");
        previewElem.dataset.chatType = messageData.type === "privateMessage" ? "private" : "group";
        previewElem.dataset.chatId = messageData.type === "privateMessage" ? messageData.sender : messageData.groupId;
        const displayName = messageData.type === "privateMessage" ? messageData.sender : messageData.groupName || "Груповий чат";
        previewElem.dataset.chatName = displayName;

        const profileDiv = document.createElement("div");
        profileDiv.classList.add("message-profile", "display_flex_c");
        const avatarImg = document.createElement("img");
        avatarImg.src = "/Project/public/img/gender-neutral-user.png"; // Шлях до аватара
        avatarImg.alt = "avatar";
        avatarImg.classList.add("message-avatar");
        const nameP = document.createElement("p");
        nameP.classList.add("font-Monomakh"); // Ваш клас для шрифту
        nameP.textContent = (messageData.sender || "System").substring(0, 10) + ((messageData.sender || "System").length > 10 ? "..." : "");
        profileDiv.appendChild(avatarImg);
        profileDiv.appendChild(nameP);

        const itemDiv = document.createElement("div");
        itemDiv.classList.add("message-item");
        itemDiv.textContent = (messageData.text || "New message").substring(0, 30) + ((messageData.text || "New message").length > 30 ? "..." : "");
        
        previewElem.appendChild(profileDiv);
        previewElem.appendChild(itemDiv);

        previewElem.addEventListener("click", () => {
        console.log("[HEADER.JS] Клік по прев'ю (з глобального сховища): ChatID:", previewElem.dataset.chatId, "ChatType:", previewElem.dataset.chatType);
        sessionStorage.setItem("redirectToChatType", previewElem.dataset.chatType);
        sessionStorage.setItem("redirectToChatId", previewElem.dataset.chatId);
        sessionStorage.setItem("redirectToChatName", previewElem.dataset.chatName);

        if (messageWrapper.classList.contains("visible")) {
            messageWrapper.classList.remove("visible");
            messageWrapper.style.height = "0";
            console.log("[HEADER.JS] (preview click): #message-wraper приховано.");
            if (hideWrapperTimeoutId) {
                clearTimeout(hideWrapperTimeoutId);
                hideWrapperTimeoutId = null;
            }
        }

        const chatPageTargetUrl = `/Project/public/${chatPageFilename}`; // Правильний шлях до сторінки чату

        if (!window.location.pathname.toLowerCase().endsWith(`/${chatPageFilename}`)) {
            console.log("[HEADER.JS] (preview click): Перехід на сторінку чату:", chatPageTargetUrl);
            window.location.href = chatPageTargetUrl;
        } else {
            console.log("[HEADER.JS] (preview click): Вже на сторінці чату. Спроба викликати selectChatPartner.");
            if (typeof selectChatPartner === "function") {
            console.log("[HEADER.JS] (preview click): Виклик selectChatPartner для:", sessionStorage.getItem("redirectToChatId"));
            selectChatPartner(
                sessionStorage.getItem("redirectToChatId"),
                sessionStorage.getItem("redirectToChatType"),
                sessionStorage.getItem("redirectToChatName")
            );
            } else {
            console.warn("[HEADER.JS] (preview click): selectChatPartner не визначено глобально. Можливо, потрібне перезавантаження.");
            }
        }
        });
        messageWrapper.appendChild(previewElem);
    });
  }
  console.log("HEADER.JS (renderAllPreviewsFromStore): Рендеринг завершено. Кількість елементів у DOM:", messageWrapper.children.length);
}

function showNotificationPreview(messageData) {
  console.log("HEADER.JS (showNotificationPreview): Отримано для показу (через WebSocket):", messageData);
  
  if (messageData.sender === globalMyUsername) {
    console.log("[HEADER.JS] (showNotificationPreview): Це власне повідомлення, прев'ю не додається.");
    return;
  }

  const currentPagePath = window.location.pathname.toLowerCase();
  const chatPageFilename = "index.html"; 
  const isMessagesPageActive = currentPagePath.endsWith(`/${chatPageFilename}`);
  console.log(`HEADER.JS (showNotificationPreview): currentPagePath: ${currentPagePath}, isMessagesPageActive: ${isMessagesPageActive}`);

  let isCurrentChatActive = false;
  if (isMessagesPageActive && window.currentActiveChatInfo) {
    console.log("HEADER.JS (showNotificationPreview): window.currentActiveChatInfo:", window.currentActiveChatInfo);
    const messageIsPrivate = messageData.type === "privateMessage";
    const messageIsGroup = messageData.type === "groupMessage";
    const activeChatIsPrivate = window.currentActiveChatInfo.type === "private";
    const activeChatIsGroup = window.currentActiveChatInfo.type === "group";
    const messageSenderMatchesActiveId = String(window.currentActiveChatInfo.id) === String(messageData.sender);
    const messageGroupIdMatchesActiveId = String(window.currentActiveChatInfo.id) === String(messageData.groupId);

    if (messageIsPrivate && activeChatIsPrivate && messageSenderMatchesActiveId) {
      isCurrentChatActive = true;
    } else if (messageIsGroup && activeChatIsGroup && messageGroupIdMatchesActiveId) {
      isCurrentChatActive = true;
    }
    console.log(`HEADER.JS (showNotificationPreview): isCurrentChatActive: ${isCurrentChatActive} (messageType: ${messageData.type}, activeChatType: ${window.currentActiveChatInfo.type}, messageID: ${messageData.sender || messageData.groupId}, activeChatID: ${window.currentActiveChatInfo.id})`);
  } else {
     console.log("HEADER.JS (showNotificationPreview): Не на сторінці повідомлень або window.currentActiveChatInfo не визначено.");
  }

  if (isCurrentChatActive) {
    console.log("[HEADER.JS] (showNotificationPreview): Чат активний, попередній перегляд не показується для:", messageData.sender || messageData.groupId);
    return; 
  }

  console.log("HEADER.JS (showNotificationPreview): Додавання прев'ю до globalNotificationPreviews. Поточний розмір:", globalNotificationPreviews.length);
  globalNotificationPreviews.unshift(messageData); 
  console.log("HEADER.JS (showNotificationPreview): globalNotificationPreviews після unshift. Розмір:", globalNotificationPreviews.length);

  if (globalNotificationPreviews.length > MAX_PREVIEWS_STORED_IN_DOM) {
    console.log(`HEADER.JS (showNotificationPreview): Розмір globalNotificationPreviews (${globalNotificationPreviews.length}) перевищує MAX_PREVIEWS_STORED_IN_DOM (${MAX_PREVIEWS_STORED_IN_DOM}). Обрізання.`);
    globalNotificationPreviews = globalNotificationPreviews.slice(0, MAX_PREVIEWS_STORED_IN_DOM);
    console.log("HEADER.JS (showNotificationPreview): globalNotificationPreviews після slice. Розмір:", globalNotificationPreviews.length);
  }
  renderAllPreviewsFromStore();
}

function updateHeaderUserInfo(currentUserObject) {
  const userInitEl = document.getElementById("userInit");
  let oldGlobalMyUsername = globalMyUsername; // Зберігаємо старе ім'я

  if (!userInitEl) {
    console.error("HEADER.JS (updateHeaderUserInfo): Елемент #userInit не знайдено!");
    const eventNoUI = new CustomEvent("currentUserReady", { detail: currentUserObject });
    document.dispatchEvent(eventNoUI);
    if (currentUserObject && currentUserObject.name) {
      globalMyUsername = `${currentUserObject.name} ${currentUserObject.surname || ""}`.trim();
      if (globalMyUsername !== oldGlobalMyUsername || !window.globalSocket) { // Якщо ім'я змінилось або сокет не створений
        fetchInitialPreviews(); // Завантажуємо прев'ю для нового/оновленого користувача
        if (!window.globalSocket) connectGlobalWebSocket();
      }
    } else {
      globalMyUsername = "";
      globalNotificationPreviews = [];
      renderAllPreviewsFromStore();
    }
    return;
  }

  if (currentUserObject && currentUserObject.name) {
    userInitEl.textContent = `${currentUserObject.name} ${currentUserObject.surname || ""}`.trim();
    const newGlobalMyUsername = userInitEl.textContent;

    if (newGlobalMyUsername && (newGlobalMyUsername !== globalMyUsername || !window.globalSocket || window.globalSocket.readyState !== WebSocket.OPEN)) {
      globalMyUsername = newGlobalMyUsername;
      console.log("HEADER.JS (updateHeaderUserInfo): globalMyUsername оновлено на:", globalMyUsername);
      
      fetchInitialPreviews(); // Завантажуємо прев'ю для нового/оновленого користувача

      if (window.globalSocket && window.globalSocket.readyState === WebSocket.OPEN) {
        console.log("HEADER.JS (updateHeaderUserInfo): Користувач змінився, ім'я співпадає з попереднім, але WebSocket вже був, перепідключення...");
        window.globalSocket.close(1000, "User changed, reconnecting"); // WebSocket сам викличе connectGlobalWebSocket при onclose
      } else { // Якщо сокета немає або він не OPEN/CONNECTING
        console.log("HEADER.JS (updateHeaderUserInfo): WebSocket не підключено або закритий, спроба підключення.");
        connectGlobalWebSocket();
      }
    } else if (!newGlobalMyUsername && globalMyUsername) { // Користувач став гостем, але був залогінений
      globalMyUsername = "";
      console.log("HEADER.JS (updateHeaderUserInfo): Користувач став гостем, globalMyUsername очищено.");
      globalNotificationPreviews = [];
      renderAllPreviewsFromStore();
       if (window.globalSocket && window.globalSocket.readyState === WebSocket.OPEN) {
        window.globalSocket.close(1000, "User logged out or became guest");
      }
    } else if (newGlobalMyUsername && newGlobalMyUsername === globalMyUsername && (!window.globalSocket || window.globalSocket.readyState !== WebSocket.OPEN)) {
        // Користувач той самий, але сокет чомусь не відкритий
        console.log("HEADER.JS (updateHeaderUserInfo): Користувач той самий, але сокет не активний. Спроба підключення.");
        connectGlobalWebSocket();
    }

  } else { // currentUserObject is null or has no name -> Guest
    userInitEl.textContent = "Гість";
    globalMyUsername = "";
    console.log("HEADER.JS (updateHeaderUserInfo): Користувач - Гість, globalMyUsername очищено.");
    globalNotificationPreviews = [];
    renderAllPreviewsFromStore();
    if (oldGlobalMyUsername && window.globalSocket && window.globalSocket.readyState === WebSocket.OPEN) { // Якщо раніше був залогінений користувач
      console.log("HEADER.JS (updateHeaderUserInfo): Користувач вийшов або став гостем, закриття WebSocket.");
      window.globalSocket.close(1000, "User logged out or became guest");
    }
  }
  const event = new CustomEvent("currentUserReady", { detail: currentUserObject });
  document.dispatchEvent(event);
  console.log("HEADER.JS (updateHeaderUserInfo): dispatched currentUserReady with detail:", currentUserObject ? currentUserObject.name : "Guest");
}

function initializeHeader() {
  console.log("HEADER.JS: initializeHeader() called.");
  const bellIconElement = document.getElementById("bell");
  const messageWrapperElement = document.getElementById("message-wraper");
  const notifDiv = document.querySelector(".notif");

  const chatPageFilenameForCheck = "index.html"; // Якщо у вас сторінка називається index.html.php, змініть тут
  const chatPageFullUrlOnClick = `/Project/public/${chatPageFilenameForCheck}`;

  console.log('HEADER.JS (initializeHeader): Ідентифікатор сторінки чату для перевірок встановлено на:', chatPageFilenameForCheck);
  
  // renderAllPreviewsFromStore(); // Початковий рендер тут не потрібен, бо updateHeaderUserInfo викличе fetchInitialPreviews

  if (bellIconElement && messageWrapperElement && notifDiv) {
    updateBellNotification(); // Початкове оновлення дзвіночка

    function showNotificationsOnHover() {
      if (hideWrapperTimeoutId) {
        clearTimeout(hideWrapperTimeoutId);
        hideWrapperTimeoutId = null;
      }
      
      const currentRenderedPreviewsCount = messageWrapperElement.children.length;
      const hasNoPreviewsPlaceholder = messageWrapperElement.querySelector('.no-previews');

      if (currentRenderedPreviewsCount > 0 && !hasNoPreviewsPlaceholder) { // Тільки якщо є реальні прев'ю
        if (!messageWrapperElement.classList.contains("visible")) {
          let calculatedHeight = 0;
          const approxItemHeight = 70; 
          const wrapperPaddingVertical = 16;

          const countToShow = Math.min(currentRenderedPreviewsCount, MAX_PREVIEWS_ON_HOVER);
          
          if (countToShow > 0) {
             calculatedHeight = (countToShow * approxItemHeight) + wrapperPaddingVertical;
          }
          const cssMaxHeight = 380; 
          calculatedHeight = Math.min(calculatedHeight, cssMaxHeight);

          if (countToShow > 0 && calculatedHeight <= wrapperPaddingVertical && calculatedHeight > 0) {
             calculatedHeight = approxItemHeight + wrapperPaddingVertical;
          }
          
          if (calculatedHeight > 0) {
            messageWrapperElement.style.height = `${calculatedHeight}px`;
            messageWrapperElement.classList.add("visible");
          } else {
             messageWrapperElement.style.height = "0";
             messageWrapperElement.classList.remove("visible");
          }
        }
      } else { // Якщо немає прев'ю або є тільки "Немає сповіщень"
        // Якщо хочемо показувати "Немає сповіщень" при ховері:
        if (hasNoPreviewsPlaceholder && !messageWrapperElement.classList.contains("visible")) {
            const approxItemHeight = 40; // приблизна висота для "Немає сповіщень"
            const wrapperPaddingVertical = 16;
            messageWrapperElement.style.height = `${approxItemHeight + wrapperPaddingVertical}px`;
            messageWrapperElement.classList.add("visible");
        } else if (!hasNoPreviewsPlaceholder) { // Якщо взагалі нічого немає
            messageWrapperElement.style.height = "0";
            messageWrapperElement.classList.remove("visible");
        }
      }
    }

    function hideNotificationsDropdown() {
      if (messageWrapperElement.classList.contains("visible")) {
        messageWrapperElement.style.height = "0";
        messageWrapperElement.classList.remove("visible");
      }
      if (hideWrapperTimeoutId) {
        clearTimeout(hideWrapperTimeoutId);
        hideWrapperTimeoutId = null;
      }
    }

    function scheduleHideNotificationsDropdown() {
      if (hideWrapperTimeoutId) {
        clearTimeout(hideWrapperTimeoutId);
      }
      hideWrapperTimeoutId = setTimeout(hideNotificationsDropdown, HIDE_WRAPPER_TIMEOUT_DURATION);
    }

    notifDiv.addEventListener("mouseenter", showNotificationsOnHover);
    notifDiv.addEventListener("mouseleave", scheduleHideNotificationsDropdown);

    bellIconElement.addEventListener("click", (event) => {
      event.preventDefault();
      console.log("HEADER.JS (bell click): Клік по дзвіночку.");
      hideNotificationsDropdown();
      console.log("HEADER.JS (bell click): Примусовий перехід на сторінку чату:", chatPageFullUrlOnClick);
      window.location.href = chatPageFullUrlOnClick;
    });

    window.addEventListener("click", (event) => {
      if (messageWrapperElement.classList.contains("visible")) {
        if (!notifDiv.contains(event.target)) {
          hideNotificationsDropdown();
        }
      }
    });

  } else {
    console.warn("HEADER.JS (initializeHeader): #bell, #message-wraper, або .notif не знайдено. Функціонал сповіщень може бути обмежений.");
  }
  const currentUserDataFromStorage = JSON.parse(localStorage.getItem("currentUser"));
  console.log("HEADER.JS (initializeHeader): Завантажено currentUser з localStorage:", currentUserDataFromStorage);
  updateHeaderUserInfo(currentUserDataFromStorage);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("HEADER.JS: DOMContentLoaded event. Запуск initializeHeader з таймаутом.");
    setTimeout(initializeHeader, 0); // setTimeout, щоб інші скрипти встигли виконатись (наприклад, ті, що визначають selectChatPartner)
  });
} else {
  console.log("HEADER.JS: DOM вже завантажено. Запуск initializeHeader з таймаутом.");
  setTimeout(initializeHeader, 0);
}

window.logoutFrom = function () {
  console.log("HEADER.JS: logoutFrom() called.");
  if (window.globalSocket && window.globalSocket.readyState === WebSocket.OPEN) {
    console.log("HEADER.JS (logoutFrom): Закриття WebSocket.");
    window.globalSocket.close(1000, "User logged out");
  }
  localStorage.removeItem("currentUser");
  console.log("HEADER.JS (logoutFrom): currentUser видалено з localStorage.");
  
  // Очищаємо стан для гостя
  globalMyUsername = ""; // Важливо оновити перед updateHeaderUserInfo(null)
  updateHeaderUserInfo(null); // Це також очистить globalNotificationPreviews та перерендерить
  updateBellNotification(0);
  
  // globalNotificationPreviews = []; // Вже робиться в updateHeaderUserInfo(null) -> renderAllPreviewsFromStore
  // renderAllPreviewsFromStore(); // Теж саме

  const mw = document.getElementById("message-wraper");
  if (mw) {
    mw.classList.remove("visible");
    mw.style.height = "0";
    console.log("HEADER.JS (logoutFrom): #message-wraper приховано.");
  }
  console.log("HEADER.JS (logoutFrom): Перенаправлення на /Project/public/api/logout.php");
  window.location.href = "/Project/public/api/logout.php"; // Шлях до вашого logout скрипта
};

console.log("HEADER.JS: Script execution finished.");