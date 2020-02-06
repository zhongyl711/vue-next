import { compile } from '../src'

describe('ssr: components', () => {
  test('basic', () => {
    expect(compile(`<foo id="a" :prop="b" />`).code).toMatchInlineSnapshot(`
      "const { resolveComponent } = require(\\"vue\\")
      const { _renderComponent } = require(\\"@vue/server-renderer\\")

      return function ssrRender(_ctx, _push, _parent) {
        const _component_foo = resolveComponent(\\"foo\\")

        _renderComponent(_component_foo, {
          id: \\"a\\",
          prop: _ctx.b
        }, null, _parent)
      }"
    `)
  })

  test('dynamic component', () => {
    expect(compile(`<component is="foo" prop="b" />`).code)
      .toMatchInlineSnapshot(`
      "const { resolveComponent } = require(\\"vue\\")
      const { _renderComponent } = require(\\"@vue/server-renderer\\")

      return function ssrRender(_ctx, _push, _parent) {
        const _component_foo = resolveComponent(\\"foo\\")

        _renderComponent(_component_foo, { prop: \\"b\\" }, null, _parent)
      }"
    `)

    expect(compile(`<compoonent :is="foo" prop="b" />`).code)
      .toMatchInlineSnapshot(`
      "const { resolveComponent } = require(\\"vue\\")
      const { _renderComponent } = require(\\"@vue/server-renderer\\")

      return function ssrRender(_ctx, _push, _parent) {
        const _component_compoonent = resolveComponent(\\"compoonent\\")

        _renderComponent(_component_compoonent, {
          is: _ctx.foo,
          prop: \\"b\\"
        }, null, _parent)
      }"
    `)
  })

  describe('slots', () => {
    test('implicit default slot', () => {
      expect(compile(`<foo>hello<div/></foo>`).code).toMatchInlineSnapshot(`
        "const { resolveComponent } = require(\\"vue\\")
        const { _renderComponent } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent) {
          const _component_foo = resolveComponent(\\"foo\\")

          _renderComponent(_component_foo, null, {
            default: (_, _push, _parent) => {
              _push(\`hello<div></div>\`)
            },
            _compiled: true
          }, _parent)
        }"
      `)
    })

    test('explicit default slot', () => {
      expect(compile(`<foo v-slot="{ msg }">{{ msg + outer }}</foo>`).code)
        .toMatchInlineSnapshot(`
        "const { resolveComponent } = require(\\"vue\\")
        const { _renderComponent, _interpolate } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent) {
          const _component_foo = resolveComponent(\\"foo\\")

          _renderComponent(_component_foo, null, {
            default: ({ msg }, _push, _parent) => {
              _push(\`\${_interpolate(msg + _ctx.outer)}\`)
            },
            _compiled: true
          }, _parent)
        }"
      `)
    })

    test('named slots', () => {
      expect(
        compile(`<foo>
        <template v-slot>foo</template>
        <template v-slot:named>bar</template>
      </foo>`).code
      ).toMatchInlineSnapshot(`
        "const { resolveComponent } = require(\\"vue\\")
        const { _renderComponent } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent) {
          const _component_foo = resolveComponent(\\"foo\\")

          _renderComponent(_component_foo, null, {
            default: (_, _push, _parent) => {
              _push(\`foo\`)
            },
            named: (_, _push, _parent) => {
              _push(\`bar\`)
            },
            _compiled: true
          }, _parent)
        }"
      `)
    })

    test('v-if slot', () => {
      expect(
        compile(`<foo>
        <template v-slot:named v-if="ok">foo</template>
      </foo>`).code
      ).toMatchInlineSnapshot(`
        "const { resolveComponent, createSlots } = require(\\"vue\\")
        const { _renderComponent } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent) {
          const _component_foo = resolveComponent(\\"foo\\")

          _renderComponent(_component_foo, null, createSlots({ _compiled: true }, [
            (_ctx.ok)
              ? {
                  name: \\"named\\",
                  fn: (_, _push, _parent) => {
                    _push(\`foo\`)
                  }
                }
              : undefined
          ]), _parent)
        }"
      `)
    })

    test('v-for slot', () => {
      expect(
        compile(`<foo>
        <template v-for="key in names" v-slot:[key]="{ msg }">{{ msg + key + bar }}</template>
      </foo>`).code
      ).toMatchInlineSnapshot(`
        "const { resolveComponent, renderList, createSlots } = require(\\"vue\\")
        const { _renderComponent, _interpolate } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent) {
          const _component_foo = resolveComponent(\\"foo\\")

          _renderComponent(_component_foo, null, createSlots({ _compiled: true }, [
            renderList(_ctx.names, (key) => {
              return {
                name: key,
                fn: ({ msg }, _push, _parent) => {
                  _push(\`\${_interpolate(msg + key + _ctx.bar)}\`)
                }
              }
            })
          ]), _parent)
        }"
      `)
    })
  })
})