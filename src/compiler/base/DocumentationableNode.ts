﻿import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {insertStraight, verifyAndGetIndex, getEndIndexFromArray} from "./../../manipulation";
import {JSDocStructure, DocumentationableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";
import {JSDoc} from "./../doc/JSDoc";

export type DocumentationableNodeExtensionType = Node<any>;

export interface DocumentationableNode {
    /**
     * Gets the documentation comment text or undefined if none exists.
     * This will return multiple documentation comments separated by newlines.
     */
    getDocumentationComment(): string | undefined;
    /**
     * Gets the documentation comment nodes.
     */
    getDocumentationCommentNodes(): Node<ts.JSDoc>[];
    /**
     * Adds a documentation comment.
     * @param structure - Structure to add.
     */
    addDoc(structure: JSDocStructure): Node<ts.JSDoc>;
    /**
     * Adds documentation comments.
     * @param structures - Structures to add.
     */
    addDocs(structures: JSDocStructure[]): Node<ts.JSDoc>[];
    /**
     * Inserts a documentation comment.
     * @param index - Index to insert at.
     * @param structure - Structure to insert.
     */
    insertDoc(index: number, structure: JSDocStructure): Node<ts.JSDoc>;
    /**
     * Inserts documentation comments.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertDocs(index: number, structures: JSDocStructure[]): Node<ts.JSDoc>[];
}

export function DocumentationableNode<T extends Constructor<DocumentationableNodeExtensionType>>(Base: T): Constructor<DocumentationableNode> & T {
    return class extends Base implements DocumentationableNode {
        getDocumentationComment() {
            const docCommentNodes = this.getDocumentationCommentNodes();
            if (docCommentNodes.length === 0)
                return undefined;

            const texts = docCommentNodes.map(n => (n.compilerNode.comment || "").trim());
            return texts.filter(t => t.length > 0).join(this.global.manipulationSettings.getNewLineKind());
        }

        getDocumentationCommentNodes(): JSDoc[] {
            const nodes = (this.compilerNode as any).jsDoc as ts.JSDoc[] || [];
            return nodes.map(n => this.global.compilerFactory.getJSDoc(n, this.sourceFile));
        }

        addDoc(structure: JSDocStructure) {
            return this.addDocs([structure])[0];
        }

        addDocs(structures: JSDocStructure[]) {
            return this.insertDocs(getEndIndexFromArray((this.compilerNode as any).jsDoc), structures);
        }

        insertDoc(index: number, structure: JSDocStructure) {
            return this.insertDocs(index, [structure])[0];
        }

        insertDocs(index: number, structures: JSDocStructure[]) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const indentationText = this.getIndentationText();
            const newLineText = this.global.manipulationSettings.getNewLineKind();
            const code = `${getDocumentationCode(structures, indentationText, newLineText)}${newLineText}${indentationText}`;
            const nodes = this.getDocumentationCommentNodes();
            index = verifyAndGetIndex(index, nodes.length);

            const insertPos = index === nodes.length ? this.getStart() : nodes[index].getStart();
            insertStraight({
                insertPos,
                parent: this,
                newCode: code
            });

            return this.getDocumentationCommentNodes().slice(index, index + structures.length);
        }

        fill(structure: Partial<DocumentationableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.docs != null && structure.docs.length > 0)
                this.addDocs(structure.docs);

            return this;
        }
    };
}

function getDocumentationCode(structures: JSDocStructure[], indentationText: string, newLineText: string) {
    let code = "";
    for (const structure of structures) {
        if (code.length > 0)
            code += `${newLineText}${indentationText}`;
        code += getDocumentationCodeForStructure(structure, indentationText, newLineText);
    }
    return code;
}

function getDocumentationCodeForStructure(structure: JSDocStructure, indentationText: string, newLineText: string) {
    const lines = structure.description.split(/\r?\n/);
    return `/**${newLineText}` + lines.map(l => `${indentationText} * ${l}`).join(newLineText) + `${newLineText}${indentationText} */`;
}
