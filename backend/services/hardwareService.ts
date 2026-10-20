import { exec } from 'child_process';
import util from 'util';
import os from 'os';

const execAsync = util.promisify(exec);

export interface DetectedGPU {
  name: string;
  vendor: 'nvidia' | 'amd' | 'intel' | 'other';
  vramMB?: number;
  driverVersion?: string;
  cudaSupported: boolean;
  discrete: boolean;
}

export interface HardwareProfile {
  cpu: {
    model: string;
    cores: number;
    threads: number;
    architecture: string;
  };
  gpus: DetectedGPU[];
  ramGB: number;
  hasNvidiaCuda: boolean;
  recommendedMode: 'cuda' | 'cpu_gguf';
  activeMode: 'auto' | 'cuda' | 'cpu_gguf';
  options: {
    id: 'auto' | 'cuda' | 'cpu_gguf';
    label: string;
    description: string;
    available: boolean;
    recommended: boolean;
  }[];
}

class HardwareService {
  private cachedProfile: HardwareProfile | null = null;
  private userPreferenceMode: 'auto' | 'cuda' | 'cpu_gguf' = 'auto';

  public async detectHardware(): Promise<HardwareProfile> {
    try {
      const cpus = os.cpus();
      const cpuModel = cpus.length > 0 ? cpus[0].model : 'Processador Desconhecido';
      const threads = cpus.length;
      const totalRamGB = Math.round((os.totalmem() / (1024 * 1024 * 1024)) * 10) / 10;

      // Consultar Win32_VideoController no Windows
      let gpus: DetectedGPU[] = [];
      let hasNvidia = false;

      if (process.platform === 'win32') {
        try {
          const { stdout } = await execAsync(
            'powershell -NoProfile -Command "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion | ConvertTo-Json"'
          );
          
          if (stdout && stdout.trim()) {
            const rawGpuData = JSON.parse(stdout.trim());
            const items = Array.isArray(rawGpuData) ? rawGpuData : [rawGpuData];

            gpus = items.map((item: any) => {
              const name: string = item.Name || 'Controlador de Vídeo';
              const nameLower = name.toLowerCase();
              let vendor: 'nvidia' | 'amd' | 'intel' | 'other' = 'other';
              let cuda = false;
              let discrete = false;

              if (nameLower.includes('nvidia') || nameLower.includes('geforce') || nameLower.includes('rtx') || nameLower.includes('gtx')) {
                vendor = 'nvidia';
                cuda = true;
                discrete = true;
                hasNvidia = true;
              } else if (nameLower.includes('amd') || nameLower.includes('radeon')) {
                vendor = 'amd';
                discrete = true;
              } else if (nameLower.includes('intel')) {
                vendor = 'intel';
                discrete = nameLower.includes('arc');
              }

              const vramMB = item.AdapterRAM ? Math.round(Number(item.AdapterRAM) / (1024 * 1024)) : undefined;

              return {
                name,
                vendor,
                vramMB,
                driverVersion: item.DriverVersion || undefined,
                cudaSupported: cuda,
                discrete,
              };
            });
          }
        } catch (gpuErr) {
          console.warn('[HardwareService] Falha ao consultar GPU via WMI:', gpuErr);
        }

        // Testar se existe nvidia-smi no PATH
        try {
          await execAsync('where.exe nvidia-smi');
          hasNvidia = true;
        } catch {
          // sem nvidia-smi
        }
      }

      // Se não encontrou GPUs via WMI, adicionar fallback genérico
      if (gpus.length === 0) {
        gpus.push({
          name: 'Dispositivo Gráfico Padrão',
          vendor: 'other',
          cudaSupported: false,
          discrete: false,
        });
      }

      const recommendedMode: 'cuda' | 'cpu_gguf' = hasNvidia ? 'cuda' : 'cpu_gguf';

      const options = [
        {
          id: 'auto' as const,
          label: 'Automático (Inteligente)',
          description: hasNvidia
            ? 'Detecta GPU NVIDIA RTX e ativa aceleração CUDA automaticamente'
            : `Detecta CPU Multi-core (${threads} threads) e ativa aceleração GGUF/AVX2 otimizada`,
          available: true,
          recommended: true,
        },
        {
          id: 'cuda' as const,
          label: 'GPU NVIDIA RTX (CUDA)',
          description: hasNvidia
            ? 'Aceleração máxima via Tensor Cores e VRAM da placa dedicada'
            : 'Nenhuma GPU NVIDIA com suporte a CUDA foi detectada nesta máquina',
          available: hasNvidia,
          recommended: hasNvidia,
        },
        {
          id: 'cpu_gguf' as const,
          label: `CPU Otimizado (GGUF / ${threads} Threads)`,
          description: `Sintetiza via CPU com instruções AVX2/AVX-512 e quantização GGUF de alta velocidade`,
          available: true,
          recommended: !hasNvidia,
        },
      ];

      this.cachedProfile = {
        cpu: {
          model: cpuModel,
          cores: Math.ceil(threads / 2),
          threads,
          architecture: process.arch,
        },
        gpus,
        ramGB: totalRamGB,
        hasNvidiaCuda: hasNvidia,
        recommendedMode,
        activeMode: this.userPreferenceMode,
        options,
      };

      return this.cachedProfile;
    } catch (err: any) {
      console.error('[HardwareService] Erro ao detectar hardware:', err);
      return {
        cpu: {
          model: 'Processador x86_64',
          cores: 4,
          threads: 8,
          architecture: process.arch,
        },
        gpus: [{ name: 'Integrada', vendor: 'intel', cudaSupported: false, discrete: false }],
        ramGB: 16,
        hasNvidiaCuda: false,
        recommendedMode: 'cpu_gguf',
        activeMode: 'auto',
        options: [],
      };
    }
  }

  public setPreference(mode: 'auto' | 'cuda' | 'cpu_gguf') {
    this.userPreferenceMode = mode;
    if (this.cachedProfile) {
      this.cachedProfile.activeMode = mode;
    }
  }
}

export const hardwareService = new HardwareService();
