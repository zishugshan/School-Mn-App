import { useState, useEffect, useRef } from 'react'
import {
  Box, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, TextField, IconButton, Badge, Chip,
} from '@mui/material'
import { Send, Circle } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'

interface Message {
  id: string; senderId: string; senderName: string; content: string; timestamp: string
}

interface Conversation {
  id: string; name: string; photo?: string; lastMessage?: string; unreadCount: number; online?: boolean
}

const conversations: Conversation[] = [
  { id: '1', name: 'John Doe', lastMessage: 'When is the next test?', unreadCount: 2, online: true },
  { id: '2', name: 'Jane Smith', lastMessage: 'Homework submitted', unreadCount: 0, online: false },
  { id: '3', name: 'Alice Johnson', lastMessage: 'Thank you!', unreadCount: 1, online: true },
  { id: '4', name: 'Mr. Wilson', lastMessage: 'Class tomorrow at 9 AM', unreadCount: 0, online: false },
]

const initialMessages: Message[] = [
  { id: 'm1', senderId: '1', senderName: 'John Doe', content: 'Hello, when is the next test?', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', senderId: 'me', senderName: 'You', content: 'It is scheduled for July 15th', timestamp: new Date(Date.now() - 3500000).toISOString() },
  { id: 'm3', senderId: '1', senderName: 'John Doe', content: 'Thank you!', timestamp: new Date(Date.now() - 3000000).toISOString() },
]

export default function ChatPage() {
  const { user } = useAuth()
  const [selectedConv, setSelectedConv] = useState('1')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => [...prev])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSend = () => {
    if (!newMessage.trim()) return
    const msg: Message = {
      id: `m${Date.now()}`, senderId: 'me', senderName: user?.firstName || 'You',
      content: newMessage, timestamp: new Date().toISOString(),
    }
    setMessages([...messages, msg])
    setNewMessage('')
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2 }}>
      <Paper sx={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>Chats</Typography>
        </Box>
        <List sx={{ flex: 1, overflow: 'auto' }} disablePadding>
          {conversations.map((conv) => (
            <ListItem
              key={conv.id}
              button
              selected={selectedConv === conv.id}
              onClick={() => setSelectedConv(conv.id)}
              sx={{
                '&.Mui-selected': { bgcolor: 'primary.light', color: '#fff', '&:hover': { bgcolor: 'primary.light' } },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={conv.online ? <Circle sx={{ fontSize: 12, color: '#4caf50' }} /> : undefined}
                >
                  <Avatar>{conv.name.charAt(0)}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={conv.name}
                secondary={conv.lastMessage}
                primaryTypographyProps={{ fontWeight: selectedConv === conv.id ? 700 : 400 }}
              />
              {conv.unreadCount > 0 && (
                <Chip size="small" label={conv.unreadCount} color="primary" sx={{ height: 20, minWidth: 20 }} />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            {conversations.find((c) => c.id === selectedConv)?.name}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                alignSelf: msg.senderId === 'me' ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.senderId === 'me' ? 'primary.main' : 'grey.100',
                  color: msg.senderId === 'me' ? '#fff' : 'text.primary',
                  borderRadius: msg.senderId === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                }}
              >
                <Typography variant="body2">{msg.content}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth size="small" placeholder="Type a message..."
            value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <IconButton color="primary" onClick={handleSend} disabled={!newMessage.trim()}>
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  )
}
