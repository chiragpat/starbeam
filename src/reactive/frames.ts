import type { Cell } from "./cell.js";
import { HasMetadata, ReactiveMetadata } from "./metadata.js";
import { LOGGER } from "../strippable/trace.js";
import type { Timestamp } from "../root/timestamp.js";

export class AssertFrame {
  static describing(description: string): AssertFrame {
    return new AssertFrame(description);
  }

  readonly #description: string;

  private constructor(description: string) {
    this.#description = description;
  }

  assert(): void {
    throw Error(
      `The current timestamp should not change while ${this.#description}`
    );
  }
}

export class ActiveFrame {
  static create(description: string): ActiveFrame {
    return new ActiveFrame(new Set(), description);
  }

  readonly #cells: Set<Cell | AnyFinalizedFrame>;

  private constructor(
    cells: Set<Cell | AnyFinalizedFrame>,
    readonly description: string
  ) {
    this.#cells = cells;
  }

  add(cell: Cell | AnyFinalizedFrame): void {
    this.#cells.add(cell);
  }

  finalize<T>(
    value: T,
    now: Timestamp
  ): { frame: FinalizedFrame<T>; initial: T } {
    return {
      frame: new FinalizedFrame(this.#cells, now, value, this.description),
      initial: value,
    };
  }
}

export class FinalizedFrame<T> extends HasMetadata {
  readonly #children: Set<Cell | AnyFinalizedFrame>;
  readonly #finalizedAt: Timestamp;
  readonly #value: T;

  constructor(
    children: Set<Cell | AnyFinalizedFrame>,
    finalizedAt: Timestamp,
    value: T,
    readonly description?: string
  ) {
    super();
    this.#children = children;
    this.#finalizedAt = finalizedAt;
    this.#value = value;
  }

  get metadata(): ReactiveMetadata {
    return ReactiveMetadata.all(...this.#children);
  }

  IS_UPDATED_SINCE(timestamp: Timestamp): boolean {
    let isUpdated = false;

    for (let child of this.#children) {
      if (child.IS_UPDATED_SINCE(timestamp)) {
        LOGGER.trace.log(
          `[invalidated] by ${child.description || "anonymous"}`
        );
        isUpdated = true;
      }
    }

    return isUpdated;
  }

  validate(): { status: "valid"; value: T } | { status: "invalid" } {
    if (this.IS_UPDATED_SINCE(this.#finalizedAt)) {
      return { status: "invalid" };
    }

    return { status: "valid", value: this.#value };
  }
}

export type AnyFinalizedFrame = FinalizedFrame<unknown>;