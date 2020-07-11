import "mocha"
import { filter } from 'rxjs/operators';
import { DiagramTestScheduler } from './DiagramTestScheduler';
import { DiagramSpecification } from '@swirly/types';
import { renderMarbleDiagram } from '@swirly/renderer-node';
import { styles } from '@swirly/theme-default-light';

export { DiagramTestScheduler } from './DiagramTestScheduler';
export * from './types'

describe('DiagramTestScheduler', () => {
    let scheduler: DiagramTestScheduler;
    let diagram: DiagramSpecification;

    beforeEach(() => {
        scheduler = new DiagramTestScheduler();
    })

    it('should give a diagram', () => {
        diagram = scheduler.runAsDiagram('filter(n => n % 2 != 0)', ({ cold, expectObservable }) => {
            const source = cold<number>("-1-2-3|", { 1: 1, 2: 2, 3: 3 });
            const testee = source.pipe(filter(n => n % 2 !== 0));

            expectObservable(testee).toBe("-1---3|", { 1: 1, 3: 3 })
        })
        console.log("diagram %o", diagram);
    });

    afterEach(() => {
        const r = renderMarbleDiagram(diagram, { styles })
        console.log(r.xml);
    })
})
