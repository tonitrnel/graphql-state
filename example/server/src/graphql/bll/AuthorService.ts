import { Arg, Query } from "type-graphql";
import { authorTable, TAuthor } from "../../dal/AuthorTable";
import { Predicate } from "../../dal/Table";
import { delay } from "../../Delay";
import { Author } from "../model/Author";

export class AuthorService {

    @Query(() => [Author])
    async findAuthors(
        @Arg("name", () => String, {nullable: true}) name?: string | null
    ): Promise<Author[]> {

        /*
         * Mock the network delay
         */
        await delay(1000);

        const lowercaseName = name?.toLocaleLowerCase();
        const predicate: Predicate<TAuthor> | undefined = 
            lowercaseName !== undefined && lowercaseName !== "" ?
            d => d.name.toLowerCase().indexOf(lowercaseName) !== -1 :
            undefined;
        
        return authorTable
            .find([], predicate)
            .map(row => new Author(row))
            .sort((a, b) => a.name > b.name ? + 1 : a.name < b.name ? -1 :0);
    }
}