import { Modal, Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ModelType } from "graphql-ts-client-api";
import { FC, memo, useCallback, useEffect } from "react";
import UUIDClass from "uuidjs";
import { book$, bookStore$$, mutation$ } from "../../__generated_graphql_schema__/fetchers";
import { BookStoreInput } from "../../__generated_graphql_schema__/inputs";
import { BookMultiSelect } from "../book/BookMultiSelect";
import { INFORMATION_CLASS, PSEUDO_CODE_CLASS } from "../Css";
import { useMutation, useStateManager } from "graphql-state";
import { Schema } from "../../__generated_graphql_schema__";

const BOOK_STORE_EDIT_INFO =
    bookStore$$
    .books(
        book$.id
    );

export const BookStoreDialog: FC<{
    value?: ModelType<typeof BOOK_STORE_EDIT_INFO>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const [form] = useForm<BookStoreInput>();

    useEffect(() => {
        form.setFieldsValue({
            id: value?.id ?? UUIDClass.generate(),
            name: value?.name ?? "",
            bookIds: value?.books.map(book => book.id) ?? []
        })
    }, [form, value]);

    const stateManager = useStateManager<Schema>();
    
    const [mutate, {loading}] = useMutation(
        mutation$.mergeBookStore(BOOK_STORE_EDIT_INFO),
        {
            onSuccess: data => {
                stateManager.save(BOOK_STORE_EDIT_INFO, data.mergeBookStore)
            }
        }
    );

    const onOk = useCallback(async () => {
        const input = await form.validateFields();
        await mutate({input});
        onClose();
    }, [form, mutate, onClose]);

    const onCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Modal 
        visible={true}
        title={`${value === undefined ? 'Create' : 'Edit'} BookStore`}
        onOk={onOk}
        onCancel={onCancel}
        width={1000}
        okButtonProps={{loading}}>
            <Form form={form} labelCol={{span: 8}} wrapperCol={{span: 16}}>
                <Form.Item name="id" hidden={true}/>
                <Form.Item label="Name" name="name">
                    <Input autoComplete="off"/>
                </Form.Item>
                <Form.Item label="Books" name="bookIds">
                    <BookMultiSelect/>
                </Form.Item>
                {BOOKS_DESCRIPTION_ITEM}
            </Form>
        </Modal>
    );
});

const FOR_REMOVED_BOOK = `
removedBook.store = undefined;
`;

const FOR_ADDED_BOOK = `
addBook.store = this;

const anotherStore = addedBook.store;
if (anotherStore !== undefined && cached(annotherStore.books)) {
    annotherStore.books.remove(addedBook);
}
if (anotherStore !== undefined && cached(annotherStore.books({name: ...}))) {
    annotherStore.books({name: ...}).remove(addedBook);
}
`;

const BOOKS_DESCRIPTION_ITEM = (
    <Form.Item label=" " colon={false}>
        <div className={INFORMATION_CLASS}>
            If you change this association "Store.books"
            <ul>
                <li>
                    For each removed book, this action will be executed automatically
                    <pre className={PSEUDO_CODE_CLASS}>{FOR_REMOVED_BOOK}</pre>
                </li>
                <li>
                    For each added book, this action will be executed automatically
                    <pre  className={PSEUDO_CODE_CLASS}>{FOR_ADDED_BOOK}</pre>
                </li>
            </ul>
        </div>
    </Form.Item>
);