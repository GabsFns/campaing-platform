import { Project } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/**/*.ts");

for (const file of sourceFiles) {
  file.getImportDeclarations().forEach((imp) => {
    const moduleSpecifier = imp.getModuleSpecifierValue();

    // só mexe em imports relativos
    if (moduleSpecifier.startsWith(".")) {
      // se já tem .js, ignora
      if (!moduleSpecifier.endsWith(".js")) {
        imp.setModuleSpecifier(moduleSpecifier + ".js");
      }
    }
  });
}

await project.save();

console.log("✅ Imports atualizados para .js");