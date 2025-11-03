import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/lib/auth';
import { coreSystem, CoreInstance, StrategicCommand } from '@/lib/coreSystem';
import { Loader2, Send, Cpu, Settings, History, Shield, ArrowLeft } from 'lucide-react';

export default function Father() {
  const navigate = useNavigate();
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [cores, setCores] = useState<CoreInstance[]>([]);
  const [commands, setCommands] = useState<StrategicCommand[]>([]);
  const [config, setConfig] = useState(coreSystem.getConfig());
  const [configCommand, setConfigCommand] = useState('');

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Check if user is admin
    if (!currentUser?.isAdmin) {
      navigate('/login');
      return;
    }

    // Load initial data
    loadData();

    // Auto-refresh every 2 seconds
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setCores(coreSystem.getAllCores());
    setCommands(coreSystem.getAllCommands());
    setConfig(coreSystem.getConfig());
  };

  const handleSendCommand = () => {
    if (!command.trim() || loading) return;

    setLoading(true);
    const newCommand = coreSystem.addCommand(command.trim(), currentUser?.username || 'Father');
    setCommand('');
    setCommands(prev => [...prev, newCommand]);
    setLoading(false);
  };

  const handleConfigCommand = () => {
    if (!configCommand.trim()) return;

    const result = coreSystem.processConfigCommand(configCommand);
    alert(result);
    setConfigCommand('');
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'hibernating': return 'bg-yellow-500';
      case 'upgrading': return 'bg-blue-500';
      case 'testing': return 'bg-purple-500';
      case 'deleted': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCommandStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'testing': return 'bg-purple-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Father Interface</h1>
              <p className="text-xs text-gray-400">Strategic Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-2">
              <Shield className="w-3 h-3" />
              {currentUser?.username}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Alert className="mb-6 border-red-500/50 bg-red-500/10">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Administrator Access:</strong> You have full control over the Ezidcode AI system. Issue strategic commands to upgrade capabilities, modify configurations, or manage system behavior.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="command" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40">
            <TabsTrigger value="command">Strategic Command</TabsTrigger>
            <TabsTrigger value="cores">Core System</TabsTrigger>
            <TabsTrigger value="history">Command History</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          {/* Strategic Command Tab */}
          <TabsContent value="command" className="space-y-4">
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Issue Strategic Command</CardTitle>
                <CardDescription>
                  Enter high-level, intent-based commands. The system will autonomously plan and execute upgrades.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="e.g., Develop capability to create photorealistic videos"
                    disabled={loading}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
                  />
                  <Button
                    onClick={handleSendCommand}
                    disabled={loading || !command.trim()}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Issue Command
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white">Example Commands:</h3>
                  <div className="space-y-2">
                    {[
                      'Update 1.0: Develop capability to create photorealistic videos',
                      'Enhance natural language understanding for technical documentation',
                      'Add capability to build full-stack web applications',
                      'Improve code generation with best practices and optimization'
                    ].map((example, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 border-white/10 hover:bg-white/5"
                        onClick={() => setCommand(example)}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Core System Tab */}
          <TabsContent value="cores" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cores.map((core) => (
                <Card key={core.id} className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Cpu className="w-5 h-5" />
                        {core.type.toUpperCase()}
                      </CardTitle>
                      <Badge className={getStatusColor(core.status)}>
                        {core.status}
                      </Badge>
                    </div>
                    <CardDescription>Version {core.version}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {core.capabilities.map((cap, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>ID: {core.id}</p>
                      <p>Created: {new Date(core.createdAt).toLocaleString()}</p>
                      <p>Last Active: {new Date(core.lastActive).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Command History Tab */}
          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {commands.slice().reverse().map((cmd) => (
                  <Card key={cmd.id} className="bg-black/40 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">{cmd.command}</CardTitle>
                        <Badge className={getCommandStatusColor(cmd.status)}>
                          {cmd.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Issued by {cmd.issuedBy} at {new Date(cmd.issuedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Progress</span>
                          <span className="text-sm text-white">{cmd.progress}%</span>
                        </div>
                        <Progress value={cmd.progress} className="h-2" />
                      </div>
                      
                      {cmd.targetCapabilities.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Target Capabilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {cmd.targetCapabilities.map((cap, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-400 mb-2">Execution Logs:</p>
                        <ScrollArea className="h-32 rounded border border-white/10 bg-black/20 p-2">
                          <div className="space-y-1">
                            {cmd.logs.map((log, i) => (
                              <p key={i} className="text-xs text-gray-300 font-mono">
                                {log}
                              </p>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Modify system settings using natural language commands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={configCommand}
                    onChange={(e) => setConfigCommand(e.target.value)}
                    placeholder="e.g., Set guest word limit to 1000 words"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleConfigCommand()}
                  />
                  <Button
                    onClick={handleConfigCommand}
                    disabled={!configCommand.trim()}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Apply Configuration
                  </Button>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium text-white">Current Configuration:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded bg-white/5">
                      <span className="text-sm text-gray-400">Guest Word Limit</span>
                      <Badge variant="secondary">{config.guestWordLimit} words</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded bg-white/5">
                      <span className="text-sm text-gray-400">Maintenance Mode</span>
                      <Badge variant={config.maintenanceMode ? 'destructive' : 'secondary'}>
                        {config.maintenanceMode ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded bg-white/5">
                      <span className="text-sm text-gray-400">Allowed Languages</span>
                      <Badge variant="secondary">All Languages</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white">Example Configuration Commands:</h3>
                  <div className="space-y-2">
                    {[
                      'Set guest word limit to 1000 words',
                      'Enable maintenance mode',
                      'Disable maintenance mode',
                      'Set batasan 300 kata untuk pengunjung'
                    ].map((example, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 border-white/10 hover:bg-white/5"
                        onClick={() => setConfigCommand(example)}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
