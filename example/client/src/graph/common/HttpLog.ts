import { makeStateFactory } from "graphql-state";
import { produce } from "immer";

let idSequence = 0;
const { createState } = makeStateFactory();

export interface HttpLog {
    readonly id: number;
    readonly time: Date;
    readonly body: string;
    readonly variables?: any;
    readonly response?: any;
}

export function publishRequestLog(
    body: string,
    variables: any
): number {
    const id = idSequence++;
    window.dispatchEvent(
        new CustomEvent("http-request-event", { 
            detail: {
                log: {
                    id,
                    time: new Date(),
                    body,
                    variables
                }
            } 
        })
    ); 
    return id;
}

export function publishResponseLog(
    id: number,
    response: any
) {
    window.dispatchEvent(
        new CustomEvent("http-response-event", { 
            detail: {
                id,
                response
            } 
        })
    );
}

export const httpLogListState = createState<ReadonlyArray<HttpLog>>(
    "graphql-demo-httpLogs", 
    [], 
    {
        mount: ctx => {
            const onRequest = (e: CustomEvent) => {
                const arr = [...ctx(), e.detail.log];
                if (arr.length > 50) {
                    arr.splice(0, arr.length - 50);
                }
                ctx(arr);
            };
            const onResponse = (e: CustomEvent) => {
                ctx(produce(ctx(), draft => {
                    const log = draft.find(log => log.id === e.detail.id);
                    if (log !== undefined) {
                        log.response = e.detail.response;
                    }
                }));
            };
            const win = window as any;
            win.addEventListener("http-request-event", onRequest);
            win.addEventListener("http-response-event", onResponse);
            return () => {
                win.removeEventListener("http-request-event", onRequest);
                win.removeEventListener("http-response-event", onResponse);
            }
        }
    }
);
