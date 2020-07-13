import { DiagramTestScheduler } from "./diagram-test-scheduler";
import { filter } from "rxjs/operators";
import fs from "fs";
import path from "path";
import { DiagramSpecification } from "@swirly/types/dist";
import { renderMarbleDiagram } from "@swirly/renderer-node/dist";

type TitledDiagram = { title: string, diagram: DiagramSpecification }

describe("DiagramTestScheduler", () => {
    let scheduler: DiagramTestScheduler;
    const diagrams: TitledDiagram[] = [];

    beforeEach(() => {
        scheduler = new DiagramTestScheduler();
    })

    it("should give a diagram", () => {
        const filename = "filter.svg"
        const diagram = scheduler.runAsDiagram("filter(n => n % 2 != 0)", ({ cold, expectObservable }) => {
            const source = cold<number>("--1--2--3|", { 1: 1, 2: 2, 3: 3 });
            const testee = source.pipe(filter(n => n % 2 !== 0));

            expectObservable(testee).toBe("--1-----3|", { 1: 1, 3: 3 })
        })

        diagrams.push({ title: filename, diagram });

    });

    after(async () => {
        return Promise.all(
            diagrams.map(d => fs.writeFile(
                path.resolve(__dirname, "../doc/diagram" ,d.title),
                renderMarbleDiagram(d.diagram).xml, (e) => {
                    console.log("e", e);
                })
            )
        )
    })
})
