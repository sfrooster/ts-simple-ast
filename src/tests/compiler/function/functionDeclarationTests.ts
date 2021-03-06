﻿import {expect} from "chai";
import {FunctionDeclaration} from "./../../../compiler";
import {FunctionDeclarationOverloadStructure, FunctionDeclarationSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(FunctionDeclaration), () => {
    describe(nameof<FunctionDeclaration>(f => f.insertOverloads), () => {
        function doTest(startCode: string, index: number, structures: FunctionDeclarationOverloadStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertOverloads(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert when no other overloads exist", () => {
            doTest("function identifier() {}\n", 0, [{ returnType: "number" }, {}],
                "function identifier(): number;\nfunction identifier();\nfunction identifier() {}\n");
        });

        it("should insert with the ambientable and exportable nodes the same as the implementation signature unless overwritten", () => {
            doTest("declare async function* identifier(param: string): string {}\n", 0, [{ returnType: "number", hasDeclareKeyword: false }, {}],
                "function identifier(): number;\ndeclare function identifier();\ndeclare async function* identifier(param: string): string {}\n");
        });

        it("should be able to insert at start when another overload exists", () => {
            doTest("function identifier();\nfunction identifier() {}\n", 0, [{ returnType: "string" }],
                "function identifier(): string;\nfunction identifier();\nfunction identifier() {}\n");
        });

        it("should be able to insert at end when another overload exists", () => {
            doTest("function identifier();\nfunction identifier() {}\n", 1, [{ returnType: "string" }],
                "function identifier();\nfunction identifier(): string;\nfunction identifier() {}\n");
        });

        it("should be able to insert in the middle when other overloads exists", () => {
            doTest("function identifier();\nfunction identifier();\nfunction identifier() {}\n", 1, [{ returnType: "string" }],
                "function identifier();\nfunction identifier(): string;\nfunction identifier();\nfunction identifier() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.insertOverload), () => {
        function doTest(startCode: string, index: number, structure: FunctionDeclarationOverloadStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertOverload(index, structure);
            expect(result).to.be.instanceOf(FunctionDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert", () => {
            doTest("function identifier();\nfunction identifier();\nfunction identifier() {}\n", 1, { returnType: "number" },
                "function identifier();\nfunction identifier(): number;\nfunction identifier();\nfunction identifier() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.addOverloads), () => {
        function doTest(startCode: string, structures: FunctionDeclarationOverloadStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addOverloads(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add at the end", () => {
            doTest("function identifier();\nfunction identifier() {}\n", [{ returnType: "number" }, { returnType: "string" }],
                "function identifier();\nfunction identifier(): number;\nfunction identifier(): string;\nfunction identifier() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.addOverload), () => {
        function doTest(startCode: string, structure: FunctionDeclarationOverloadStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addOverload(structure);
            expect(result).to.be.instanceOf(FunctionDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add at the end", () => {
            doTest("function identifier();\nfunction identifier() {}\n", { returnType: "number" },
                "function identifier();\nfunction identifier(): number;\nfunction identifier() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.fill), () => {
        function doTest(startingCode: string, structure: FunctionDeclarationSpecificStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("function identifier() {\n}", {}, "function identifier() {\n}");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<FunctionDeclarationSpecificStructure> = {
                overloads: [{ returnType: "string" }]
            };
            doTest("function identifier() {\n}", structure, "function identifier(): string;\nfunction identifier() {\n}");
        });
    });
});
