import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Container, Typography, Grid, Card, CardContent,
  AppBar, Toolbar, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Divider, CircularProgress,
} from '@mui/material'
import {
  Menu as MenuIcon, School, CheckCircle, People, Assessment,
  CalendarMonth, LibraryBooks, DirectionsBus, AttachMoney,
} from '@mui/icons-material'
import api from '@/api/axios'
import { toast } from 'react-toastify'

const features = [
  { icon: <People />, title: 'Student Management', desc: 'Admissions, profiles, attendance, marks, and behavior tracking all in one place.' },
  { icon: <Assessment />, title: 'Exams & Grades', desc: 'Create tests, enter marks, generate report cards, and analyze performance trends.' },
  { icon: <CalendarMonth />, title: 'Timetable & Events', desc: 'Drag-and-drop timetable builder, event calendar, and automated scheduling.' },
  { icon: <LibraryBooks />, title: 'Library & Resources', desc: 'Manage book issues, digital resources, and library inventory.' },
  { icon: <AttachMoney />, title: 'Fees & Finance', desc: 'Online fee collection, receipts, dues tracking, and financial reports.' },
  { icon: <DirectionsBus />, title: 'Transport', desc: 'Route management, GPS tracking, vehicle maintenance, and transport fees.' },
]

const plans = [
  { name: 'Starter', price: 'Free', students: 'Up to 100', features: ['Core modules', 'Basic reports', 'Email support'] },
  { name: 'Standard', price: '$49', period: '/mo', students: 'Up to 500', features: ['All modules', 'Advanced analytics', 'Phone & email support', 'Custom branding'] },
  { name: 'Premium', price: '$99', period: '/mo', students: 'Unlimited', features: ['Everything in Standard', 'Dedicated account manager', 'API access', 'Priority support', 'SLA guarantee'] },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [contactOpen, setContactOpen] = useState(false)
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', school: '', message: '' })

  return (
    <Box>
      <AppBar position="fixed" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          <School color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>SchoolMS</Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button onClick={() => navigate('/login')}>Login</Button>
            <Button variant="contained" onClick={() => setContactOpen(true)}>Get Started</Button>
          </Box>
          <IconButton sx={{ display: { md: 'none' } }}><MenuIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: 8 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.2 }}>
                The Complete School Management Solution
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 4, lineHeight: 1.6 }}>
                Manage students, teachers, attendance, grades, fees, timetable, and more — all from one intuitive platform. Built for schools, by educators.
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" size="large" onClick={() => setContactOpen(true)}>Start Free Trial</Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/login')}>Login</Button>
              </Box>
              <Box display="flex" gap={3} mt={4}>
                <Box><Typography variant="h4" fontWeight={700} color="primary">500+</Typography><Typography variant="body2" color="text.secondary">Schools</Typography></Box>
                <Box><Typography variant="h4" fontWeight={700} color="primary">50K+</Typography><Typography variant="body2" color="text.secondary">Students</Typography></Box>
                <Box><Typography variant="h4" fontWeight={700} color="primary">99.9%</Typography><Typography variant="body2" color="text.secondary">Uptime</Typography></Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'primary.light', borderRadius: 4, p: 4, textAlign: 'center', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <School sx={{ fontSize: 120, color: 'primary.main', opacity: 0.6 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>

        <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Typography variant="h4" fontWeight={700} textAlign="center" mb={6}>Everything your school needs</Typography>
            <Grid container spacing={3}>
              {features.map((f, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Box color="primary.main" mb={1}>{f.icon}</Box>
                      <Typography variant="h6" fontWeight={600} mb={1}>{f.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Container maxWidth="md">
            <Typography variant="h4" fontWeight={700} textAlign="center" mb={2}>How it works</Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={6}>
              Get your school online in minutes. No technical expertise required.
            </Typography>
            <Grid container spacing={3}>
              {[
                { step: '1', title: 'Sign up', desc: 'Create your school account. Free trial, no credit card needed.' },
                { step: '2', title: 'Import data', desc: 'Upload your students, teachers, and classes. We support CSV and manual entry.' },
                { step: '3', title: 'Go live', desc: 'Start taking attendance, publishing grades, and managing your school.' },
              ].map((item, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Box textAlign="center">
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontSize: 24, fontWeight: 700 }}>{item.step}</Box>
                    <Typography variant="h6" fontWeight={600} mb={1}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Typography variant="h4" fontWeight={700} textAlign="center" mb={6}>Simple, transparent pricing</Typography>
            <Grid container spacing={3} justifyContent="center">
              {plans.map((plan, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ height: '100%', textAlign: 'center', position: 'relative', ...(i === 1 ? { border: 2, borderColor: 'primary.main' } : {}) }}>
                    {i === 1 && <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'primary.main', color: '#fff', px: 1.5, py: 0.3, borderRadius: 1, fontSize: 12, fontWeight: 600 }}>Popular</Box>}
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" fontWeight={700} mb={1}>{plan.name}</Typography>
                      <Box display="flex" justifyContent="center" alignItems="baseline" mb={1}>
                        <Typography variant="h3" fontWeight={800}>{plan.price}</Typography>
                        {plan.period && <Typography variant="body2" color="text.secondary">{plan.period}</Typography>}
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={3}>{plan.students}</Typography>
                      <Box textAlign="left">
                        {plan.features.map((f, j) => (
                          <Box key={j} display="flex" alignItems="center" gap={1} mb={1}>
                            <CheckCircle color="primary" fontSize="small" />
                            <Typography variant="body2">{f}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Button variant={i === 1 ? 'contained' : 'outlined'} fullWidth sx={{ mt: 3 }} onClick={() => setContactOpen(true)}>
                        {i === 0 ? 'Start Free' : 'Contact Sales'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box sx={{ bgcolor: 'primary.main', color: '#fff', py: { xs: 6, md: 8 }, textAlign: 'center' }}>
          <Container maxWidth="sm">
            <Typography variant="h4" fontWeight={700} mb={2}>Ready to transform your school?</Typography>
            <Typography variant="body1" mb={4} sx={{ opacity: 0.9 }}>Join 500+ schools already using SchoolMS. Start your free trial today.</Typography>
            <Button variant="contained" size="large" sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }} onClick={() => setContactOpen(true)}>
              Get Started Free
            </Button>
          </Container>
        </Box>

        <Box sx={{ bgcolor: 'grey.900', color: 'grey.400', py: 4 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <School sx={{ color: '#fff' }} />
                  <Typography variant="h6" fontWeight={700} color="#fff">SchoolMS</Typography>
                </Box>
                <Typography variant="body2">The complete school management platform. Empowering educators worldwide.</Typography>
              </Grid>
              <Grid item xs={6} md={2}><Typography variant="subtitle2" color="#fff" mb={1}>Product</Typography><Typography variant="body2">Features</Typography><Typography variant="body2">Pricing</Typography><Typography variant="body2">Integrations</Typography></Grid>
              <Grid item xs={6} md={2}><Typography variant="subtitle2" color="#fff" mb={1}>Company</Typography><Typography variant="body2">About</Typography><Typography variant="body2">Blog</Typography><Typography variant="body2">Careers</Typography></Grid>
              <Grid item xs={6} md={2}><Typography variant="subtitle2" color="#fff" mb={1}>Support</Typography><Typography variant="body2">Documentation</Typography><Typography variant="body2">API</Typography><Typography variant="body2">Contact</Typography></Grid>
              <Grid item xs={6} md={2}><Typography variant="subtitle2" color="#fff" mb={1}>Legal</Typography><Typography variant="body2">Privacy</Typography><Typography variant="body2">Terms</Typography></Grid>
            </Grid>
            <Divider sx={{ my: 3, borderColor: 'grey.700' }} />
            <Typography variant="body2" textAlign="center">&copy; {new Date().getFullYear()} SchoolMS. All rights reserved.</Typography>
          </Container>
        </Box>
      </Box>

      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Get Started</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField size="small" label="Your Name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
            <TextField size="small" label="Email" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
            <TextField size="small" label="Phone" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
            <TextField size="small" label="School Name" value={contactForm.school} onChange={e => setContactForm(f => ({ ...f, school: e.target.value }))} />
            <TextField size="small" label="Message" multiline rows={3} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={contactSubmitting} onClick={async () => {
            setContactSubmitting(true)
            try {
              await api.post('/contact', {
                name: contactForm.name, email: contactForm.email,
                phone: contactForm.phone, schoolName: contactForm.school,
                message: contactForm.message,
              })
              setContactOpen(false)
              setContactForm({ name: '', email: '', phone: '', school: '', message: '' })
              toast.success('Thank you! We will contact you shortly.')
            } catch { toast.error('Failed to submit. Please try again.') }
            setContactSubmitting(false)
          }}>{contactSubmitting ? <CircularProgress size={20} /> : 'Submit'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
