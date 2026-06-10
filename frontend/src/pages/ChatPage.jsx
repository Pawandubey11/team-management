import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupAPI, messageAPI } from '../services/api';
import { getSocket, joinRoom, sendMessage as socketSend, emitTypingStart, emitTypingStop } from '../services/socket';

const DEPT_COLORS = {
  Frontend: 'var(--dept-frontend)',
  Backend: 'var(--dept-backend)',
  Sales: 'var(--dept-sales)',
  Production: 'var(--dept-production)',
  HR: 'var(--dept-hr)',
};

export default function ChatPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [groupRes, msgRes] = await Promise.all([
          groupAPI.getGroup(groupId),
          messageAPI.getGroupMessages(groupId),
        ]);
        setGroup(groupRes.data.data.group);
        setMessages(msgRes.data.data.messages);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load chat. Access denied.');
      } finally { setLoading(false); }
    };
    load();
  }, [groupId]);

  // Socket setup
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !group) return;
    socketRef.current = socket;

    // Join room
    joinRoom(groupId);

    const onNewMessage = ({ message }) => {
      setMessages(prev => [...prev, message]);
      // Remove from typing when they send
      setTypingUsers(prev => prev.filter(u => u.userId !== message.senderId._id));
    };
    const onError = ({ message: msg }) => setError(msg);
    const onUserTyping = ({ userId, name }) => {
      setTypingUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev;
        return [...prev, { userId, name }];
      });
    };
    const onStoppedTyping = ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    };

    socket.on('new_message', onNewMessage);
    socket.on('error', onError);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stopped_typing', onStoppedTyping);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('error', onError);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stopped_typing', onStoppedTyping);
    };
  }, [group, groupId]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const socket = getSocket();
    if (socket) {
      socketSend(input.trim());
      emitTypingStop();
    } else {
      // Fallback to REST
      setSending(true);
      messageAPI.sendMessage({ content: input.trim(), groupId })
        .then(res => setMessages(prev => [...prev, res.data.data.message]))
        .catch(e => setError(e.response?.data?.message || 'Failed to send'))
        .finally(() => setSending(false));
    }
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    emitTypingStart();
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emitTypingStop(), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <div style={{ fontSize: '32px' }}>⛔</div>
      <p style={{ color: 'var(--danger)', fontSize: '16px' }}>{error}</p>
      <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
        ← Back to Dashboard
      </button>
    </div>
  );

  const color = DEPT_COLORS[group?.departmentId?.name] || 'var(--accent)';
  const isMyMessage = (msg) => {
    const senderId = msg.senderId?._id || msg.senderId;
    return senderId === user?._id;
  };

  const groupedMessages = groupByDate(messages);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: '14px',
        flexShrink: 0
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: `${color}20`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
        }}>◈</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '16px' }}>
            {group?.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {group?.departmentId?.name} Department · Real-time Chat
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Live</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {groupedMessages.map(([date, msgs]) => (
          <React.Fragment key={date}>
            <DateDivider label={date} />
            {msgs.map((msg, i) => {
              const mine = isMyMessage(msg);
              const prevMsg = msgs[i - 1];
              const showAvatar = !prevMsg || prevMsg.senderId?._id !== msg.senderId?._id;
              return (
                <MessageBubble key={msg._id} msg={msg} mine={mine} showAvatar={showAvatar} color={color} />
              );
            })}
          </React.Fragment>
        ))}
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', opacity: 0.4 }}>
            <div style={{ fontSize: '40px' }}>◈</div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
        {typingUsers.length > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0', animation: 'pulse 1.5s infinite' }}>
            {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        padding: '16px 24px', borderTop: '1px solid var(--border)',
        background: 'var(--ink-2)', display: 'flex', gap: '12px', alignItems: 'flex-end', flexShrink: 0
      }}>
        <textarea
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${group?.name}...`}
          rows={1}
          style={{
            flex: 1, padding: '11px 14px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', color: 'var(--text-primary)',
            fontSize: '14px', resize: 'none', fontFamily: 'var(--font-body)',
            maxHeight: '120px', overflow: 'auto', outline: 'none',
            transition: 'border-color 0.2s',
            lineHeight: '1.5'
          }}
          onFocus={e => e.target.style.borderColor = color}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button type="submit" disabled={!input.trim() || sending} style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: input.trim() ? color : 'var(--surface-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', transition: 'all 0.2s', flexShrink: 0,
          cursor: input.trim() ? 'pointer' : 'default',
          boxShadow: input.trim() ? `0 0 16px ${color}50` : 'none'
        }}>
          →
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ msg, mine, showAvatar, color }) {
  const senderName = msg.senderId?.name || 'Unknown';
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      display: 'flex', flexDirection: mine ? 'row-reverse' : 'row',
      gap: '8px', marginTop: showAvatar ? '12px' : '2px',
      alignItems: 'flex-end'
    }}>
      {/* Avatar */}
      <div style={{ width: '32px', flexShrink: 0 }}>
        {showAvatar && !mine && (
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: `${color}30`, border: `1px solid ${color}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: color
          }}>{senderName[0]}</div>
        )}
      </div>

      <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
        {showAvatar && !mine && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            {senderName}
          </span>
        )}
        <div style={{
          padding: '9px 13px',
          background: mine ? color : 'var(--surface-2)',
          borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          fontSize: '14px', lineHeight: '1.5',
          color: mine ? 'white' : 'var(--text-primary)',
          wordBreak: 'break-word',
        }}>
          {msg.content}
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
          {time}
        </span>
      </div>
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0 4px' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}

function groupByDate(messages) {
  const groups = {};
  messages.forEach(msg => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return Object.entries(groups);
}
