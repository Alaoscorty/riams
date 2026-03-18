import { Toaster } from '@/components/ui/toaster'
import { FirebaseClientProvider } from '@/firebase/client-provider'
import { BrowserRouter } from 'react-router-dom'
import Router from './Router'

export default function App() {
  return (
    <div className="font-body antialiased selection:bg-primary selection:text-primary-foreground min-h-screen">
      <FirebaseClientProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
        <Toaster />
      </FirebaseClientProvider>
    </div>
  )
}
