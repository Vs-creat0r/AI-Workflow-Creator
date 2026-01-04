import { ThemeProvider } from "@/components/theme-provider"
import { Shell } from "@/components/layout/shell"
import { ChatPage } from "@/pages/chat"
import { VisualizerPage } from "@/pages/visualizer"
import { TemplatesPage } from "@/pages/templates"
import { HistoryPage } from "@/pages/history"
import { SettingsPage } from "@/pages/settings"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { useWorkflowStore } from "@/lib/store"
import { useEffect } from "react"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
      {
        path: "visualizer",
        element: <VisualizerPage />,
      },
      {
        path: "templates",
        element: <TemplatesPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
])

function App() {
  const { initializeSession } = useWorkflowStore()

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
