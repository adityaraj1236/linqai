/**
 * Transloadit Utility Functions
 * Simple helpers for image processing with Transloadit
 */

interface TransloaditAssembly {
    ok: string;
    assembly_id: string;
    assembly_url: string;
    results?: Record<string, Array<{ url: string; ssl_url?: string }>>;
    error?: string;
  }
  
  interface TransloaditStep {
    use?: string | string[];
    robot: string;
    [key: string]: any;
  }
  
  interface TransloaditParams {
    auth: {
      key: string;
    };
    template_id?: string;
    steps?: Record<string, TransloaditStep>;
    fields?: Record<string, string>;
  }
  
  export class TransloaditClient {
    private authKey: string;
  
    constructor(authKey: string) {
      this.authKey = authKey;
    }
  
    /**
     * Create and submit an assembly
     */
    async createAssembly(
      file: Buffer | Blob,
      params: Omit<TransloaditParams, 'auth'>,
      fileName: string = 'upload.png'
    ): Promise<TransloaditAssembly> {
      const formData = new FormData();
  
      const fullParams: TransloaditParams = {
        auth: {
          key: this.authKey,
        },
        ...params,
      };
  
      formData.append('params', JSON.stringify(fullParams));
  
      // Handle both Buffer and Blob
      if (file instanceof Buffer) {
        const blob = new Blob([file], { type: 'image/png' });
        formData.append('file', blob, fileName);
      } else {
        formData.append('file', file, fileName);
      }
  
      const response = await fetch('https://api2.transloadit.com/assemblies', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Transloadit API error: ${JSON.stringify(errorData)}`);
      }
  
      return response.json();
    }
  
    /**
     * Poll assembly status until completion
     */
    async waitForCompletion(
      assemblyUrl: string,
      options: {
        maxAttempts?: number;
        pollInterval?: number;
      } = {}
    ): Promise<TransloaditAssembly> {
      const { maxAttempts = 60, pollInterval = 1000 } = options;
  
      let attempts = 0;
  
      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
  
        const response = await fetch(assemblyUrl);
        const data: TransloaditAssembly = await response.json();
  
        if (data.ok === 'ASSEMBLY_COMPLETED') {
          return data;
        }
  
        if (data.error) {
          throw new Error(`Assembly failed: ${data.error}`);
        }
  
        attempts++;
      }
  
      throw new Error('Assembly timeout - processing took too long');
    }
  
    /**
     * Get result URL from assembly data
     */
    getResultUrl(
      assembly: TransloaditAssembly,
      stepName: string,
      index: number = 0
    ): string | null {
      const result = assembly.results?.[stepName]?.[index];
      return result?.ssl_url || result?.url || null;
    }
  
    /**
     * Get the best available result from multiple step names
     */
    getBestResultUrl(
      assembly: TransloaditAssembly,
      stepNames: string[]
    ): string | null {
      for (const stepName of stepNames) {
        const url = this.getResultUrl(assembly, stepName);
        if (url) return url;
      }
      return null;
    }
  }
  
  /**
   * Predefined Transloadit step builders
   */
  export const TransloaditSteps = {
    upload(): TransloaditStep {
      return {
        robot: '/upload/handle',
      };
    },
  
    filterImages(useStep: string = ':original'): TransloaditStep {
      return {
        use: useStep,
        robot: '/file/filter',
        accepts: [['${file.mime}', 'regex', 'image']],
        error_on_decline: true,
      };
    },
  
    virusScan(useStep: string): TransloaditStep {
      return {
        use: useStep,
        robot: '/file/virusscan',
        error_on_decline: true,
      };
    },
  
    resize(
      useStep: string,
      width: number,
      height: number,
      strategy: 'fit' | 'crop' | 'fillcrop' | 'min' | 'stretch' = 'fit'
    ): TransloaditStep {
      return {
        use: useStep,
        robot: '/image/resize',
        resize_strategy: strategy,
        width,
        height,
      };
    },
  
    optimize(useStep: string, progressive: boolean = true): TransloaditStep {
      return {
        use: useStep,
        robot: '/image/optimize',
        progressive,
      };
    },
  
    faceDetect(useStep: string, crop: boolean = true): TransloaditStep {
      return {
        use: useStep,
        robot: '/image/facedetect',
        crop,
      };
    },
  };
  
  /**
   * Create complete image processing pipeline
   * Face detection is optional and won't break the pipeline if no face is found
   */
  export function createImagePipeline(width: number, height: number) {
    return {
      // Step 1: Handle upload
      ':original': TransloaditSteps.upload(),
      
      // Step 2: Filter to only allow images
      'filtered-image': TransloaditSteps.filterImages(),
      
      // Step 3: Virus scan (optional but recommended)
      'scanned': TransloaditSteps.virusScan('filtered-image'),
      
      // Step 4: Resize to target dimensions
      'resized-image': TransloaditSteps.resize('scanned', width, height, 'fit'),
      
      // Step 5: Optimize (compress) the image
      'compressed-image': TransloaditSteps.optimize('resized-image'),
      
      // Step 6: OPTIONAL face detection and crop
      // If no face is found, this step will be skipped but won't fail the assembly
      'facecropped-image': {
        use: 'compressed-image',
        robot: '/image/facedetect',
        crop: true,
        faces: 'max-confidence',
        // IMPORTANT: Don't error if no face found - just skip this step
        error_on_decline: false,
      },
      
      // Step 7: EXPORT - Store the results!
      'exported': {
        use: ['facecropped-image', 'compressed-image', 'resized-image'],
        robot: '/s3/store',
        credentials: 'transloadit_temp_store', // Use Transloadit's temporary storage
      },
    };
  }