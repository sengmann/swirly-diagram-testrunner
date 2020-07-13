import { TestMessage } from "@swirly/parser-rxjs/dist";
import { ColdObservable } from "rxjs/internal/testing/ColdObservable";

export interface TestStream {
    messages: TestMessage[];
    cold?: ColdObservable<any>;
    subscription?: {
        start: number;
        end: string | number;
    };
    isGhost?: boolean;
}
