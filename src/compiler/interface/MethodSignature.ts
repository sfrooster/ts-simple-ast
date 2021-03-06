﻿import * as ts from "typescript";
import {MethodSignatureStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {PropertyNamedNode, QuestionTokenableNode, DocumentationableNode} from "./../base";
import {SignaturedDeclaration} from "./../function";

export const MethodSignatureBase = DocumentationableNode(QuestionTokenableNode(SignaturedDeclaration(PropertyNamedNode(Node))));
export class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<MethodSignatureStructure>) {
        callBaseFill(MethodSignatureBase.prototype, this, structure);

        return this;
    }
}
