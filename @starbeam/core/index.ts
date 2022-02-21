import { ReactiveCases } from "./reactive/choice.js";
export const Cases = ReactiveCases.define;

export { Finalizer } from "./core/lifetime/lifetime.js";
export * from "./debug/inspect.js";
export * from "./debug/tree.js";
export * from "./decorator/reactive.js";
export * from "./dom.js";
export * from "./dom/streaming.js";
export { HTML_NAMESPACE } from "./dom/streaming/namespaces.js";
export * from "./fundamental/config.js";
export { UNINITIALIZED } from "./fundamental/constants.js";
export {
  subscribe,
  type ExternalSubscription,
  type PollResult,
} from "./glue/sync.js";
export * from "./hooks/simple.js";
export * from "./program-node/index.js";
export {
  Cell,
  Enum,
  Frame,
  Reactive,
  ReactiveMetadata,
  type Discriminant,
  type IntoReactive,
} from "./reactive/index.js";
export * from "./root/api/public.js";
export { Abstraction } from "./strippable/abstraction.js";
export * from "./strippable/assert.js";
export * from "./strippable/core.js";
export * from "./strippable/minimal.js";
export * from "./strippable/trace.js";
export * from "./strippable/verify-context.js";
export * from "./strippable/wrapper.js";
export { RenderedRoot, Root } from "./universe.js";
export * from "./utils.js";

// export * from "./fundamental/types.js";