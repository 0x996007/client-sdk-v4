import { ValidatorConfig, SelectedGasDenom } from './constants';
import { Get } from './modules/get';
import { Post } from './modules/post';
export declare class ValidatorClient {
    readonly config: ValidatorConfig;
    private _get?;
    private _post?;
    /**
     * @description Connect to a validator client
     *
     * @returns The validator client
     */
    static connect(config: ValidatorConfig): Promise<ValidatorClient>;
    private constructor();
    /**
     * @description Get the query module, used for retrieving on-chain data.
     *
     * @returns The query module
     */
    get get(): Get;
    /**
     * @description transaction module, used for sending transactions.
     *
     * @returns The transaction module
     */
    get post(): Post;
    get selectedGasDenom(): SelectedGasDenom | undefined;
    setSelectedGasDenom(gasDenom: SelectedGasDenom): void;
    /**
     * @description populate account number cache in the Post module for performance.
     */
    populateAccountNumberCache(address: string): Promise<void>;
    private initialize;
}
