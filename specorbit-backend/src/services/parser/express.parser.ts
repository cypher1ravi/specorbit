import { Project, SyntaxKind, CallExpression, Node } from 'ts-morph';
import logger from '../../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

export interface ParsedRoute {
  method: string;
  path: string;
  sourceFile: string;
  description?: string;
  parameters: any[];
  responses: any[];
}

export interface RouterMount {
  path: string;
  variableName: string;
}

export interface ImportInfo {
  variableName: string;
  filePath: string;
}

interface ParsedFileResult {
  routes: ParsedRoute[];
  mounts: RouterMount[];
  imports: ImportInfo[];
}

export class ExpressParser {
  private project: Project;
  private parsedFiles: Set<string> = new Set(); // Track parsed files to avoid circular imports
  private fileCache: Map<string, ParsedFileResult> = new Map();

  constructor() {
    this.project = new Project({ 
      useInMemoryFileSystem: true,
      compilerOptions: { allowJs: true } 
    });
  }

  /**
   * Main entry point - parses a file and recursively follows route imports
   */
  parseFile(filePath: string, baseDir: string): ParsedRoute[] {
    this.parsedFiles.clear(); // Reset for new parsing session
    this.fileCache.clear(); // Clear cache for new session
    const allRoutes: ParsedRoute[] = [];
    
    this._parseFileRecursive(filePath, baseDir, '', allRoutes);
    
    return allRoutes;
  }

  /**
   * Recursive helper that follows imports and combines mount paths
   */
  private _parseFileRecursive(
    filePath: string, 
    baseDir: string, 
    mountPrefix: string, 
    allRoutes: ParsedRoute[]
  ): void {
    const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');

    if (this.parsedFiles.has(relativePath)) {
      logger.info(`   ⏭️  Skipping already parsed: ${relativePath}`);
      return;
    }
    this.parsedFiles.add(relativePath);

    let code: string;
    try {
      code = fs.readFileSync(filePath, 'utf-8');
    } catch (e: any) {
      logger.error(`   ❌ Could not read file: ${filePath}`);
      return;
    }

    const { routes, mounts, imports } = this.parseCode(code, relativePath);

    for (const route of routes) {
      allRoutes.push({
        ...route,
        path: this.combinePaths(mountPrefix, route.path)
      });
    }

    for (const mount of mounts) {
      const importInfo = imports.find(imp => imp.variableName === mount.variableName);
      
      if (!importInfo) {
        logger.warn(`   ⚠️  Could not find import for: ${mount.variableName}`);
        continue;
      }

      const resolvedPath = this.resolveImportPath(importInfo.filePath, filePath, baseDir);
      
      if (!resolvedPath) {
        logger.warn(`   ⚠️  Could not resolve path: ${importInfo.filePath}`);
        continue;
      }

      logger.info(`   🔄 Following mount: ${mount.path} -> ${resolvedPath}`);
      
      const newMountPrefix = this.combinePaths(mountPrefix, mount.path);
      this._parseFileRecursive(resolvedPath, baseDir, newMountPrefix, allRoutes);
    }
  }

  /**
   * Original parseCode method - now only parses a single file's structure
   */
  parseCode(code: string, fileName: string = 'file.ts', options?: { silent: boolean }): ParsedFileResult {
    const normalizedFileName = fileName.replace(/\\/g, '/');
    if (this.fileCache.has(normalizedFileName)) {
      if (!options?.silent) {
        logger.info(`   [CACHE] Using cached results for ${normalizedFileName}`);
      }
      return this.fileCache.get(normalizedFileName)!;
    }

    try {
      if (!options?.silent) {
        logger.info(`   [PARSE] Parsing ${normalizedFileName}...`);
      }
      const sourceFile = this.project.createSourceFile(normalizedFileName, code, { overwrite: true });
      
      const routes: ParsedRoute[] = [];
      const mounts: RouterMount[] = [];
      const imports: ImportInfo[] = [];

      // 1. EXTRACT IMPORTS
      sourceFile.getImportDeclarations().forEach(decl => {
        const path = decl.getModuleSpecifierValue();
        
        decl.getNamedImports().forEach(named => {
          imports.push({ variableName: named.getName(), filePath: path });
        });
        
        const def = decl.getDefaultImport();
        if (def) {
          imports.push({ variableName: def.getText(), filePath: path });
        }
      });

      // 2. SCAN ALL FUNCTION CALLS
      const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
      
      for (const call of calls) {
        if (this.isCallTo(call, 'use')) {
          const args = call.getArguments();
          if (args.length >= 2) {
             const pathArg = args[0];
             if (Node.isStringLiteral(pathArg) || Node.isNoSubstitutionTemplateLiteral(pathArg)) {
                const pathVal = pathArg.getText().replace(/^['"`]|['"`]$/g, '');
                const routerVar = args[1].getText();
                
                if (!options?.silent) {
                  logger.info(`   👉 Found Mount: "${pathVal}" -> loads "${routerVar}"`);
                }
                mounts.push({ path: pathVal, variableName: routerVar });
             }
          }
        }

        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        const expr = call.getExpression();
        
        if (Node.isPropertyAccessExpression(expr) && methods.includes(expr.getName())) {
           if (call.getArguments().length >= 2) {
              const route = this.extractRouteInfo(call, normalizedFileName);
              if (route) {
                if (!options?.silent) {
                  logger.info(`   👉 Found Route: ${route.method} ${route.path}`);
                }
                routes.push(route);
              }
           }
        }
      }
      
      const result = { routes, mounts, imports };
      this.fileCache.set(normalizedFileName, result);

      return result;

    } catch (e: any) {
      logger.error(`Parser crashed on ${fileName}: ${e.message}`);
      return { routes: [], mounts: [], imports: [] };
    }
  }

  /**
   * Resolves an import path to an actual file path
   */
  private resolveImportPath(importPath: string, currentFile: string, baseDir: string): string | null {
    // Skip node_modules imports
    if (!importPath.startsWith('.')) {
      return null;
    }

    const currentDir = path.dirname(currentFile);
    let resolved = path.resolve(currentDir, importPath);

    // Try common extensions
    const extensions = ['.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js'];
    
    for (const ext of extensions) {
      const testPath = resolved + ext;
      if (fs.existsSync(testPath)) {
        return testPath;
      }
    }

    // If already has extension
    if (fs.existsSync(resolved)) {
      return resolved;
    }

    return null;
  }

  /**
   * Combines two URL paths correctly
   */
  private combinePaths(prefix: string, suffix: string): string {
    // Remove trailing slash from prefix
    const cleanPrefix = prefix.replace(/\/$/, '');
    // Ensure suffix starts with /
    const cleanSuffix = suffix.startsWith('/') ? suffix : '/' + suffix;
    
    return cleanPrefix + cleanSuffix;
  }

  private isCallTo(call: CallExpression, methodName: string): boolean {
    const expr = call.getExpression();
    return Node.isPropertyAccessExpression(expr) && expr.getName() === methodName;
  }

  private extractRouteInfo(call: CallExpression, fileName: string): ParsedRoute | null {
    try {
      const expr = call.getExpression();
      if (!Node.isPropertyAccessExpression(expr)) return null;

      const method = expr.getName().toUpperCase();
      const args = call.getArguments();
      const pathArg = args[0];
      
      const path = pathArg.getText().replace(/^['"`]|['"`]$/g, '');

      return {
        method,
        path,
        sourceFile: fileName,
        description: 'Auto-detected endpoint',
        parameters: [],
        responses: [{ status: 200, description: 'Success' }]
      };
    } catch (e) {
      return null;
    }
  }
}

// Usage example:
// const parser = new ExpressParser();
// const routes = parser.parseFile('./src/app.ts', './src');
// console.log(routes);