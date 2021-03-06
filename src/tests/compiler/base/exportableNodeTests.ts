﻿import {expect} from "chai";
import {ExportableNode, ClassDeclaration, NamespaceDeclaration, FunctionDeclaration} from "./../../../compiler";
import {ExportableNodeStructure} from "./../../../structures";
import * as errors from "./../../../errors";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExportableNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("export var exportedVar = 1;\nvar myExplicitVar: string;\nexport default class Identifier {}\n");
    const statements = mainSourceFile.getVariableStatements();
    const exportedStatement = statements[0];
    const notExportedStatement = statements[1];
    const exportedDefaultClass = mainSourceFile.getClasses()[0];

    describe(nameof<ExportableNode>(n => n.hasExportKeyword), () => {
        it("should have an export keyword when exported", () => {
            expect(exportedStatement.hasExportKeyword()).to.be.true;
        });

        it("should not have an export keyword when not exported", () => {
            expect(notExportedStatement.hasExportKeyword()).to.be.false;
        });
    });

    describe(nameof<ExportableNode>(n => n.getExportKeyword), () => {
        it("should have an export keyword when exported", () => {
            expect(exportedStatement.getExportKeyword()!.getText()).to.equal("export");
        });

        it("should not have an export keyword when not exported", () => {
            expect(notExportedStatement.getExportKeyword()).to.be.undefined;
        });
    });

    describe(nameof<ExportableNode>(n => n.hasDefaultKeyword), () => {
        it("should have a default keyword when default exported", () => {
            expect(exportedDefaultClass.hasDefaultKeyword()).to.be.true;
        });

        describe("not exported node", () => {
            it("should not have a default keyword when not default exported", () => {
                expect(exportedStatement.hasDefaultKeyword()).to.be.false;
            });
        });
    });

    describe(nameof<ExportableNode>(n => n.getDefaultKeyword), () => {
        it("should have a default keyword when default exported", () => {
            expect(exportedDefaultClass.getDefaultKeyword()!.getText()).to.equal("default");
        });

        it("should not have an export keyword when not default exported", () => {
            expect(exportedStatement.getDefaultKeyword()).to.be.undefined;
        });
    });

    describe(nameof<ExportableNode>(n => n.isDefaultExport), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(text);
            expect(firstChild.isDefaultExport()).to.equal(expected);
        }

        it("should be the default export when default exported on a different line", () => {
            doTest("class Identifier {}\nexport default Identifier;", true);
        });

        it("should be the default export when default exported on the same line", () => {
            doTest("export default class Identifier {}", true);
        });

        it("should not be a default export when not", () => {
            doTest("class Identifier {}", false);
        });

        it("should not be a default export when not and there exists another default export", () => {
            doTest("class Identifier {}\nexport default class Identifier2 {}", false);
        });
    });

    describe(nameof<ExportableNode>(n => n.isNamedExport), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(text);
            expect(firstChild.isNamedExport()).to.equal(expected);
        }

        it("should be a named export when one", () => {
            doTest("export class Identifier {}", true);
        });

        it("should not be a named export when it's a default export", () => {
            doTest("export default class Identifier {}", false);
        });

        it("should not be a named export when neither a default or named export", () => {
            doTest("class Identifier {}", false);
        });

        it("should not be a named export when contained in a namespace", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Namespace { export class Identifier {} }");
            const innerClass = firstChild.getClasses()[0];
            expect(innerClass.isNamedExport()).to.be.false;
        });
    });

    describe(nameof<ExportableNode>(n => n.setIsDefaultExport), () => {
        function doTest(text: string, value: boolean, expectedText: string) {
            const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>(text);
            firstChild.setIsDefaultExport(value);
            expect(sourceFile.getText()).to.equal(expectedText);
        }

        describe("setting as the default export", () => {
            it("should remove any existing default export and make the specified class the default export", () => {
                doTest("class Identifier {}\nexport default class Identifier2 {}", true, "export default class Identifier {}\nclass Identifier2 {}");
            });

            it("should remove any existing default export and make the specified class the default export when using a default export statement", () => {
                doTest("class Identifier {}\nclass Identifier2 {}\nexport default Identifier2;", true, "export default class Identifier {}\nclass Identifier2 {}");
            });

            it("should do nothing if already the default export", () => {
                doTest("export default class Identifier {}", true, "export default class Identifier {}");
            });

            it("should add default if already an export", () => {
                doTest("export class Identifier {}", true, "export default class Identifier {}");
            });

            it("should throw an error if setting as a default export within a namespace", () => {
                const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { class Identifier {} }");
                const innerChild = firstChild.getClasses()[0];
                expect(() => innerChild.setIsDefaultExport(true)).to.throw(errors.InvalidOperationError);
            });
        });

        describe("unsetting as the default export", () => {
            it("should remove the default export", () => {
                doTest("export default class Identifier {}", false, "class Identifier {}");
            });

            it("should do nothing if already not the default export", () => {
                doTest("export class Identifier {}\nexport default class Identifier2 {}", false, "export class Identifier {}\nexport default class Identifier2 {}");
            });
        });
    });

    describe(nameof<ExportableNode>(n => n.setIsExported), () => {
        function doTest(text: string, value: boolean, expected: string) {
            const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>(text);
            firstChild.setIsExported(value);
            expect(sourceFile.getText()).to.equal(expected);
        }

        function doInnerTest(text: string, value: boolean, expected: string) {
            const {sourceFile, firstChild} = getInfoFromText<NamespaceDeclaration>(text);
            const innerChild = firstChild.getClasses()[0];
            innerChild.setIsExported(value);
            expect(sourceFile.getText()).to.equal(expected);
        }

        describe("setting as exported", () => {
            it("should do nothing if already exported", () => {
                doTest("export class Identifier {}", true, "export class Identifier {}");
            });

            it("should add the export keyword if not exported", () => {
                doTest("class Identifier {}", true, "export class Identifier {}");
            });

            it("should do nothing if already exported from a namespace", () => {
                doInnerTest("namespace Identifier { export class Identifier {} }", true, "namespace Identifier { export class Identifier {} }");
            });

            it("should add the export keyword if not exported from a namespace", () => {
                doInnerTest("namespace Identifier { class Identifier {} }", true, "namespace Identifier { export class Identifier {} }");
            });

            it("should remove it as a default export if one", () => {
                doTest("export default class Identifier {}", true, "export class Identifier {}");
            });

            it("should remove it as a default export if one and exported in a separate statement", () => {
                doTest("class Identifier {}\nexport default Identifier;", true, "export class Identifier {}");
            });
        });

        describe("setting as not exported", () => {
            it("should do nothing if already not exported", () => {
                doTest("class Identifier {}", false, "class Identifier {}");
            });

            it("should remove the export keyword if exported", () => {
                doTest("export class Identifier {}", false, "class Identifier {}");
            });

            it("should do nothing if already not exported from a namespace", () => {
                doInnerTest("namespace Identifier { class Identifier {} }", false, "namespace Identifier { class Identifier {} }");
            });

            it("should remove the export keyword if exported from a namespace", () => {
                doInnerTest("namespace Identifier { export class Identifier {} }", false, "namespace Identifier { class Identifier {} }");
            });

            it("should remove it as a default export if one", () => {
                doTest("export default class Identifier {}", false, "class Identifier {}");
            });

            it("should remove it as a default export if one and exported in a separate statement", () => {
                doTest("class Identifier {}\nexport default Identifier;", false, "class Identifier {}");
            });
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.fill), () => {
        function doTest(startingCode: string, structure: ExportableNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("function myFunction() {}", {}, "function myFunction() {}");
        });

        it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
            doTest("export default function myFunction() {}", {}, "export default function myFunction() {}");
        });

        it("should modify when setting as export", () => {
            doTest("function myFunction() {}", { isExported: true }, "export function myFunction() {}");
        });

        it("should modify when setting as default export", () => {
            doTest("function myFunction() {}", { isDefaultExport: true }, "export default function myFunction() {}");
        });

        it("should be default export when setting as default export and exported", () => {
            doTest("function myFunction() {}", { isDefaultExport: true, isExported: true }, "export default function myFunction() {}");
        });
    });
});
