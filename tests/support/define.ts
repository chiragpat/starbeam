import type { anydom } from "@domtree/flavors";
import { JSDOM } from "jsdom";
import {
  Cell,
  CommentProgramNode,
  ContentProgramNode,
  DomEnvironment,
  ElementProgramNode,
  ElementProgramNodeBuilder,
  HTML_NAMESPACE,
  is,
  Reactive,
  ReactiveDOM,
  RenderedRoot,
  TextProgramNode,
  Universe,
  verify,
} from "starbeam";
import { upstream } from "../jest-ext";
import { ElementArgs, TestElementArgs } from "./element";
import { Expects } from "./expect/expect";

export interface TestArgs {
  readonly universe: Universe;
  readonly test: TestSupport;
  readonly dom: ReactiveDOM;
}

export function test(
  name: string,
  test: (args: TestArgs) => void | Promise<void>
): void {
  upstream.test(name, () => {
    let support = TestSupport.create();

    return test({
      test: support,
      universe: support.universe,
      dom: support.dom,
    }) as Promise<unknown>;
  });
}

export function todo(
  name: string,
  test: (args: TestArgs) => void | Promise<void>
): void {
  upstream.test(name, async () => {
    let support = TestSupport.create();

    try {
      await test({
        test: support,
        universe: support.universe,
        dom: support.dom,
      });
    } catch (e) {
      return;
    }

    throw Error(`Expected pending test '${name}' to fail, but it passed`);
  });

  upstream.test.todo(name);
}

export class TestSupport {
  static create(jsdom = new JSDOM()): TestSupport {
    return new TestSupport(DomEnvironment.jsdom(jsdom));
  }

  readonly universe: Universe;
  readonly dom: ReactiveDOM;

  readonly #environment: DomEnvironment;

  private constructor(environment: DomEnvironment) {
    this.#environment = environment;
    this.universe = Universe.environment(environment);
    this.dom = this.universe.dom;
  }

  buildText(reactive: Reactive<string>, expectation: Expects): TextProgramNode {
    let text = this.universe.dom.text(reactive);
    expect(normalize(text.metadata.isStatic)).toBe(expectation);
    return text;
  }

  buildComment(
    reactive: Reactive<string>,
    expectation: Expects
  ): CommentProgramNode {
    let comment = this.universe.dom.comment(reactive);
    expect(normalize(comment.metadata.isStatic)).toBe(expectation);
    return comment;
  }

  buildElement(...args: TestElementArgs): ElementProgramNode {
    let { tagName, build, expectation } = ElementArgs.normalize(
      this.universe,
      args
    );
    let element = ElementProgramNodeBuilder.build(tagName, build);
    expect(normalize(element.metadata.isStatic)).toBe(expectation);
    return element;
  }

  render(
    node: ContentProgramNode,
    expectation: Expects
  ): {
    result: RenderedRoot;
    into: anydom.Element;
  } {
    let element = this.#environment.document.createElementNS(
      HTML_NAMESPACE,
      "div"
    );
    let result = this.universe.render(node, { append: element });

    verify(result, is.Present);

    expect(
      normalize(result.metadata.isConstant),
      `Render should produce ${expectation} output.`
    ).toBe(expectation);

    // Exchange markers for DOM representations to allow us to compare the DOM
    // without markers to our expectations.
    result.eager();

    return { result, into: element };
  }

  update<T>(rendered: RenderedRoot, cell: Cell<T>, value: T): void {
    cell.update(value);

    rendered.poll();
  }
}

export type Test = (args: {
  test: TestSupport;
  universe: Universe;
}) => void | Promise<void>;

function normalize(isStatic: boolean): Expects {
  return isStatic ? Expects.static : Expects.dynamic;
}

export { expect } from "./expect/expect";
export { toBe } from "./expect/patterns";