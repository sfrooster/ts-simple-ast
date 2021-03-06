﻿import {expect} from "chai";
import {ExportDeclaration} from "./../../../compiler";
import {ExportSpecifierStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExportDeclaration), () => {
    describe(nameof<ExportDeclaration>(n => n.isNamespaceExport), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.isNamespaceExport()).to.equal(expected);
        }

        it("should be a namespace export when is one", () => {
            doTest("export * from './test'", true);
        });

        it("should not be a namespace export when is a named export", () => {
            doTest(`export {name} from "./test"`, false);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.hasNamedExports), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.hasNamedExports()).to.equal(expected);
        }

        it("should not have any named exports when is a namespace export", () => {
            doTest("export * from './test'", false);
        });

        it("should have named exports when has one", () => {
            doTest(`export {name} from "./test"`, true);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.setModuleSpecifier), () => {
        function doTest(text: string, newModuleSpecifier: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.setModuleSpecifier(newModuleSpecifier);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should set the module specifier when using single quotes", () => {
            doTest(`export * from './test';`, "./new-test", `export * from './new-test';`);
        });

        it("should set the module specifier when using double quotes", () => {
            doTest(`export * from "./test";`, "./new-test", `export * from "./new-test";`);
        });

        it("should set the module specifier when it's empty", () => {
            doTest(`export * from "";`, "./new-test", `export * from "./new-test";`);
        });

        it("should set the module specifier when it doesn't exist", () => {
            doTest(`export {test};`, "./new-test", `export {test} from "./new-test";`);
        });

        it("should set the module specifier when it doesn't exist and there's no semi-colon", () => {
            doTest(`export {test}`, "./new-test", `export {test} from "./new-test"`);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.getModuleSpecifier), () => {
        function doTest(text: string, expected: string | undefined) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.getModuleSpecifier()).to.equal(expected);
        }

        it("should get the module specifier when using single quotes", () => {
            doTest("export * from './test'", "./test");
        });

        it("should get the module specifier when using double quotes", () => {
            doTest(`export {name} from "./test"`, "./test");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest(`export {name}`, undefined);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.hasModuleSpecifier), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.hasModuleSpecifier()).to.equal(expected);
        }

        it("should have a module specifier when using single quotes", () => {
            doTest("export * from './test'", true);
        });

        it("should have a module specifier when using double quotes", () => {
            doTest(`export {name} from "./test"`, true);
        });

        it("should not have a module specifier when one doesn't exist", () => {
            doTest(`export {name}`, false);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.getNamedExports), () => {
        function doTest(text: string, expected: { name: string; alias?: string; }[]) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            const namedExports = firstChild.getNamedExports();
            expect(namedExports.length).to.equal(expected.length);
            for (let i = 0; i < namedExports.length; i++) {
                expect(namedExports[i].getName().getText()).to.equal(expected[i].name);
                if (expected[i].alias == null)
                    expect(namedExports[i].getAlias()).to.equal(undefined);
                else
                    expect(namedExports[i].getAlias()!.getText()).to.equal(expected[i].alias);
            }
        }

        it("should get the named exports", () => {
            doTest(`export {name, name2, name3 as name4} from "./test";`, [{ name: "name" }, { name: "name2" }, { name: "name3", alias: "name4" }]);
        });

        it("should not get anything when only a namespace export exists", () => {
            doTest(`export * from "./test";`, []);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.insertNamedExports), () => {
        function doTest(text: string, index: number, structures: ExportSpecifierStructure[], expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.insertNamedExports(index, structures);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should insert named exports when doing a namespace export", () => {
            doTest(`export * from "./test";`, 0, [{ name: "name", alias: "alias" }], `export {name as alias} from "./test";`);
        });

        it("should insert named exports at the start", () => {
            doTest(`export {name3} from "./test";`, 0, [{ name: "name1" }, { name: "name2" }], `export {name1, name2, name3} from "./test";`);
        });

        it("should insert named exports at the end", () => {
            doTest(`export {name1} from "./test";`, 1, [{ name: "name2" }, { name: "name3" }], `export {name1, name2, name3} from "./test";`);
        });

        it("should insert named exports in the middle", () => {
            doTest(`export {name1, name4} from "./test";`, 1, [{ name: "name2" }, { name: "name3" }], `export {name1, name2, name3, name4} from "./test";`);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.insertNamedExport), () => {
        function doTest(text: string, index: number, structure: ExportSpecifierStructure, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.insertNamedExport(index, structure);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should insert at the specified index", () => {
            doTest(`export {name1, name3} from "./test";`, 1, { name: "name2" }, `export {name1, name2, name3} from "./test";`);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.addNamedExport), () => {
        function doTest(text: string, structure: ExportSpecifierStructure, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.addNamedExport(structure);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should add at the end", () => {
            doTest(`export {name1, name2} from "./test";`, { name: "name3" }, `export {name1, name2, name3} from "./test";`);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.addNamedExports), () => {
        function doTest(text: string, structures: ExportSpecifierStructure[], expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.addNamedExports(structures);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should add named exports at the end", () => {
            doTest(`export {name1} from "./test";`, [{ name: "name2" }, { name: "name3" }], `export {name1, name2, name3} from "./test";`);
        });
    });
});
