import fs from "fs";
import path from "path";
import { DiagramTestScheduler } from "./diagram-test-scheduler";
import { filter, map } from "rxjs/operators";
import { DiagramSpecification } from "@swirly/types/dist";
import { renderMarbleDiagram } from "@swirly/renderer-node/dist";

type TitledDiagram = { title: string, diagram: DiagramSpecification };

describe("DiagramTestScheduler", () => {
    let scheduler: DiagramTestScheduler;
    const diagrams: TitledDiagram[] = [];

    beforeEach(() => {
        scheduler = new DiagramTestScheduler();
    });

    it("should give a diagram", () => {
        const filename = "filter.svg";
        const diagram = scheduler.runAsDiagram("filter(n => n % 2 != 0)", ({ cold, expectObservable }) => {
            const source = cold<number>("--1--2--3|", { 1: 1, 2: 2, 3: 3 });
            const testee = source.pipe(filter(n => n % 2 !== 0));

            expectObservable(testee).toBe("--1-----3|", { 1: 1, 3: 3 });
        });

        diagrams.push({ title: filename, diagram });

    });

    it("should render objects pretty", () => {
        const title = "mapObject.svg";
        const diagram = scheduler.runAsDiagram("map(1 => {a: 1})", ({cold, expectObservable}) => {
            const source = cold<number>("-1|", { 1: 1});
            const testee = source.pipe(map(n => ({a: n})));

            expectObservable(testee).toBe("-a|", { a: {a: 1}});
        }, {event_radius: 40, frame_width: 60});
        diagrams.push({title, diagram});
    });

    after(async () => {
        return Promise.all(
            diagrams.map(d => fs.writeFile(
                path.resolve(__dirname, "../doc/diagram" , d.title),
                renderMarbleDiagram(d.diagram).xml, (e) => {
                    console.log("e", e);
                })
            )
        );
    });
});
