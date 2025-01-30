import * as commands from "./commands";
import * as crons from "./crons";
import { factory } from "./init";

const app = factory.discord();

factory.loader(app, Object.values(commands));
factory.loader(app, Object.values(crons));

export default app;
