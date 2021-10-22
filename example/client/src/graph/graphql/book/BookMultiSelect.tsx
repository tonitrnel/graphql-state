import { FC, memo } from "react";
import { Select, Spin } from "antd";
import { book$$, bookConnection$, bookEdge$, query$ } from "../__generated/fetchers";
import { useQuery } from "graphql-state";

export const BookMultiSelect: FC<{
    value?: string[],
    onChange?: (value: string[]) => void
}> = memo(({value, onChange}) => {

    const { data, loading, error } = useQuery(
        query$.findBooks(
            bookConnection$.edges(
                bookEdge$.node(
                    book$$,
                )
            ),
            options => options.alias("conn")
        ), {
        asyncStyle: "ASYNC_OBJECT"
    });

    return (
        <>
            { error && <div>Failed to load options</div> }
            { loading && <><Spin/>Loading options...</> }
            {
                data && <Select mode="multiple" value={value ?? []} onChange={onChange}>
                    {
                        data.conn.edges.map(edge =>
                            <Select.Option key={edge.node.id} value={edge.node.id}>
                                {edge.node.name}
                            </Select.Option>
                        )
                    }
                </Select>
            }
        </>
    );
});