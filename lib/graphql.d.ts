/// <reference types="express" />
import { Config, Express } from './types';
export default function mount(dirname: string, app: Express, config: Config.Graphql): void;
