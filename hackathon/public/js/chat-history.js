// DataMatch - Chat History Integration
document.addEventListener('DOMContentLoaded', function() {
  const chatContainer = document.getElementById('chat-container');
  const messageForm = document.getElementById('message-form');
  const conversationsList = document.getElementById('conversations-list');
  const messageInput = document.getElementById('message-input');
  
  let currentRecipientId = null;
  let chatUpdateInterval = null;
  
  // Load conversations list when page loads
  if (conversationsList) {
    loadConversationsList();
  }
  
  // Add event listener to message form
  if (messageForm) {
    messageForm.addEventListener('submit', sendMessage);
  }
  
  // Function to load conversations list
  async function loadConversationsList() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('You must be logged in to view conversations');
        return;
      }
      
      const response = await fetch('/api/users/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }
      
      const data = await response.json();
      displayConversationsList(data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      showError('Failed to load conversations. Please try again later.');
    }
  }
  
  // Function to display conversations list
  function displayConversationsList(conversations) {
    if (!conversationsList) return;
    
    if (!conversations || conversations.length === 0) {
      conversationsList.innerHTML = '<p>No conversations found.</p>';
      return;
    }
    
    // Sort by most recent message date
    const sortedConversations = [...conversations].sort((a, b) => 
      new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
    );
    
    let html = '<ul class="conversations-list">';
    
    sortedConversations.forEach(convo => {
      const lastDate = new Date(convo.lastMessageDate).toLocaleString();
      const unreadClass = convo.unreadCount > 0 ? 'unread' : '';
      
      html += `
        <li class="conversation-item ${unreadClass}" data-recipient-id="${convo.recipientId}">
          <div class="avatar">
            <img src="${convo.recipientAvatar || 'img/default-avatar.png'}" alt="${escapeHtml(convo.recipientName)}">
            ${convo.online ? '<span class="status-indicator online"></span>' : ''}
          </div>
          <div class="conversation-info">
            <h4 class="recipient-name">${escapeHtml(convo.recipientName)}</h4>
            <p class="last-message">${escapeHtml(convo.lastMessage)}</p>
            <span class="last-date">${lastDate}</span>
          </div>
          ${convo.unreadCount > 0 ? `<span class="unread-badge">${convo.unreadCount}</span>` : ''}
        </li>
      `;
    });
    
    html += '</ul>';
    conversationsList.innerHTML = html;
    
    // Add event listeners to conversation items
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', function() {
        const recipientId = this.getAttribute('data-recipient-id');
        loadChatHistory(recipientId);
        
        // Update UI to show which conversation is selected
        document.querySelectorAll('.conversation-item').forEach(el => {
          el.classList.remove('selected');
        });
        this.classList.add('selected');
        this.classList.remove('unread');
        
        // Remove unread badge
        const badge = this.querySelector('.unread-badge');
        if (badge) badge.remove();
      });
    });
  }
  
  // Function to load chat history for a specific recipient
  async function loadChatHistory(recipientId) {
    if (!chatContainer) return;
    
    currentRecipientId = recipientId;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('You must be logged in to view chat history');
        return;
      }
      
      const response = await fetch(`/api/users/chat/${recipientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      
      const data = await response.json();
      displayChatHistory(data.messages, data.recipientInfo);
      
      // Mark messages as read
      markMessagesAsRead(recipientId);
      
      // Set up automatic updates
      setupChatUpdates(recipientId);
    } catch (error) {
      console.error('Error loading chat history:', error);
      showError('Failed to load chat history. Please try again later.');
    }
  }
  
  // Function to display chat history
  function displayChatHistory(messages, recipientInfo) {
    if (!chatContainer) return;
    
    // Clear existing chat content
    chatContainer.innerHTML = '';
    
    // Add recipient info header
    const headerHtml = `
      <div class="chat-header">
        <div class="recipient-info">
          <img src="${recipientInfo.avatar || 'img/default-avatar.png'}" alt="${escapeHtml(recipientInfo.name)}" class="recipient-avatar">
          <div class="recipient-details">
            <h3>${escapeHtml(recipientInfo.name)}</h3>
            <span class="recipient-status">${recipientInfo.online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
    `;
    
    // Add messages container
    const messagesHtml = `
      <div class="messages-container" id="messages-container">
        ${messages && messages.length > 0 ? '' : '<p class="no-messages">No messages yet. Start the conversation!</p>'}
        ${messages ? messages.map(msg => {
          const msgDate = new Date(msg.timestamp).toLocaleString();
          const isMe = msg.isFromCurrentUser;
          const messageClass = isMe ? 'outgoing' : 'incoming';
          
          return `
            <div class="message ${messageClass}">
              <div class="message-content">
                <p>${escapeHtml(msg.text)}</p>
                <span class="message-time">${msgDate}</span>
                ${msg.read && isMe ? '<span class="read-indicator">Read</span>' : ''}
              </div>
            </div>
          `;
        }).join('') : ''}
      </div>
    `;
    
    // Add message form
    const formHtml = `
      <form id="message-form" class="message-form">
        <input type="text" id="message-input" placeholder="Type your message...">
        <button type="submit" id="send-button">
          <i class="fas fa-paper-plane"></i> Send
        </button>
      </form>
    `;
    
    // Combine all HTML
    chatContainer.innerHTML = headerHtml + messagesHtml + formHtml;
    
    // Scroll to bottom of messages
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Re-add event listener to form (since we replaced the HTML)
    const newMessageForm = document.getElementById('message-form');
    if (newMessageForm) {
      newMessageForm.addEventListener('submit', sendMessage);
    }
  }
  
  // Function to send a message
  async function sendMessage(e) {
    e.preventDefault();
    
    if (!currentRecipientId) {
      showError('Please select a conversation first');
      return;
    }
    
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) {
      return; // Don't send empty messages
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('You must be logged in to send messages');
        return;
      }
      
      const response = await fetch('/api/users/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          recipientId: currentRecipientId,
          message
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Clear input field
      messageInput.value = '';
      
      // Reload chat to show new message
      loadChatHistory(currentRecipientId);
      
      // Also update conversations list to show latest message
      loadConversationsList();
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message. Please try again later.');
    }
  }
  
  // Function to mark messages as read
  async function markMessagesAsRead(recipientId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`/api/users/chat/${recipientId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }
      
      // Update conversation list
      loadConversationsList();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
  
  // Function to set up automatic chat updates
  function setupChatUpdates(recipientId) {
    // Clear any existing interval
    if (chatUpdateInterval) {
      clearInterval(chatUpdateInterval);
    }
    
    // Set new interval to check for updates every 10 seconds
    chatUpdateInterval = setInterval(() => {
      if (currentRecipientId === recipientId) {
        loadChatHistory(recipientId);
      } else {
        // If user switched to a different conversation, clear this interval
        clearInterval(chatUpdateInterval);
      }
    }, 10000);
  }
  
  // Function to show error messages
  function showError(message) {
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // If chat container exists, show error there
    if (chatContainer) {
      chatContainer.prepend(errorDiv);
    } else if (conversationsList) {
      // Otherwise show near conversations list
      conversationsList.parentNode.insertBefore(errorDiv, conversationsList);
    }
    
    // Remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
  
  // Helper function to escape HTML
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});