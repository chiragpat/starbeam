import { LIFETIME } from "../core/lifetime/lifetime.js";
import { TIMELINE } from "../core/timeline/timeline.js";
import { LOGGER } from "../strippable/trace.js";
export class FrameSubscriber {
    static create(produce, description) {
        return {
            subscribe: (notify) => new FrameSubscriber(produce, notify, new Map(), description),
        };
    }
    #produce;
    #notify;
    #cells;
    #description;
    constructor(produce, notify, cells, description) {
        this.#produce = produce;
        this.#notify = notify;
        this.#cells = cells;
        this.#description = description;
        LIFETIME.on.finalize(this, () => {
            for (let [, teardown] of this.#cells) {
                teardown();
            }
        });
    }
    link(parent) {
        LIFETIME.link(parent, this);
        return this;
    }
    poll() {
        let { frame, initial } = TIMELINE.withFrame(this.#produce, this.#description);
        TIMELINE.didConsume(frame);
        this.#sync(new Set(frame.cells));
        return initial;
    }
    #sync(newCells) {
        for (let [cell, teardown] of this.#cells) {
            if (!newCells.has(cell)) {
                LOGGER.trace.log(`tearing down (${this.#description}) cell`, cell, this.#notify);
                teardown();
                this.#cells.delete(cell);
            }
        }
        for (let cell of newCells) {
            if (!this.#cells.has(cell)) {
                LOGGER.trace.log(`setting up (${this.#description}) cell`, cell, this.#notify);
                let teardown = TIMELINE.on.update(cell, this.#notify);
                this.#cells.set(cell, teardown);
            }
        }
    }
}
export const Frame = FrameSubscriber.create;
//# sourceMappingURL=frames.js.map