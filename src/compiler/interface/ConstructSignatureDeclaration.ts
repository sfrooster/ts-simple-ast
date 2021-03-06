﻿import * as ts from "typescript";
import {ConstructSignatureDeclarationStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {DocumentationableNode} from "./../base";
import {SignaturedDeclaration} from "./../function";

export const ConstructSignatureDeclarationBase = DocumentationableNode(SignaturedDeclaration(Node));
export class ConstructSignatureDeclaration extends ConstructSignatureDeclarationBase<ts.ConstructSignatureDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ConstructSignatureDeclarationStructure>) {
        callBaseFill(ConstructSignatureDeclarationBase.prototype, this, structure);

        return this;
    }
}
