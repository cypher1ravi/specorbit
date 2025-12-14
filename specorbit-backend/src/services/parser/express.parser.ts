import { Project, SyntaxKind, CallExpression, Node } from 'ts-morph';
import logger from '../../utils/logger';

export interface ParsedRoute {
  method: string;
  path: string;
  sourceFile: string;
  description?: string;
  parameters: {
    name: string;
    in: 'path' | 'query' | 'body' | 'header';
    required: boolean;
  }[];
  responses: {
    status: number;
    description?: string;
  }[];
}

export class ExpressParser {
  private project: Project;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
    });
  }

  parseCode(code: string, fileName: string = 'dummy.ts'): ParsedRoute[] {
    try {
      const sourceFile = this.project.createSourceFile(fileName, code, { overwrite: true });
      const routes: ParsedRoute[] = [];
      const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

      for (const callExpr of callExpressions) {
        if (this.isExpressRoute(callExpr)) {
          const route = this.extractRouteInfo(callExpr, fileName);
          if (route) {
            routes.push(route);
          }
        }
      }

      return routes;
    } catch (error: any) {
      logger.error(`Parsing error in ${fileName}: ${error.message}`);
      return [];
    }
  }

  private isExpressRoute(callExpr: CallExpression): boolean {
    const propertyAccess = callExpr.getExpression();
    if (!propertyAccess.isKind(SyntaxKind.PropertyAccessExpression)) return false;

    const methodName = propertyAccess.getName();
    const allowedMethods = ['get', 'post', 'put', 'delete', 'patch'];
    if (!allowedMethods.includes(methodName)) return false;

    const args = callExpr.getArguments();
    if (args.length < 2) return false;

    return true;
  }

  private extractRouteInfo(callExpr: CallExpression, fileName: string): ParsedRoute | null {
    try {
      const propertyAccess = callExpr.getExpression();
      // @ts-ignore
      const method = propertyAccess.getName().toUpperCase();
      
      const args = callExpr.getArguments();
      const pathArg = args[0];
      let path = pathArg.getText().replace(/^['"`]|['"`]$/g, '');

      // --- FIX START: Robust JSDoc Extraction ---
      let description = '';
      // Walk up the tree to find the statement (e.g., ExpressionStatement)
      const stmt = callExpr.getAncestors().find(node => Node.isStatement(node));
      
      // @ts-ignore - Check if the found statement has JSDocs
      if (stmt && typeof stmt.getJsDocs === 'function') {
        // @ts-ignore
        const docs = stmt.getJsDocs();
        if (docs.length > 0) {
          description = docs[0].getDescription().trim();
        }
      }
      // --- FIX END ---

      // 2. Extract Handler Function details
      const handlerFn = args[args.length - 1];
      const parameters: any[] = [];
      const responses: any[] = [];

      const arrowFn = handlerFn.asKind(SyntaxKind.ArrowFunction);
      const funcExpr = handlerFn.asKind(SyntaxKind.FunctionExpression);
      const fn = arrowFn || funcExpr;

      if (fn) {
        const params = fn.getParameters();
        const reqName = params[0]?.getName(); 
        const resName = params[1]?.getName(); 

        fn.getDescendants().forEach((node: Node) => {
          // Find params: req.params.id
          if (reqName && node.isKind(SyntaxKind.PropertyAccessExpression)) {
            const text = node.getText();
            if (text.startsWith(`${reqName}.params.`)) {
              parameters.push({
                name: text.split('.')[2],
                in: 'path',
                required: true
              });
            }
            if (text.startsWith(`${reqName}.query.`)) {
              parameters.push({
                name: text.split('.')[2],
                in: 'query',
                required: false
              });
            }
          }

          // Find responses: res.status(200)
          if (resName && node.isKind(SyntaxKind.CallExpression)) {
            const expr = node.getExpression();
            if (expr.getText() === `${resName}.status`) {
              const statusArg = node.getArguments()[0];
              if (statusArg) {
                responses.push({
                  status: parseInt(statusArg.getText()),
                  description: 'Generated response'
                });
              }
            }
          }
        });
      }

      const uniqueParams = Array.from(new Set(parameters.map(p => JSON.stringify(p)))).map(s => JSON.parse(s));

      return {
        method,
        path,
        sourceFile: fileName,
        description,
        parameters: uniqueParams,
        responses
      };
    } catch (e: any) {
      console.error("Extraction Error:", e.message);
      return null;
    }
  }
}