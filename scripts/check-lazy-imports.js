const { readdirSync, readFileSync } = require('fs');
const path = require('path');
const ts = require('typescript');

const files = (dir, pattern) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  if (entry.isDirectory()) return files(file, pattern);
  return pattern.test(entry.name) ? [file] : [];
});

const specifiers = (file) => {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const found = { imports: [], requires: [] };
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const [specifier] = node.arguments;
      if (specifier && ts.isStringLiteralLike(specifier)) {
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) found.imports.push(specifier.text);
        if (ts.isIdentifier(node.expression) && node.expression.text === 'require') found.requires.push(specifier.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
};

const lazy = new Set(files('src', /\.tsx?$/)
  .filter(file => !/\.(test|d)\.tsx?$/.test(file))
  .flatMap(file => specifiers(file).imports)
  .filter(module => !module.startsWith('.')));

const problems = files('lib', /\.js$/).flatMap(output => specifiers(output).requires
  .filter(module => lazy.has(module))
  .map(module => `${output} requires ${module}, which bundles it into every site's _app chunk. src loads it with import(): keep tsconfig.build.json on module/moduleResolution Node16 (CommonJS rewrites import() to require()) and don't import it statically.`));

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
