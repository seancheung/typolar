/// <reference types="express" />
import { Config } from 'kuconfig';
import { Express } from './types';
export declare function mount(dirname: string, app: Express, config: Config.Graphql): void;
export default mount;
