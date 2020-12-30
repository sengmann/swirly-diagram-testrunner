import { TestScheduler } from "rxjs/testing";
import { TestStream } from "./types";
import { RunHelpers } from "rxjs/internal/testing/TestScheduler";
import { DiagramSpecification, DiagramStyles } from "@swirly/types";
import { createOperatorSpecification, createStreamSpecification } from "@swirly/parser";
import { styles as defaultStyles } from "@swirly/theme-default-light";
import { assert } from "chai";
import { TestMessage } from "rxjs/internal/testing/TestMessage";

export class DiagramTestScheduler extends TestScheduler {
    inputStreams: TestStream[] = [];
    outputStreams: TestStream[] = [];

    constructor() {
        super((actual: any, expected: any) => {
            if (Array.isArray(actual) && Array.isArray(expected)) {
                this.outputStreams.push({ messages: actual.map(m => scaleTestMessageTime(m, 10)), subscription: { start: 0, end: "100%" } });
                const failureMessage = `\nExpected\n${actual.map(a => `\t${JSON.stringify(a)}`).join("\n")}\t\nto deep equal\n${expected.map(e => `\t${JSON.stringify(e)}`).join("\n")}`;
                assert.deepEqual(deleteErrorNotificationStack(actual), deleteErrorNotificationStack(expected), failureMessage);
            } else {
                assert.deepEqual(actual, expected);
            }
        });
    }

    runAsDiagram<T>(operatorTitle: string, fn: (helpers: RunHelpers) => T, styles: DiagramStyles = defaultStyles): DiagramSpecification {
        return this.run(helpers => {
            fn(helpers);
            this.inputStreams = this.getHotTestStream().concat(this.getColdTestStream());
            this.flush();
            this.inputStreams = updateInputStreamsPostFlush(this.inputStreams);

            const inputs = this.inputStreams.map(s => createStreamSpecification(s.messages.map(stringifyTestMessage)));
            const operator = createOperatorSpecification(operatorTitle);
            const outputs = this.outputStreams.map(s => createStreamSpecification(s.messages.map(stringifyTestMessage)));

            return { content: [...inputs, operator, ...outputs], styles };
        });
    }

    private getHotTestStream(): TestStream[] {
        return this.hotObservables.map(h => ({
            messages: h.messages.map(m => scaleTestMessageTime(m, 10)),
            subscription: { start: 0, end: "100%" },
        }));
    }

    private getColdTestStream(): TestStream[] {
        return this.coldObservables.map(c => ({
            messages: c.messages.map(m => scaleTestMessageTime(m, 10)),
            cold: c
        }));
    }
}

export function scaleTestMessageTime(testMessage: TestMessage, factor: number): TestMessage {
    return { ...testMessage, frame: testMessage.frame * factor };
}

export function updateInputStreamsPostFlush(inputStreams: TestStream[]) {
    return inputStreams.map(singleInputStream => {
        if (singleInputStream.cold && singleInputStream.cold.subscriptions.length) {
            singleInputStream.subscription = {
                start: singleInputStream.cold.subscriptions[0].subscribedFrame,
                end: singleInputStream.cold.subscriptions[0].unsubscribedFrame,
            };
        }
        return singleInputStream;
    });
}


export function deleteErrorNotificationStack(marble: any) {
    const { notification } = marble;
    if (notification) {
        const { kind, error } = notification;
        if (kind === "E" && error instanceof Error) {
            notification.error = { name: error.name, message: error.message };
        }
    }
    return marble;
}

export function stringifyTestMessage(message: TestMessage): TestMessage {
    return message.isGhost || !message.notification.hasValue
        ? message
        : {
            ...message,
            notification: { ...message.notification, value: JSON.stringify(message.notification.value) }
        } as any;
}
