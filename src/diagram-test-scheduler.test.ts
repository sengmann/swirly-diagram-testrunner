import { DiagramTestScheduler } from "./diagram-test-scheduler";
import { expect } from "chai";
import { concat } from "rxjs";

describe("DiagramTestScheduler", () => {
    it("should execute fn passed to runAsDiagram", () => {
        const scheduler = new DiagramTestScheduler();
        let wasCalled = false;
        scheduler.runAsDiagram("title", (_) => {
            wasCalled = true;
        });
        expect(wasCalled).to.eq(true);
    });

    it("should deliver at least the operator when calling runAsDiagram", () => {
        const scheduler = new DiagramTestScheduler();
        const operatorTitle = "operator(title)";
        const diagram = scheduler.runAsDiagram(operatorTitle, () => {
            // Noop
        });
        expect(diagram.content).to.have.lengthOf(1);
        expect(diagram.content[0]).to.have.property("kind").eq("O");
        expect(diagram.content[0]).to.have.property("title").eq(operatorTitle);
    });

    it("should contains first all hot inputs followed by cold inputs, than the operator and at last the output", () => {
        const scheduler = new DiagramTestScheduler();
        const operatorTitle = "operator(title)";
        const diagram = scheduler.runAsDiagram(operatorTitle, ({cold, hot, expectObservable}) => {
            const hotInput = hot("(a|)");
            const coldInput = cold("-(b|)");

            const output = concat(coldInput, hotInput);

            expectObservable(output).toBe("-(b|)");
        });

        expect(diagram.content).to.be.a("array").and.have.lengthOf(4);
        expect(diagram.content[0]).to.have.ownProperty("kind").and.equals("S");
        expect(diagram.content[1]).to.have.ownProperty("kind").and.equals("S");
        expect(diagram.content[2]).to.have.ownProperty("kind").and.equals("O");
        expect(diagram.content[3]).to.have.ownProperty("kind").and.equals("S");
    });
});
