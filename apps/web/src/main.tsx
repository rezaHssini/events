import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PlannerProvider } from './context/PlannerContext'
import { AuthProvider } from './context/AuthContext'
import { TicketsProvider } from './context/TicketsContext'
import { ToastProvider } from './context/ToastContext'
import { UserSettingsProvider } from './context/UserSettingsContext'
import { StoriesProvider } from './context/StoriesContext'
import { PaymentMethodsProvider } from './context/PaymentMethodsContext'
import { MenuTemplatesProvider } from './context/MenuTemplatesContext'
import { SeatingTemplatesProvider } from './context/SeatingTemplatesContext'
import { MenuReviewsProvider } from './context/MenuReviewsContext'
import { SavedEventsProvider } from './context/SavedEventsContext'
import { LoginGateProvider } from './context/LoginGateContext'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoginGateProvider>
          <PlannerProvider>
          <TicketsProvider>
            <UserSettingsProvider>
              <StoriesProvider>
                <PaymentMethodsProvider>
                  <MenuTemplatesProvider>
                    <MenuReviewsProvider>
                      <SeatingTemplatesProvider>
                        <SavedEventsProvider>
                          <ToastProvider>
                            <App />
                          </ToastProvider>
                        </SavedEventsProvider>
                      </SeatingTemplatesProvider>
                    </MenuReviewsProvider>
                  </MenuTemplatesProvider>
                </PaymentMethodsProvider>
              </StoriesProvider>
            </UserSettingsProvider>
          </TicketsProvider>
        </PlannerProvider>
        </LoginGateProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
