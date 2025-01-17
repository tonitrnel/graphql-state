import { css } from "@emotion/css";
import { Timeline, Card, Button, Collapse, Spin } from "antd";
import { useStateAccessor } from "graphql-state";
import { FC, memo, useCallback } from "react";
import { httpLogListState } from "./HttpLog";
import { format } from "./util";

export const HttpLogList: FC = memo(() => {

    const logs = useStateAccessor(httpLogListState);

    const onClearClick = useCallback(() => {
        logs([]);
    }, [logs]);

    return (
        <Card 
        title="Http request logs" 
        extra={
            <Button type="link" onClick={onClearClick}>Clear</Button>
        }>
            <Timeline reverse={true} mode="left">
                {
                    logs().map(log =>
                        <Timeline.Item key={log.id}>
                            <Collapse>
                                <Collapse.Panel 
                                header={
                                    <>
                                        {log.response === undefined && <Spin/>}
                                        {format(log.time)},&nbsp;
                                        {log.body.startsWith("query") ? "query data" : "mutation data"}
                                    </>
                                } 
                                key="message">
                                    <div className={LOG_LABEL_CLASS}>Body</div>
                                    <pre className={LOG_VALUE_CLASS}>{log.body}</pre>
                                    <div className={LOG_LABEL_CLASS}>Variables</div>
                                    <pre className={LOG_VALUE_CLASS}>{
                                        JSON.stringify(log.variables, undefined, "  ")
                                    }</pre>
                                    <div className={LOG_LABEL_CLASS}>Response</div>
                                    <pre className={LOG_VALUE_CLASS}>{
                                        typeof log.response === "string" ?
                                        log.response :
                                        JSON.stringify(log.response, undefined, "  ")
                                    }</pre>
                                </Collapse.Panel>
                            </Collapse>
                        </Timeline.Item>
                    )
                }
            </Timeline>
        </Card>
    );
});

export const LOG_LABEL_CLASS = css({
    fontWeight: "bold"
});

export const LOG_VALUE_CLASS = css({
    borderLeft: "solid 3px gray",
    marginLeft: "3rem",
    paddingLeft: "1rem",
    backgroundColor: "#ffe"
});