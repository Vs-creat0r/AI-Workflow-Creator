import { useWorkflowStore } from "@/lib/store"
import { useTheme } from "@/components/theme-provider"
import {
    Moon, Sun, Monitor, Save, Grid,
    User, Settings as SettingsIcon, AlertTriangle,
    Key, Link2, CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function SettingsPage() {
    const { settings, updateSettings } = useWorkflowStore()
    const { setTheme } = useTheme()

    // Local state for testing connection
    const [isTesting, setIsTesting] = useState(false)
    const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        updateSettings('appearance', { theme: newTheme })
        setTheme(newTheme)
    }

    const testConnection = () => {
        setIsTesting(true)
        setTestStatus('idle')
        // Mock connection test
        setTimeout(() => {
            setIsTesting(false)
            setTestStatus('success')
        }, 1500)
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto">
            <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">

                {/* Header */}
                <div className="mb-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-slate-900 dark:bg-slate-100 rounded-2xl">
                            <SettingsIcon className="w-6 h-6 text-white dark:text-slate-900" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                    </div>
                    <p className="text-lg text-muted-foreground ml-1">Manage your account and application preferences.</p>
                </div>

                <div className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">

                    {/* Section 1: Profile */}
                    <div className="bg-card rounded-xl border shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-purple-500" />
                                <h2 className="text-lg font-semibold">User Profile</h2>
                            </div>
                            <button className="text-sm font-medium text-primary hover:underline">Edit Profile</button>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md">
                                <User className="w-10 h-10 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Dishank</h3>
                                <p className="text-muted-foreground">dishank@example.com</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-xs font-medium text-purple-700 dark:text-purple-300">
                                        Pro Plan
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: n8n Configuration */}
                    <div className="bg-card rounded-xl border shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Link2 className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-semibold">n8n Integration</h2>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">n8n Instance URL</label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={settings.n8n.instanceUrl}
                                        onChange={(e) => updateSettings('n8n', { instanceUrl: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="https://n8n.example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">API Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        value={settings.n8n.apiKey}
                                        onChange={(e) => updateSettings('n8n', { apiKey: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                        placeholder="n8n_api_..."
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-4">
                                <button
                                    onClick={testConnection}
                                    disabled={isTesting}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 h-10 px-4 py-2"
                                >
                                    {isTesting ? "Testing..." : "Test Connection"}
                                </button>
                                {testStatus === 'success' && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in duration-300">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Connected successfully
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Preferences */}
                    <div className="bg-card rounded-xl border shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Monitor className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-semibold">Preferences</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Theme</p>
                                    <p className="text-sm text-muted-foreground">Select your interface color theme.</p>
                                </div>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    {[
                                        { id: 'light', icon: Sun },
                                        { id: 'dark', icon: Moon },
                                        { id: 'system', icon: Monitor }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleThemeChange(t.id as any)}
                                            className={cn(
                                                "p-2 rounded-md transition-all",
                                                settings.appearance.theme === t.id
                                                    ? "bg-white dark:bg-slate-700 shadow-sm text-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <t.icon className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            {/* Auto Save */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                        <Save className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Auto Save Workflows</p>
                                        <p className="text-sm text-muted-foreground">Automatically save changes while you edit.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateSettings('editor', { autoSave: !settings.editor.autoSave })}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                        settings.editor.autoSave ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                                    )}
                                >
                                    <span className={cn(
                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                        settings.editor.autoSave ? "translate-x-6" : "translate-x-1"
                                    )} />
                                </button>
                            </div>

                            {/* Compact Mode */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                                        <Grid className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Compact Node View</p>
                                        <p className="text-sm text-muted-foreground">Show less detail in the visualizer nodes.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateSettings('editor', { minimap: !settings.editor.minimap })} // Reusing minimap prop for demo mock
                                    className={cn(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                        settings.editor.minimap ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                                    )}
                                >
                                    <span className={cn(
                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                        settings.editor.minimap ? "translate-x-6" : "translate-x-1"
                                    )} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Danger Zone */}
                    <div className="rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden">
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 border-b border-red-200 dark:border-red-900/50 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">Danger Zone</h2>
                        </div>

                        <div className="p-6 bg-card space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Clear Workflow History</p>
                                    <p className="text-sm text-muted-foreground">Permanently remove all your saved workflows.</p>
                                </div>
                                <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-md transition-colors border border-transparent hover:border-red-200">
                                    Clear History
                                </button>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-800" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                                </div>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground pt-8 pb-4">
                        <p>Workflow Creator AI v1.0.2</p>
                        <p className="text-xs mt-1 opacity-70">© 2024 All rights reserved.</p>
                    </div>

                </div>
            </div>
        </div>
    )
}
