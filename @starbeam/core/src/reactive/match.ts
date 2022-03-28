import { Memo, type Reactive } from "@starbeam/reactive";
import { Abstraction } from "@starbeam/trace-internals";
import type { Enumeration, MatcherFor } from "@starbeam/utils";

export function match<E extends Enumeration, U>(
  enumeration: Reactive<E>,
  matcher: MatcherFor<E, U>,
  description = Abstraction.callerFrame()
): Reactive<U> {
  return Memo(() => {
    return enumeration.current.match(matcher);
  }, description);
}