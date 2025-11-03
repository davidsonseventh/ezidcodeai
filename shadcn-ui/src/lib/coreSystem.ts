export type CoreStatus = 'active' | 'hibernating' | 'upgrading' | 'testing' | 'deleted';
export type CoreType = 'prime' | 'clone' | 'tester';

export interface CoreInstance {
  id: string;
  type: CoreType;
  status: CoreStatus;
  version: string;
  capabilities: string[];
  createdAt: string;
  lastActive: string;
}

export interface StrategicCommand {
  id: string;
  command: string;
  issuedAt: string;
  issuedBy: string;
  status: 'pending' | 'processing' | 'testing' | 'completed' | 'failed';
  targetCapabilities: string[];
  progress: number;
  logs: string[];
}

export interface SystemConfig {
  guestWordLimit: number;
  allowedLanguages: string[];
  maintenanceMode: boolean;
  customSettings: Record<string, string | number | boolean>;
}

const CORES_KEY = 'ezidcode_cores';
const COMMANDS_KEY = 'ezidcode_commands';
const CONFIG_KEY = 'ezidcode_config';
const CHAT_HISTORY_KEY = 'ezidcode_chat_history';

export const coreSystem = {
  // Initialize system with prime core
  initialize: () => {
    const cores = coreSystem.getAllCores();
    if (cores.length === 0) {
      const primeCore: CoreInstance = {
        id: 'core-prime-001',
        type: 'prime',
        status: 'active',
        version: '1.0.0',
        capabilities: [
          'Natural Language Understanding',
          'Multi-language Support',
          'Text Generation',
          'Conversation Management'
        ],
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      localStorage.setItem(CORES_KEY, JSON.stringify([primeCore]));
    }

    // Initialize default config
    const config = coreSystem.getConfig();
    if (!config.guestWordLimit) {
      coreSystem.updateConfig({ guestWordLimit: 500 });
    }
  },

  // Get all cores
  getAllCores: (): CoreInstance[] => {
    const coresJson = localStorage.getItem(CORES_KEY);
    return coresJson ? JSON.parse(coresJson) : [];
  },

  // Get active core
  getActiveCore: (): CoreInstance | null => {
    const cores = coreSystem.getAllCores();
    return cores.find(c => c.status === 'active' && c.type === 'prime') || null;
  },

  // Create clone core
  createClone: (sourceCore: CoreInstance): CoreInstance => {
    const clone: CoreInstance = {
      id: `core-clone-${Date.now()}`,
      type: 'clone',
      status: 'upgrading',
      version: sourceCore.version,
      capabilities: [...sourceCore.capabilities],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    const cores = coreSystem.getAllCores();
    cores.push(clone);
    localStorage.setItem(CORES_KEY, JSON.stringify(cores));

    return clone;
  },

  // Update core status
  updateCoreStatus: (coreId: string, status: CoreStatus) => {
    const cores = coreSystem.getAllCores();
    const core = cores.find(c => c.id === coreId);
    if (core) {
      core.status = status;
      core.lastActive = new Date().toISOString();
      localStorage.setItem(CORES_KEY, JSON.stringify(cores));
    }
  },

  // Add capability to core
  addCapability: (coreId: string, capability: string) => {
    const cores = coreSystem.getAllCores();
    const core = cores.find(c => c.id === coreId);
    if (core && !core.capabilities.includes(capability)) {
      core.capabilities.push(capability);
      localStorage.setItem(CORES_KEY, JSON.stringify(cores));
    }
  },

  // Promote clone to prime
  promoteCloneToPrime: (cloneId: string) => {
    const cores = coreSystem.getAllCores();
    
    // Set old prime to deleted
    cores.forEach(c => {
      if (c.type === 'prime' && c.status === 'active') {
        c.status = 'deleted';
      }
    });

    // Promote clone
    const clone = cores.find(c => c.id === cloneId);
    if (clone) {
      clone.type = 'prime';
      clone.status = 'active';
      const versionParts = clone.version.split('.');
      versionParts[1] = String(Number(versionParts[1]) + 1);
      clone.version = versionParts.join('.');
    }

    localStorage.setItem(CORES_KEY, JSON.stringify(cores));
  },

  // Delete core
  deleteCore: (coreId: string) => {
    const cores = coreSystem.getAllCores().filter(c => c.id !== coreId);
    localStorage.setItem(CORES_KEY, JSON.stringify(cores));
  },

  // Strategic Commands Management
  getAllCommands: (): StrategicCommand[] => {
    const commandsJson = localStorage.getItem(COMMANDS_KEY);
    return commandsJson ? JSON.parse(commandsJson) : [];
  },

  addCommand: (command: string, issuedBy: string): StrategicCommand => {
    const newCommand: StrategicCommand = {
      id: `cmd-${Date.now()}`,
      command,
      issuedAt: new Date().toISOString(),
      issuedBy,
      status: 'pending',
      targetCapabilities: [],
      progress: 0,
      logs: [`Command received: ${command}`]
    };

    const commands = coreSystem.getAllCommands();
    commands.push(newCommand);
    localStorage.setItem(COMMANDS_KEY, JSON.stringify(commands));

    // Trigger upgrade process
    coreSystem.processCommand(newCommand.id);

    return newCommand;
  },

  updateCommandStatus: (commandId: string, status: StrategicCommand['status'], progress: number, log?: string) => {
    const commands = coreSystem.getAllCommands();
    const command = commands.find(c => c.id === commandId);
    if (command) {
      command.status = status;
      command.progress = progress;
      if (log) {
        command.logs.push(`[${new Date().toISOString()}] ${log}`);
      }
      localStorage.setItem(COMMANDS_KEY, JSON.stringify(commands));
    }
  },

  // Process strategic command (simulation)
  processCommand: async (commandId: string) => {
    const command = coreSystem.getAllCommands().find(c => c.id === commandId);
    if (!command) return;

    // Phase 1: Clone
    coreSystem.updateCommandStatus(commandId, 'processing', 10, 'Phase 1: Creating clone core...');
    const activeCore = coreSystem.getActiveCore();
    if (!activeCore) return;

    const clone = coreSystem.createClone(activeCore);
    coreSystem.updateCoreStatus(activeCore.id, 'hibernating');

    // Phase 2: Analysis
    setTimeout(() => {
      coreSystem.updateCommandStatus(commandId, 'processing', 30, 'Phase 2: Analyzing strategic command...');
      
      // Extract capabilities from command
      const capabilities: string[] = [];
      if (command.command.toLowerCase().includes('video')) {
        capabilities.push('Video Generation', '3D Rendering', 'Physics Simulation');
      }
      if (command.command.toLowerCase().includes('aplikasi') || command.command.toLowerCase().includes('application')) {
        capabilities.push('Code Generation', 'Full-stack Development', 'Database Design');
      }
      
      command.targetCapabilities = capabilities;
      
      // Phase 3: Learning & Development
      setTimeout(() => {
        coreSystem.updateCommandStatus(commandId, 'processing', 60, 'Phase 3: Clone core learning new capabilities...');
        
        capabilities.forEach(cap => {
          coreSystem.addCapability(clone.id, cap);
        });

        // Phase 4: Testing
        setTimeout(() => {
          coreSystem.updateCommandStatus(commandId, 'testing', 80, 'Phase 4: Internal testing initiated...');
          coreSystem.updateCoreStatus(clone.id, 'testing');

          // Phase 5: Promotion
          setTimeout(() => {
            coreSystem.updateCommandStatus(commandId, 'completed', 100, 'Phase 5: Clone promoted to Prime. Old core deleted. Upgrade complete!');
            coreSystem.promoteCloneToPrime(clone.id);
            
            // Delete old cores
            const cores = coreSystem.getAllCores();
            cores.forEach(c => {
              if (c.status === 'deleted' || c.status === 'hibernating') {
                coreSystem.deleteCore(c.id);
              }
            });
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  },

  // Config Management
  getConfig: (): SystemConfig => {
    const configJson = localStorage.getItem(CONFIG_KEY);
    return configJson ? JSON.parse(configJson) : {
      guestWordLimit: 500,
      allowedLanguages: ['all'],
      maintenanceMode: false,
      customSettings: {}
    };
  },

  updateConfig: (updates: Partial<SystemConfig>) => {
    const config = coreSystem.getConfig();
    const newConfig = { ...config, ...updates };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  },

  // Process natural language config command
  processConfigCommand: (command: string): string => {
    const lowerCommand = command.toLowerCase();
    
    // Guest word limit
    if (lowerCommand.includes('batasan') || lowerCommand.includes('limit')) {
      const match = command.match(/(\d+)\s*(kata|word)/i);
      if (match) {
        const limit = parseInt(match[1]);
        coreSystem.updateConfig({ guestWordLimit: limit });
        return `Guest word limit updated to ${limit} words.`;
      }
    }

    // Maintenance mode
    if (lowerCommand.includes('maintenance')) {
      const enable = lowerCommand.includes('enable') || lowerCommand.includes('aktifkan');
      coreSystem.updateConfig({ maintenanceMode: enable });
      return `Maintenance mode ${enable ? 'enabled' : 'disabled'}.`;
    }

    return 'Configuration command processed.';
  }
};

// Initialize system
coreSystem.initialize();
