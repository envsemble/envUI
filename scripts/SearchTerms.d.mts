import type { Options, SearchOptions } from 'minisearch';

export declare const searchFields: string[];
export declare const storeFields: string[];
export declare function tokenize(text: string): string[];
export declare function processTerm(term: string): string;
export declare const indexOptions: Options;
export declare function nameKey(text: string): string;
export declare function queryOptionsFor(query: string): SearchOptions;
