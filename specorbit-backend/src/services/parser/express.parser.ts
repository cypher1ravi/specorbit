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
  middlewares?: string[];
  handler?: string;
}

export interface RouterMount {
  path: string;
  variableName: string;
  sourceLocation: string;
}

export interface ImportInfo {
  variableName: string;
  filePath: string;
  isDefault: boolean;
}

interface ParsedFileResult {
  routes: ParsedRoute[];
  mounts: RouterMount[];
  imports: ImportInfo[];
}

export class ExpressParser {
  private project: Project;
  private parsedFiles: Set<string> = new Set();
  private fileCache: Map<string, ParsedFileResult> = new Map();
  private routerVariables: Set<string> = new Set(['app', 'router', 'apiRouter', 'Router']);

  constructor() {
    this.project = new Project({ 
      useInMemoryFileSystem: true,
      compilerOptions: { 
        allowJs: true,
        target: 99, // ESNext
        module: 99  // ESNext
      } 
    });
  }

  /**
   * Main entry point - parses a file and recursively follows route imports
   */
  parseFile(filePath: string, baseDir: string): ParsedRoute[] {
    this.parsedFiles.clear();
    this.fileCache.clear();
    const allRoutes: ParsedRoute[] = [];
    
    logger.info(`\n🚀 Starting parse from: ${filePath}`);
    this._parseFileRecursive(filePath, baseDir, '', allRoutes);
    logger.info(`\n✅ Total routes found: ${allRoutes.length}\n`);
    
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
      logger.error(`   ❌ Could not read file: ${filePath} - ${e.message}`);
      return;
    }

    const { routes, mounts, imports } = this.parseCode(code, relativePath);

    // 1. Register routes found in the current file
    for (const route of routes) {
      const fullPath = this.combinePaths(mountPrefix, route.path);
      allRoutes.push({
        ...route,
        path: fullPath
      });
    }

    // 2. LOGICAL BRIDGE: Handle index.ts importing app.ts
    // If this is an entry file that imports 'app', follow it automatically.
    const isEntryFile = /index\.(ts|js|tsx|jsx)$|server\.(ts|js|tsx|jsx)$/.test(relativePath);
    if (isEntryFile) {
      const appImport = imports.find(imp => 
        imp.variableName.toLowerCase() === 'app' || 
        imp.variableName.toLowerCase() === 'server'
      );

      if (appImport) {
        const resolvedAppPath = this.resolveImportPath(appImport.filePath, filePath, baseDir);
        if (resolvedAppPath) {
          logger.info(`   🔗 Logical Bridge: Following 'app' import from ${relativePath} to ${path.relative(baseDir, resolvedAppPath)}`);
          this._parseFileRecursive(resolvedAppPath, baseDir, mountPrefix, allRoutes);
        }
      }
    }

    // 3. Follow mounted routers (standard app.use logic)
    for (const mount of mounts) {
      const importInfo = imports.find(imp => imp.variableName === mount.variableName);
      
      if (!importInfo) {
        logger.warn(`   ⚠️  Could not find import for router: ${mount.variableName} in ${relativePath}`);
        continue;
      }

      const resolvedPath = this.resolveImportPath(importInfo.filePath, filePath, baseDir);
      
      if (!resolvedPath) {
        logger.warn(`   ⚠️  Could not resolve import path: ${importInfo.filePath} from ${relativePath}`);
        continue;
      }

      logger.info(`   🔄 Following mount: ${mount.path} -> ${path.relative(baseDir, resolvedPath)}`);
      
      const newMountPrefix = this.combinePaths(mountPrefix, mount.path);
      this._parseFileRecursive(resolvedPath, baseDir, newMountPrefix, allRoutes);
    }
  }

  /**
   * Parse a single file's code and extract routes, mounts, and imports
   */
  parseCode(code: string, fileName: string = 'file.ts', options?: { silent?: boolean }): ParsedFileResult {
    const normalizedFileName = fileName.replace(/\\/g, '/');
    
    if (this.fileCache.has(normalizedFileName)) {
      return this.fileCache.get(normalizedFileName)!;
    }

    try {
      if (!options?.silent) {
        logger.info(`   📄 [PARSE] Parsing ${normalizedFileName}...`);
      }
      
      const sourceFile = this.project.createSourceFile(normalizedFileName, code, { overwrite: true });
      
      const routes: ParsedRoute[] = [];
      const mounts: RouterMount[] = [];
      const imports: ImportInfo[] = [];

      this.extractImports(sourceFile, imports);
      this.detectRouterVariables(sourceFile);

      const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
      
      for (const call of calls) {
        if (this.isRouterMethod(call, 'use')) {
          const mount = this.extractMount(call, normalizedFileName);
          if (mount) {
            mounts.push(mount);
          }
        }

        const route = this.extractRoute(call, normalizedFileName);
        if (route) {
          routes.push(route);
        }
      }
      
      const result = { routes, mounts, imports };
      this.fileCache.set(normalizedFileName, result);

      return result;
    } catch (e: any) {
      logger.error(`   💥 Parser error in ${fileName}: ${e.message}`);
      return { routes: [], mounts: [], imports: [] };
    }
  }

  private extractImports(sourceFile: any, imports: ImportInfo[]): void {
    sourceFile.getImportDeclarations().forEach((decl: any) => {
      const filePath = decl.getModuleSpecifierValue();
      decl.getNamedImports().forEach((named: any) => {
        imports.push({ variableName: named.getName(), filePath, isDefault: false });
      });
      const defaultImport = decl.getDefaultImport();
      if (defaultImport) {
        imports.push({ variableName: defaultImport.getText(), filePath, isDefault: true });
      }
    });

    sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((varDecl: any) => {
      const initializer = varDecl.getInitializer();
      if (initializer && Node.isCallExpression(initializer)) {
        const expr = initializer.getExpression();
        if (Node.isIdentifier(expr) && expr.getText() === 'require') {
          const args = initializer.getArguments();
          if (args.length > 0 && Node.isStringLiteral(args[0])) {
            imports.push({ 
              variableName: varDecl.getName(), 
              filePath: args[0].getLiteralText(), 
              isDefault: true 
            });
          }
        }
      }
    });
  }

  private detectRouterVariables(sourceFile: any): void {
    sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((varDecl: any) => {
      const initializer = varDecl.getInitializer();
      if (initializer && Node.isCallExpression(initializer)) {
        const callText = initializer.getText();
        if (callText.includes('Router()') || callText.includes('express()')) {
          this.routerVariables.add(varDecl.getName());
        }
      }
    });
  }

  private isRouterMethod(call: CallExpression, methodName?: string): boolean {
    const expr = call.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) return false;
    const callee = expr.getExpression();
    if (methodName && expr.getName() !== methodName) return false;
    return Node.isIdentifier(callee) && this.routerVariables.has(callee.getText());
  }

  private extractMount(call: CallExpression, fileName: string): RouterMount | null {
    const args = call.getArguments();
    if (args.length >= 2) {
      const pathArg = args[0];
      if (Node.isStringLiteral(pathArg) || Node.isNoSubstitutionTemplateLiteral(pathArg)) {
        return {
          path: pathArg.getText().replace(/^['"`]|['"`]$/g, ''),
          variableName: args[1].getText(),
          sourceLocation: fileName
        };
      }
    }
    if (args.length === 1 && Node.isIdentifier(args[0]) && this.routerVariables.has(args[0].getText())) {
      return { path: '/', variableName: args[0].getText(), sourceLocation: fileName };
    }
    return null;
  }

  private extractRoute(call: CallExpression, fileName: string): ParsedRoute | null {
    const expr = call.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) return null;
    const method = expr.getName();
    if (!['get', 'post', 'put', 'delete', 'patch', 'all'].includes(method)) return null;
    if (!this.isRouterMethod(call)) return null;

    const args = call.getArguments();
    if (args.length === 0 || (!Node.isStringLiteral(args[0]) && !Node.isNoSubstitutionTemplateLiteral(args[0]))) return null;

    const routePath = args[0].getText().replace(/^['"`]|['"`]$/g, '');
    const middlewares: string[] = [];
    let handler = 'anonymous';

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (i === args.length - 1) handler = Node.isIdentifier(arg) ? arg.getText() : 'inline function';
      else middlewares.push(arg.getText());
    }

    return {
      method: method.toUpperCase(),
      path: routePath,
      sourceFile: fileName,
      description: `${method.toUpperCase()} endpoint at ${routePath}`,
      parameters: this.extractPathParameters(routePath),
      responses: [{ status: 200, description: 'Success' }],
      middlewares,
      handler
    };
  }

  private extractPathParameters(routePath: string): any[] {
    const params: any[] = [];
    const paramRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    while ((match = paramRegex.exec(routePath)) !== null) {
      params.push({ name: match[1], in: 'path', required: true, type: 'string' });
    }
    return params;
  }

  private resolveImportPath(importPath: string, currentFile: string, baseDir: string): string | null {
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) return null;
    const currentDir = path.dirname(currentFile);
    let resolved = path.resolve(currentDir, importPath);
    const extensions = ['.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js'];
    for (const ext of extensions) {
      if (fs.existsSync(resolved + ext)) return resolved + ext;
    }
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      for (const index of ['index.ts', 'index.js']) {
        if (fs.existsSync(path.join(resolved, index))) return path.join(resolved, index);
      }
    }
    return fs.existsSync(resolved) ? resolved : null;
  }

  private combinePaths(prefix: string, suffix: string): string {
    const p = (prefix || '').replace(/\/$/, '');
    const s = (suffix || '').replace(/^\//, '');
    if (!p && !s) return '/';
    return (p + '/' + s).replace(/\/+/g, '/');
  }
}