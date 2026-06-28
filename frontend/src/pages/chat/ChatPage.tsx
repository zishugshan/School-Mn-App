import { useState, useEffect, useRef } from 'react'
import {
  Box, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, TextField, IconButton, Badge, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, InputAdornment, CircularProgress,
} from '@mui/material'
import { Send, Search, Circle } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { chatApi } from '@/api/chat.api'
import type { ChatConversation, ChatMessage, ChatUser } from '@/types'

export default function ChatPage() {
  const { user } = useAuth()
  const currentUserId = user?.id || ''
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ChatUser[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConv = conversations.find(c => c.userId === selectedUserId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!currentUserId) return
    setLoading(true)
    chatApi.getConversations(currentUserId).then(r => {
      const data = r.data?.data || []
      setConversations(Array.isArray(data) ? data : [])
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].userId)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [currentUserId])

  useEffect(() => {
    if (!currentUserId || !selectedUserId) return
    chatApi.getMessages(currentUserId, selectedUserId).then(r => {
      const data = r.data?.data || []
      setMessages(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [currentUserId, selectedUserId])

  useEffect(() => {
    if (!currentUserId || conversations.length === 0) return
    const interval = setInterval(() => {
      chatApi.getConversations(currentUserId).then(r => {
        const data = r.data?.data || []
        setConversations(Array.isArray(data) ? data : [])
      }).catch(() => {})
      if (selectedUserId) {
        chatApi.getMessages(currentUserId, selectedUserId).then(r => {
          const data = r.data?.data || []
          setMessages(Array.isArray(data) ? data : [])
        }).catch(() => {})
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [currentUserId, selectedUserId, conversations.length])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    setSearching(true)
    const timer = setTimeout(() => {
      chatApi.searchUsers(searchQuery).then(r => {
        const data = r.data?.data || []
        setSearchResults(Array.isArray(data) ? data.filter((u: any) => String(u.id) !== currentUserId) : [])
      }).catch(() => {}).finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, currentUserId])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId || !currentUserId) return
    try {
      await chatApi.sendMessage({
        senderId: Number(currentUserId),
        receiverId: Number(selectedUserId),
        content: newMessage,
      })
      setNewMessage('')
      const r = await chatApi.getMessages(currentUserId, selectedUserId)
      const data = r.data?.data || []
      setMessages(Array.isArray(data) ? data : [])
      const cr = await chatApi.getConversations(currentUserId)
      const cdata = cr.data?.data || []
      setConversations(Array.isArray(cdata) ? cdata : [])
    } catch { /* ignore */ }
  }

  const startConversation = (targetUser: ChatUser) => {
    setSelectedUserId(targetUser.id)
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    if (currentUserId) {
      chatApi.getMessages(currentUserId, targetUser.id).then(r => {
        const data = r.data?.data || []
        setMessages(Array.isArray(data) ? data : [])
      }).catch(() => {})
    }
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2 }}>
      <Paper sx={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>Chats</Typography>
          <IconButton size="small" onClick={() => setSearchOpen(true)}>
            <Search />
          </IconButton>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
        ) : (
          <List sx={{ flex: 1, overflow: 'auto' }} disablePadding>
            {conversations.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                No conversations yet. Click search to find someone.
              </Typography>
            )}
            {conversations.map((conv) => (
              <ListItem
                key={conv.userId}
                onClick={() => setSelectedUserId(conv.userId)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedUserId === conv.userId ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={conv.unreadCount > 0 ? <Circle sx={{ fontSize: 12, color: '#4caf50' }} /> : undefined}
                  >
                    <Avatar>{conv.userName?.charAt(0) || '?'}</Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={conv.userName}
                  secondary={conv.lastMessage?.length > 40 ? conv.lastMessage.slice(0, 40) + '...' : conv.lastMessage || ''}
                  primaryTypographyProps={{ fontWeight: selectedUserId === conv.userId ? 700 : 400, noWrap: true }}
                  secondaryTypographyProps={{ noWrap: true }}
                />
                {conv.unreadCount > 0 && (
                  <Chip size="small" label={conv.unreadCount} color="primary" sx={{ height: 20, minWidth: 20 }} />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUserId ? (
          <>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600}>
                {selectedConv?.userName || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedConv?.userRole?.replace('_', ' ') || ''}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {messages.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No messages yet. Say hello!
                </Typography>
              )}
              {messages.map((msg) => {
                const isMine = String(msg.senderId) === currentUserId
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: isMine ? 'primary.main' : 'grey.100',
                        color: isMine ? '#fff' : 'text.primary',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Paper>
                  </Box>
                )
              })}
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
          </>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <Typography variant="body1" color="text.secondary">
              Select a conversation or search for someone to chat with
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Find Someone to Chat With</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth autoFocus margin="dense"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
          />
          {searching && <Box textAlign="center" py={2}><CircularProgress size={24} /></Box>}
          {!searching && searchResults.length === 0 && searchQuery.trim() && (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              No users found
            </Typography>
          )}
          <List>
            {searchResults.map((u) => (
              <ListItem
                key={u.id}
                onClick={() => startConversation(u)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
              >
                <ListItemAvatar>
                  <Avatar>{u.name?.charAt(0) || '?'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.name}
                  secondary={`${u.email} — ${u.role?.replace('_', ' ')}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
