import * as adapter from '@astrojs/netlify/netlify-functions.js';
import React, { createElement, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/server';
import { escape } from 'html-escaper';
/* empty css                                 *//* empty css                                 *//* empty css                                 *//* empty css                                  */import { jsxs, jsx, Fragment as Fragment$1 } from 'react/jsx-runtime';
import { slug } from 'github-slugger';
/* empty css                                  *//* empty css                                  */import rss from '@astrojs/rss';
import Fuse from 'fuse.js';
/* empty css                                 *//* empty css                               */import satori from 'satori';
import 'mime';
import 'cookie';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to React that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
	if (!value) return null;
	return createElement('astro-slot', {
		name,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: value },
	});
};

/**
 * This tells React to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = Symbol.for('react.element');

function errorIsComingFromPreactComponent(err) {
	return (
		err.message &&
		(err.message.startsWith("Cannot read property '__H'") ||
			err.message.includes("(reading '__H')"))
	);
}

async function check$1(Component, props, children) {
	// Note: there are packages that do some unholy things to create "components".
	// Checking the $$typeof property catches most of these patterns.
	if (typeof Component === 'object') {
		const $$typeof = Component['$$typeof'];
		return $$typeof && $$typeof.toString().slice('Symbol('.length).startsWith('react');
	}
	if (typeof Component !== 'function') return false;

	if (Component.prototype != null && typeof Component.prototype.render === 'function') {
		return React.Component.isPrototypeOf(Component) || React.PureComponent.isPrototypeOf(Component);
	}

	let error = null;
	let isReactComponent = false;
	function Tester(...args) {
		try {
			const vnode = Component(...args);
			if (vnode && vnode['$$typeof'] === reactTypeof) {
				isReactComponent = true;
			}
		} catch (err) {
			if (!errorIsComingFromPreactComponent(err)) {
				error = err;
			}
		}

		return React.createElement('div');
	}

	await renderToStaticMarkup$1(Tester, props, children, {});

	if (error) {
		throw error;
	}
	return isReactComponent;
}

async function getNodeWritable() {
	let nodeStreamBuiltinModuleName = 'stream';
	let { Writable } = await import(/* @vite-ignore */ nodeStreamBuiltinModuleName);
	return Writable;
}

async function renderToStaticMarkup$1(Component, props, { default: children, ...slotted }, metadata) {
	delete props['class'];
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName$1(key);
		slots[name] = React.createElement(StaticHtml, { value, name });
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
	};
	if (children != null) {
		newProps.children = React.createElement(StaticHtml, { value: children });
	}
	const vnode = React.createElement(Component, newProps);
	let html;
	if (metadata && metadata.hydrate) {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToPipeableStreamAsync(vnode);
		}
	} else {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToStaticNodeStreamAsync(vnode);
		}
	}
	return { html };
}

async function renderToPipeableStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let error = undefined;
		let stream = ReactDOM.renderToPipeableStream(vnode, {
			onError(err) {
				error = err;
				reject(error);
			},
			onAllReady() {
				stream.pipe(
					new Writable({
						write(chunk, _encoding, callback) {
							html += chunk.toString('utf-8');
							callback();
						},
						destroy() {
							resolve(html);
						},
					})
				);
			},
		});
	});
}

async function renderToStaticNodeStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let stream = ReactDOM.renderToStaticNodeStream(vnode);
		stream.on('error', (err) => {
			reject(err);
		});
		stream.pipe(
			new Writable({
				write(chunk, _encoding, callback) {
					html += chunk.toString('utf-8');
					callback();
				},
				destroy() {
					resolve(html);
				},
			})
		);
	});
}

/**
 * Use a while loop instead of "for await" due to cloudflare and Vercel Edge issues
 * See https://github.com/facebook/react/issues/24169
 */
async function readResult(stream) {
	const reader = stream.getReader();
	let result = '';
	const decoder = new TextDecoder('utf-8');
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			if (value) {
				result += decoder.decode(value);
			} else {
				// This closes the decoder
				decoder.decode(new Uint8Array());
			}

			return result;
		}
		result += decoder.decode(value, { stream: true });
	}
}

async function renderToReadableStreamAsync(vnode) {
	return await readResult(await ReactDOM.renderToReadableStream(vnode));
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

function baseCreateComponent(cb, moduleId) {
  cb.isAstroComponentFactory = true;
  cb.moduleId = moduleId;
  return cb;
}
function createComponentWithOptions(opts) {
  const cb = baseCreateComponent(opts.factory, opts.moduleId);
  cb.propagation = opts.propagation;
  return cb;
}
function createComponent(arg1, moduleId) {
  if (typeof arg1 === "function") {
    return baseCreateComponent(arg1, moduleId);
  } else {
    return createComponentWithOptions(arg1);
  }
}

const ASTRO_VERSION = "1.8.0";

function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLBytes extends Uint8Array {
}
Object.defineProperty(HTMLBytes.prototype, Symbol.toStringTag, {
  get() {
    return "HTMLBytes";
  }
});
class HTMLString extends String {
  get [Symbol.toStringTag]() {
    return "HTMLString";
  }
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};
function isHTMLString(value) {
  return Object.prototype.toString.call(value) === "[object HTMLString]";
}
function markHTMLBytes(bytes) {
  return new HTMLBytes(bytes);
}
async function* unescapeChunksAsync(iterable) {
  for await (const chunk of iterable) {
    yield unescapeHTML(chunk);
  }
}
function* unescapeChunks(iterable) {
  for (const chunk of iterable) {
    yield unescapeHTML(chunk);
  }
}
function unescapeHTML(str) {
  if (!!str && typeof str === "object") {
    if (str instanceof Uint8Array) {
      return markHTMLBytes(str);
    } else if (str instanceof Response && str.body) {
      const body = str.body;
      return unescapeChunksAsync(body);
    } else if (typeof str.then === "function") {
      return Promise.resolve(str).then((value) => {
        return unescapeHTML(value);
      });
    } else if (Symbol.iterator in str) {
      return unescapeChunks(str);
    } else if (Symbol.asyncIterator in str) {
      return unescapeChunksAsync(str);
    }
  }
  return markHTMLString(str);
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(JSON.parse(t)),9:t=>new Uint16Array(JSON.parse(t)),10:t=>new Uint32Array(JSON.parse(t))},o=(t,s)=>{if(t===""||!Array.isArray(s))return s;const[e,n]=s;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const s=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const r of n){const i=r.closest(this.tagName);!i||!i.isSameNode(this)||(e[r.getAttribute("data-astro-template")||"default"]=r.innerHTML,r.remove())}for(const r of s){const i=r.closest(this.tagName);!i||!i.isSameNode(this)||(e[r.getAttribute("name")||"default"]=r.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((s,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate);let s=this.getAttribute("before-hydration-url");s&&await import(s),this.start()}start(){const s=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:r}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),i=this.getAttribute("component-export")||"default";if(!i.includes("."))this.Component=a[i];else{this.Component=a;for(const d of i.split("."))this.Component=this.Component[d]}return this.hydrator=r,this.hydrate},s,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const headAndContentSym = Symbol.for("astro.headAndContent");
function isHeadAndContent(obj) {
  return typeof obj === "object" && !!obj[headAndContentSym];
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}
function isPromise(value) {
  return !!value && typeof value === "object" && typeof value.then === "function";
}

var _a$3;
const renderTemplateResultSym = Symbol.for("astro.renderTemplateResult");
class RenderTemplateResult {
  constructor(htmlParts, expressions) {
    this[_a$3] = true;
    this.htmlParts = htmlParts;
    this.error = void 0;
    this.expressions = expressions.map((expression) => {
      if (isPromise(expression)) {
        return Promise.resolve(expression).catch((err) => {
          if (!this.error) {
            this.error = err;
            throw err;
          }
        });
      }
      return expression;
    });
  }
  get [(_a$3 = renderTemplateResultSym, Symbol.toStringTag)]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isRenderTemplateResult(obj) {
  return typeof obj === "object" && !!obj[renderTemplateResultSym];
}
async function* renderAstroTemplateResult(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
function renderTemplate(htmlParts, ...expressions) {
  return new RenderTemplateResult(htmlParts, expressions);
}

function isAstroComponentFactory(obj) {
  return obj == null ? false : obj.isAstroComponentFactory === true;
}
async function renderToString(result, componentFactory, props, children) {
  const factoryResult = await componentFactory(result, props, children);
  if (factoryResult instanceof Response) {
    const response = factoryResult;
    throw response;
  }
  let parts = new HTMLParts();
  const templateResult = isHeadAndContent(factoryResult) ? factoryResult.content : factoryResult;
  for await (const chunk of renderAstroTemplateResult(templateResult)) {
    parts.append(chunk, result);
  }
  return parts.toString();
}
function isAPropagatingComponent(result, factory) {
  let hint = factory.propagation || "none";
  if (factory.moduleId && result.propagation.has(factory.moduleId) && hint === "none") {
    hint = result.propagation.get(factory.moduleId);
  }
  return hint === "in-tree" || hint === "self";
}

const defineErrors = (errs) => errs;
const AstroErrorData = defineErrors({
  UnknownCompilerError: {
    title: "Unknown compiler error.",
    code: 1e3
  },
  StaticRedirectNotAvailable: {
    title: "`Astro.redirect` is not available in static mode.",
    code: 3001,
    message: "Redirects are only available when using `output: 'server'`. Update your Astro config if you need SSR features.",
    hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR."
  },
  ClientAddressNotAvailable: {
    title: "`Astro.clientAddress` is not available in current adapter.",
    code: 3002,
    message: (adapterName) => `\`Astro.clientAddress\` is not available in the \`${adapterName}\` adapter. File an issue with the adapter to add support.`
  },
  StaticClientAddressNotAvailable: {
    title: "`Astro.clientAddress` is not available in static mode.",
    code: 3003,
    message: "`Astro.clientAddress` is only available when using `output: 'server'`. Update your Astro config if you need SSR features.",
    hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR."
  },
  NoMatchingStaticPathFound: {
    title: "No static path found for requested path.",
    code: 3004,
    message: (pathName) => `A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`${pathName}\`.`,
    hint: (possibleRoutes) => `Possible dynamic routes being matched: ${possibleRoutes.join(", ")}.`
  },
  OnlyResponseCanBeReturned: {
    title: "Invalid type returned by Astro page.",
    code: 3005,
    message: (route, returnedValue) => `Route \`${route ? route : ""}\` returned a \`${returnedValue}\`. Only a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned from Astro files.`,
    hint: "See https://docs.astro.build/en/guides/server-side-rendering/#response for more information."
  },
  MissingMediaQueryDirective: {
    title: "Missing value for `client:media` directive.",
    code: 3006,
    message: 'Media query not provided for `client:media` directive. A media query similar to `client:media="(max-width: 600px)"` must be provided'
  },
  NoMatchingRenderer: {
    title: "No matching renderer found.",
    code: 3007,
    message: (componentName, componentExtension, plural, validRenderersCount) => `Unable to render \`${componentName}\`.

${validRenderersCount > 0 ? `There ${plural ? "are." : "is."} ${validRenderersCount} renderer${plural ? "s." : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were." : "it was not."} able to server-side render \`${componentName}\`.` : `No valid renderer was found ${componentExtension ? `for the \`.${componentExtension}\` file extension.` : `for this file extension.`}`}`,
    hint: (probableRenderers) => `Did you mean to enable the ${probableRenderers} integration?

See https://docs.astro.build/en/core-concepts/framework-components/ for more information on how to install and configure integrations.`
  },
  NoClientEntrypoint: {
    title: "No client entrypoint specified in renderer.",
    code: 3008,
    message: (componentName, clientDirective, rendererName) => `\`${componentName}\` component has a \`client:${clientDirective}\` directive, but no client entrypoint was provided by \`${rendererName}\`.`,
    hint: "See https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option for more information on how to configure your renderer."
  },
  NoClientOnlyHint: {
    title: "Missing hint on client:only directive.",
    code: 3009,
    message: (componentName) => `Unable to render \`${componentName}\`. When using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.`,
    hint: (probableRenderers) => `Did you mean to pass \`client:only="${probableRenderers}"\`? See https://docs.astro.build/en/reference/directives-reference/#clientonly for more information on client:only`
  },
  InvalidGetStaticPathParam: {
    title: "Invalid value returned by a `getStaticPaths` path.",
    code: 3010,
    message: (paramType) => `Invalid params given to \`getStaticPaths\` path. Expected an \`object\`, got \`${paramType}\``,
    hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
  },
  InvalidGetStaticPathsReturn: {
    title: "Invalid value returned by getStaticPaths.",
    code: 3011,
    message: (returnType) => `Invalid type returned by \`getStaticPaths\`. Expected an \`array\`, got \`${returnType}\``,
    hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
  },
  GetStaticPathsRemovedRSSHelper: {
    title: "getStaticPaths RSS helper is not available anymore.",
    code: 3012,
    message: "The RSS helper has been removed from `getStaticPaths`. Try the new @astrojs/rss package instead.",
    hint: "See https://docs.astro.build/en/guides/rss/ for more information."
  },
  GetStaticPathsExpectedParams: {
    title: "Missing params property on `getStaticPaths` route.",
    code: 3013,
    message: "Missing or empty required `params` property on `getStaticPaths` route.",
    hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
  },
  GetStaticPathsInvalidRouteParam: {
    title: "Invalid value for `getStaticPaths` route parameter.",
    code: 3014,
    message: (key, value, valueType) => `Invalid getStaticPaths route parameter for \`${key}\`. Expected undefined, a string or a number, received \`${valueType}\` (\`${value}\`)`,
    hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
  },
  GetStaticPathsRequired: {
    title: "`getStaticPaths()` function required for dynamic routes.",
    code: 3015,
    message: "`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths` function from your dynamic route.",
    hint: `See https://docs.astro.build/en/core-concepts/routing/#dynamic-routes for more information on dynamic routes.

Alternatively, set \`output: "server"\` in your Astro config file to switch to a non-static server build.
See https://docs.astro.build/en/guides/server-side-rendering/ for more information on non-static rendering.`
  },
  ReservedSlotName: {
    title: "Invalid slot name.",
    code: 3016,
    message: (slotName) => `Unable to create a slot named \`${slotName}\`. \`${slotName}\` is a reserved slot name. Please update the name of this slot.`
  },
  NoAdapterInstalled: {
    title: "Cannot use Server-side Rendering without an adapter.",
    code: 3017,
    message: `Cannot use \`output: 'server'\` without an adapter. Please install and configure the appropriate server adapter for your final deployment.`,
    hint: "See https://docs.astro.build/en/guides/server-side-rendering/ for more information."
  },
  NoMatchingImport: {
    title: "No import found for component.",
    code: 3018,
    message: (componentName) => `Could not render \`${componentName}\`. No matching import has been found for \`${componentName}\`.`,
    hint: "Please make sure the component is properly imported."
  },
  InvalidPrerenderExport: {
    title: "Invalid prerender export.",
    code: 3019,
    message: (prefix, suffix) => {
      let msg = `A \`prerender\` export has been detected, but its value cannot be statically analyzed.`;
      if (prefix !== "const")
        msg += `
Expected \`const\` declaration but got \`${prefix}\`.`;
      if (suffix !== "true")
        msg += `
Expected \`true\` value but got \`${suffix}\`.`;
      return msg;
    },
    hint: "Mutable values declared at runtime are not supported. Please make sure to use exactly `export const prerender = true`."
  },
  UnknownViteError: {
    title: "Unknown Vite Error.",
    code: 4e3
  },
  FailedToLoadModuleSSR: {
    title: "Could not import file.",
    code: 4001,
    message: (importName) => `Could not import \`${importName}\`.`,
    hint: "This is often caused by a typo in the import path. Please make sure the file exists."
  },
  InvalidGlob: {
    title: "Invalid glob pattern.",
    code: 4002,
    message: (globPattern) => `Invalid glob pattern: \`${globPattern}\`. Glob patterns must start with './', '../' or '/'.`,
    hint: "See https://docs.astro.build/en/guides/imports/#glob-patterns for more information on supported glob patterns."
  },
  UnknownCSSError: {
    title: "Unknown CSS Error.",
    code: 5e3
  },
  CSSSyntaxError: {
    title: "CSS Syntax Error.",
    code: 5001
  },
  UnknownMarkdownError: {
    title: "Unknown Markdown Error.",
    code: 6e3
  },
  MarkdownFrontmatterParseError: {
    title: "Failed to parse Markdown frontmatter.",
    code: 6001
  },
  MarkdownContentSchemaValidationError: {
    title: "Content collection frontmatter invalid.",
    code: 6002,
    message: (collection, entryId, error) => {
      return [
        `${String(collection)} \u2192 ${String(entryId)} frontmatter does not match collection schema.`,
        ...error.errors.map((zodError) => zodError.message)
      ].join("\n");
    },
    hint: "See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas."
  },
  UnknownConfigError: {
    title: "Unknown configuration error.",
    code: 7e3
  },
  ConfigNotFound: {
    title: "Specified configuration file not found.",
    code: 7001,
    message: (configFile) => `Unable to resolve \`--config "${configFile}"\`. Does the file exist?`
  },
  ConfigLegacyKey: {
    title: "Legacy configuration detected.",
    code: 7002,
    message: (legacyConfigKey) => `Legacy configuration detected: \`${legacyConfigKey}\`.`,
    hint: "Please update your configuration to the new format.\nSee https://astro.build/config for more information."
  },
  UnknownCLIError: {
    title: "Unknown CLI Error.",
    code: 8e3
  },
  GenerateContentTypesError: {
    title: "Failed to generate content types.",
    code: 8001,
    message: "`astro sync` command failed to generate content collection types.",
    hint: "Check your `src/content/config.*` file for typos."
  },
  UnknownError: {
    title: "Unknown Error.",
    code: 99999
  }
});

function normalizeLF(code) {
  return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
}
function getErrorDataByCode(code) {
  const entry = Object.entries(AstroErrorData).find((data) => data[1].code === code);
  if (entry) {
    return {
      name: entry[0],
      data: entry[1]
    };
  }
}

function codeFrame(src, loc) {
  if (!loc || loc.line === void 0 || loc.column === void 0) {
    return "";
  }
  const lines = normalizeLF(src).split("\n").map((ln) => ln.replace(/\t/g, "  "));
  const visibleLines = [];
  for (let n = -2; n <= 2; n++) {
    if (lines[loc.line + n])
      visibleLines.push(loc.line + n);
  }
  let gutterWidth = 0;
  for (const lineNo of visibleLines) {
    let w = `> ${lineNo}`;
    if (w.length > gutterWidth)
      gutterWidth = w.length;
  }
  let output = "";
  for (const lineNo of visibleLines) {
    const isFocusedLine = lineNo === loc.line - 1;
    output += isFocusedLine ? "> " : "  ";
    output += `${lineNo + 1} | ${lines[lineNo]}
`;
    if (isFocusedLine)
      output += `${Array.from({ length: gutterWidth }).join(" ")}  | ${Array.from({
        length: loc.column
      }).join(" ")}^
`;
  }
  return output;
}

class AstroError extends Error {
  constructor(props, ...params) {
    var _a;
    super(...params);
    this.type = "AstroError";
    const { code, name, title, message, stack, location, hint, frame } = props;
    this.errorCode = code;
    if (name && name !== "Error") {
      this.name = name;
    } else {
      this.name = ((_a = getErrorDataByCode(this.errorCode)) == null ? void 0 : _a.name) ?? "UnknownError";
    }
    this.title = title;
    if (message)
      this.message = message;
    this.stack = stack ? stack : this.stack;
    this.loc = location;
    this.hint = hint;
    this.frame = frame;
  }
  setErrorCode(errorCode) {
    this.errorCode = errorCode;
  }
  setLocation(location) {
    this.loc = location;
  }
  setName(name) {
    this.name = name;
  }
  setMessage(message) {
    this.message = message;
  }
  setHint(hint) {
    this.hint = hint;
  }
  setFrame(source, location) {
    this.frame = codeFrame(source, location);
  }
  static is(err) {
    return err.type === "AstroError";
  }
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7,
  Uint8Array: 8,
  Uint16Array: 9,
  Uint32Array: 10
};
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v, metadata, parents)];
    })
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [
        PROP_TYPE.Map,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object Set]": {
      return [
        PROP_TYPE.Set,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value, metadata, parents))];
    }
    case "[object Uint8Array]": {
      return [PROP_TYPE.Uint8Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint16Array]": {
      return [PROP_TYPE.Uint16Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint32Array]": {
      return [PROP_TYPE.Uint32Array, JSON.stringify(Array.from(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props, metadata) {
  const serialized = JSON.stringify(serializeObject(props, metadata));
  return serialized;
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(displayName, inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new AstroError(AstroErrorData.MissingMediaQueryDirective);
          }
          break;
        }
      }
    } else if (key === "class:list") {
      if (value) {
        extracted.props[key.slice(0, -5)] = serializeListValue(value);
      }
    } else {
      extracted.props[key] = value;
    }
  }
  for (const sym of Object.getOwnPropertySymbols(inputProps)) {
    extracted.props[sym] = inputProps[sym];
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = escapeHTML(value);
    }
  }
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(decodeURI(renderer.clientEntrypoint));
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  let beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) {
    island.props["before-hydration-url"] = beforeHydrationUrl;
  }
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var _a$2;
const astroComponentInstanceSym = Symbol.for("astro.componentInstance");
class AstroComponentInstance {
  constructor(result, props, slots, factory) {
    this[_a$2] = true;
    this.result = result;
    this.props = props;
    this.factory = factory;
    this.slotValues = {};
    for (const name in slots) {
      this.slotValues[name] = slots[name]();
    }
  }
  async init() {
    this.returnValue = this.factory(this.result, this.props, this.slotValues);
    return this.returnValue;
  }
  async *render() {
    if (this.returnValue === void 0) {
      await this.init();
    }
    let value = this.returnValue;
    if (isPromise(value)) {
      value = await value;
    }
    if (isHeadAndContent(value)) {
      yield* value.content;
    } else {
      yield* renderChild(value);
    }
  }
}
_a$2 = astroComponentInstanceSym;
function validateComponentProps(props, displayName) {
  if (props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
function createAstroComponentInstance(result, displayName, factory, props, slots = {}) {
  validateComponentProps(props, displayName);
  const instance = new AstroComponentInstance(result, props, slots, factory);
  if (isAPropagatingComponent(result, factory) && !result.propagators.has(factory)) {
    result.propagators.set(factory, instance);
  }
  return instance;
}
function isAstroComponentInstance(obj) {
  return typeof obj === "object" && !!obj[astroComponentInstanceSym];
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof SlotString) {
    if (child.instructions) {
      yield* child.instructions;
    }
    yield child;
  } else if (isHTMLString(child)) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (isRenderTemplateResult(child)) {
    yield* renderAstroTemplateResult(child);
  } else if (isAstroComponentInstance(child)) {
    yield* child.render();
  } else if (ArrayBuffer.isView(child)) {
    yield child;
  } else if (typeof child === "object" && (Symbol.asyncIterator in child || Symbol.iterator in child)) {
    yield* child;
  } else {
    yield child;
  }
}

const slotString = Symbol.for("astro:slot-string");
class SlotString extends HTMLString {
  constructor(content, instructions) {
    super(content);
    this.instructions = instructions;
    this[slotString] = true;
  }
}
function isSlotString(str) {
  return !!str[slotString];
}
async function renderSlot(_result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    let instructions = null;
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        if (instructions === null) {
          instructions = [];
        }
        instructions.push(chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(new SlotString(content, instructions));
  }
  return fallback;
}
async function renderSlots(result, slots = {}) {
  let slotInstructions = null;
  let children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          if (output.instructions) {
            if (slotInstructions === null) {
              slotInstructions = [];
            }
            slotInstructions.push(...output.instructions);
          }
          children[key] = output;
        })
      )
    );
  }
  return { slotInstructions, children };
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      if (isSlotString(chunk)) {
        let out = "";
        const c = chunk;
        if (c.instructions) {
          for (const instr of c.instructions) {
            out += stringifyChunk(result, instr);
          }
        }
        out += chunk.toString();
        return out;
      }
      return chunk.toString();
    }
  }
}
class HTMLParts {
  constructor() {
    this.parts = "";
  }
  append(part, result) {
    if (ArrayBuffer.isView(part)) {
      this.parts += decoder.decode(part);
    } else {
      this.parts += stringifyChunk(result, part);
    }
  }
  toString() {
    return this.parts;
  }
  toArrayBuffer() {
    return encoder.encode(this.parts);
  }
}

const ClientOnlyPlaceholder = "astro-client-only";
class Skip {
  constructor(vnode) {
    this.vnode = vnode;
    this.count = 0;
  }
  increment() {
    this.count++;
  }
  haveNoTried() {
    return this.count === 0;
  }
  isCompleted() {
    return this.count > 2;
  }
}
Skip.symbol = Symbol("astro:jsx:skip");
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case typeof vnode === "function":
      return vnode;
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  let skip;
  if (vnode.props) {
    if (vnode.props[Skip.symbol]) {
      skip = vnode.props[Skip.symbol];
    } else {
      skip = new Skip(vnode);
    }
  } else {
    skip = new Skip(vnode);
  }
  return renderJSXVNode(result, vnode, skip);
}
async function renderJSXVNode(result, vnode, skip) {
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type: {
        throw new Error(`Unable to render ${result._metadata.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      }
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement$1(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skip.increment();
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function") {
        if (skip.haveNoTried() || skip.isCompleted()) {
          useConsoleFilter();
          try {
            const output2 = await vnode.type(vnode.props ?? {});
            let renderResult;
            if (output2 && output2[AstroJSX]) {
              renderResult = await renderJSXVNode(result, output2, skip);
              return renderResult;
            } else if (!output2) {
              renderResult = await renderJSXVNode(result, output2, skip);
              return renderResult;
            }
          } catch (e) {
            if (skip.isCompleted()) {
              throw e;
            }
            skip.increment();
          } finally {
            finishUsingConsoleFilter();
          }
        } else {
          skip.increment();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      props[Skip.symbol] = skip;
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponentToIterable(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponentToIterable(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let parts = new HTMLParts();
        for await (const chunk of output) {
          parts.append(chunk, result);
        }
        return markHTMLString(parts.toString());
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement$1(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
  originalConsoleError(msg, ...rest);
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `const ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value), shouldEscape);
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toAttributeString(toStyleString(value), shouldEscape)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/solid", "@astrojs/vue (jsx)"];
    default:
      return [
        "@astrojs/react",
        "@astrojs/preact",
        "@astrojs/solid",
        "@astrojs/vue",
        "@astrojs/svelte"
      ];
  }
}
function isFragmentComponent(Component) {
  return Component === Fragment;
}
function isHTMLComponent(Component) {
  return Component && typeof Component === "object" && Component["astro:html"];
}
async function renderFrameworkComponent(result, displayName, Component, _props, slots = {}) {
  var _a, _b;
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(displayName, _props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  const validRenderers = renderers.filter((r) => r.name !== "astro:jsx");
  const { children, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    let isTagged = false;
    try {
      isTagged = Component && Component[Renderer];
    } catch {
    }
    if (isTagged) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && validRenderers.length === 1) {
      renderer = validRenderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new AstroError({
        ...AstroErrorData.NoClientOnlyHint,
        message: AstroErrorData.NoClientOnlyHint.message(metadata.displayName),
        hint: AstroErrorData.NoClientOnlyHint.hint(
          probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")
        )
      });
    } else if (typeof Component !== "string") {
      const matchingRenderers = validRenderers.filter(
        (r) => probableRendererNames.includes(r.name)
      );
      const plural = validRenderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new AstroError({
          ...AstroErrorData.NoMatchingRenderer,
          message: AstroErrorData.NoMatchingRenderer.message(
            metadata.displayName,
            (_b = metadata == null ? void 0 : metadata.componentUrl) == null ? void 0 : _b.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: AstroErrorData.NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`"))
          )
        });
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new AstroError({
      ...AstroErrorData.NoClientEntrypoint,
      message: AstroErrorData.NoClientEntrypoint.message(
        displayName,
        metadata.hydrate,
        renderer.name
      )
    });
  }
  if (!html && typeof Component === "string") {
    const Tag = sanitizeElementName(Component);
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroTemplateResult(
      await renderTemplate`<${Tag}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Tag) ? `/>` : `>${childSlots}</${Tag}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    return async function* () {
      if (slotInstructions) {
        yield* slotInstructions;
      }
      if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
        yield html;
      } else {
        yield markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
      }
    }();
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props,
      metadata
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    if (slotInstructions) {
      yield* slotInstructions;
    }
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement("astro-island", island, false));
  }
  return renderAll();
}
function sanitizeElementName(tag) {
  const unsafe = /[&<>'"\s]+/g;
  if (!unsafe.test(tag))
    return tag;
  return tag.trim().split(unsafe)[0].trim();
}
async function renderFragmentComponent(result, slots = {}) {
  const children = await renderSlot(result, slots == null ? void 0 : slots.default);
  if (children == null) {
    return children;
  }
  return markHTMLString(children);
}
async function renderHTMLComponent(result, Component, _props, slots = {}) {
  const { slotInstructions, children } = await renderSlots(result, slots);
  const html = Component.render({ slots: children });
  const hydrationHtml = slotInstructions ? slotInstructions.map((instr) => stringifyChunk(result, instr)).join("") : "";
  return markHTMLString(hydrationHtml + html);
}
function renderComponent(result, displayName, Component, props, slots = {}) {
  if (isPromise(Component)) {
    return Promise.resolve(Component).then((Unwrapped) => {
      return renderComponent(result, displayName, Unwrapped, props, slots);
    });
  }
  if (isFragmentComponent(Component)) {
    return renderFragmentComponent(result, slots);
  }
  if (isHTMLComponent(Component)) {
    return renderHTMLComponent(result, Component, props, slots);
  }
  if (isAstroComponentFactory(Component)) {
    return createAstroComponentInstance(result, displayName, Component, props, slots);
  }
  return renderFrameworkComponent(result, displayName, Component, props, slots);
}
function renderComponentToIterable(result, displayName, Component, props, slots = {}) {
  const renderResult = renderComponent(result, displayName, Component, props, slots);
  if (isAstroComponentInstance(renderResult)) {
    return renderResult.render();
  }
  return renderResult;
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
async function* renderExtraHead(result, base) {
  yield base;
  for (const part of result.extraHead) {
    yield* renderChild(part);
  }
}
function renderAllHeadContent(result) {
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement("link", link, false));
  const baseHeadContent = markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
  if (result.extraHead.length > 0) {
    return renderExtraHead(result, baseHeadContent);
  } else {
    return baseHeadContent;
  }
}
function createRenderHead(result) {
  result._metadata.hasRenderedHead = true;
  return renderAllHeadContent.bind(null, result);
}
const renderHead = createRenderHead;
async function* maybeRenderHead(result) {
  if (result._metadata.hasRenderedHead) {
    return;
  }
  yield createRenderHead(result)();
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

function __astro_tag_component__(Component, rendererName) {
  if (!Component)
    return;
  if (typeof Component !== "function")
    return;
  Object.defineProperty(Component, Renderer, {
    value: rendererName,
    enumerable: false,
    writable: false
  });
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (slotAttr) => slotAttr;
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [Renderer]: "astro:jsx",
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

const SITE = {
  website: "https://astro-paper.pages.dev/",
  author: "Jakub Hajduk",
  desc: "A minimalistic site with covering letters for different purposes.",
  title: "Hire me!",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 4
};
const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/EmFor2001",
    linkTitle: `Check me on Github`,
    active: true
  },
  {
    name: "Facebook",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Facebook`,
    active: false
  },
  {
    name: "Instagram",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Instagram`,
    active: false
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/jakub-hajduk-35290320a/",
    linkTitle: `Check me on LinkedIn`,
    active: true
  },
  {
    name: "Mail",
    href: "mailto:k.hajduk.kh@gmail.com",
    linkTitle: `Send me an email`,
    active: true
  },
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitter`,
    active: false
  },
  {
    name: "Twitch",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitch`,
    active: false
  },
  {
    name: "YouTube",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on YouTube`,
    active: false
  },
  {
    name: "WhatsApp",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: false
  },
  {
    name: "Snapchat",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Snapchat`,
    active: false
  },
  {
    name: "Pinterest",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Pinterest`,
    active: false
  },
  {
    name: "TikTok",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on TikTok`,
    active: false
  },
  {
    name: "CodePen",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on CodePen`,
    active: false
  },
  {
    name: "Discord",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Discord`,
    active: false
  },
  {
    name: "GitLab",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on GitLab`,
    active: false
  },
  {
    name: "Reddit",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Reddit`,
    active: false
  },
  {
    name: "Skype",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Skype`,
    active: false
  },
  {
    name: "Steam",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Steam`,
    active: false
  },
  {
    name: "Telegram",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Telegram`,
    active: false
  },
  {
    name: "Mastodon",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Mastodon`,
    active: false
  }
];

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$Astro$i = createAstro("S:/Programowanie/Covering letter page/src/layouts/Layout.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$i, $$props, $$slots);
  Astro2.self = $$Layout;
  const googleSiteVerification = ({}).PUBLIC_GOOGLE_SITE_VERIFICATION;
  const {
    title = SITE.title,
    author = SITE.author,
    description = SITE.desc,
    ogImage = SITE.ogImage
  } = Astro2.props;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site);
  const socialImageURL = new URL(
    ogImage ? ogImage : SITE.ogImage,
    Astro2.url.origin
  );
  return renderTemplate(_a$1 || (_a$1 = __template$1(['<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width">\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n    <link rel="canonical"', '>\n    <meta name="generator"', ">\n\n    <!-- General Meta Tags -->\n    <title>", '</title>\n    <meta name="title"', '>\n    <meta name="description"', '>\n    <meta name="author"', '>\n\n    <!-- Open Graph / Facebook -->\n    <meta property="og:title"', '>\n    <meta property="og:description"', '>\n    <meta property="og:url"', '>\n    <meta property="og:image"', '>\n\n    <!-- Twitter -->\n    <meta property="twitter:card" content="summary_large_image">\n    <meta property="twitter:url"', '>\n    <meta property="twitter:title"', '>\n    <meta property="twitter:description"', '>\n    <meta property="twitter:image"', `>

    <!-- Google Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">

    `, '\n\n    <script src="/toggle-theme.js"><\/script>\n  ', "</head>\n  <body>\n    ", "\n  </body></html>"])), addAttribute(canonicalURL, "href"), addAttribute(Astro2.generator, "content"), title, addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(author, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(canonicalURL, "content"), addAttribute(socialImageURL, "content"), addAttribute(canonicalURL, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(socialImageURL, "content"), googleSiteVerification && renderTemplate`<meta name="google-site-verification"${addAttribute(googleSiteVerification, "content")}>`, renderHead($$result), renderSlot($$result, $$slots["default"]));
}, "S:/Programowanie/Covering letter page/src/layouts/Layout.astro");

const $$Astro$h = createAstro("S:/Programowanie/Covering letter page/src/components/Hr.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Hr = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$h, $$props, $$slots);
  Astro2.self = $$Hr;
  const { noPadding = false, ariaHidden = true } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div${addAttribute(`max-w-3xl mx-auto ${noPadding ? "px-0" : "px-4"}`, "class")}>
  <hr class="border-skin-line"${addAttribute(ariaHidden, "aria-hidden")}>
</div>`;
}, "S:/Programowanie/Covering letter page/src/components/Hr.astro");

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$g = createAstro("S:/Programowanie/Covering letter page/src/components/Header.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$g, $$props, $$slots);
  Astro2.self = $$Header;
  const { activeNav } = Astro2.props;
  return renderTemplate(_a || (_a = __template(["", '<header class="astro-PG5MY4GQ">\n  <a id="skip-to-content" href="#main-content" class="astro-PG5MY4GQ">Skip to content</a>\n  <div class="nav-container astro-PG5MY4GQ">\n    <div class="top-nav-wrap astro-PG5MY4GQ">\n      <a href="/" class="logo astro-PG5MY4GQ">\n        ', '\n      </a>\n      <nav id="nav-menu" class="astro-PG5MY4GQ">\n        <button class="hamburger-menu focus-outline astro-PG5MY4GQ" aria-label="Open Menu" aria-expanded="false" aria-controls="menu-items">\n          <div class="icon-container flex astro-PG5MY4GQ">\n            <div id="first-line" class="astro-PG5MY4GQ"></div>\n            <div id="second-line" class="astro-PG5MY4GQ"></div>\n            <div id="third-line" class="astro-PG5MY4GQ"></div>\n          </div>\n        </button>\n        <ul id="menu-items" class="display-none sm:flex astro-PG5MY4GQ">\n          <li class="astro-PG5MY4GQ">\n            <a href="/covering-letters"', '>\n              Covering Letters\n            </a>\n          </li>\n          <!-- <li>\n            <a href="/tags" class={activeNav === "tags" ? "active" : ""}>\n              Tags\n            </a>\n          </li> -->\n          <li class="astro-PG5MY4GQ">\n            <a href="/about"', '>\n              About\n            </a>\n          </li>\n          <!-- <li>\n            <LinkButton\n              href="/search"\n              className={`focus-outline p-3 sm:p-1 ${\n                activeNav === "search" ? "active" : ""\n              }`}\n              ariaLabel="search"\n              title="Search"\n            >\n              <svg\n                xmlns="http://www.w3.org/2000/svg"\n                class="scale-125 sm:scale-100"\n                ><path\n                  d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"\n                ></path>\n              </svg>\n            </LinkButton>\n          </li> -->\n          <li class="astro-PG5MY4GQ">\n            ', "\n          </li>\n        </ul>\n      </nav>\n    </div>\n  </div>\n  ", '\n</header>\n\n\n\n<script type="module">\n  // Toggle menu\n  const menuBtn = document.querySelector(".hamburger-menu");\n  const menuItems = document.querySelector("#menu-items")?.classList;\n  const iconContainer = document.querySelector(".icon-container")?.classList;\n  const firstLine = document.querySelector("#first-line")?.classList;\n  const secondLine = document.querySelector("#second-line ")?.classList;\n  const thirdLine = document.querySelector("#third-line")?.classList;\n  menuBtn.addEventListener("click", function (event) {\n    const menuExpanded = menuBtn.getAttribute("aria-expanded");\n    if (menuExpanded === "false") {\n      menuBtn.setAttribute("aria-expanded", "true");\n      menuBtn.setAttribute("aria-label", "Close Menu");\n      menuItems.remove("display-none");\n      // icon animation\n      iconContainer.remove("flex");\n      iconContainer.add("relative");\n      firstLine.add("rotate-45", "absolute", "bottom-1/2");\n      thirdLine.add("display-none");\n      secondLine.add("!w-full", "-rotate-45", "absolute", "bottom-1/2");\n    } else {\n      menuBtn.setAttribute("aria-expanded", "false");\n      menuBtn.setAttribute("aria-label", "Open Menu");\n      menuItems.add("display-none");\n      // icon animation\n      iconContainer.add("flex");\n      iconContainer.remove("relative");\n      firstLine.remove("rotate-45", "absolute", "bottom-1/2");\n      thirdLine.remove("display-none");\n      secondLine.remove("!w-full", "-rotate-45", "absolute", "bottom-1/2");\n    }\n  });\n<\/script>'], ["", '<header class="astro-PG5MY4GQ">\n  <a id="skip-to-content" href="#main-content" class="astro-PG5MY4GQ">Skip to content</a>\n  <div class="nav-container astro-PG5MY4GQ">\n    <div class="top-nav-wrap astro-PG5MY4GQ">\n      <a href="/" class="logo astro-PG5MY4GQ">\n        ', '\n      </a>\n      <nav id="nav-menu" class="astro-PG5MY4GQ">\n        <button class="hamburger-menu focus-outline astro-PG5MY4GQ" aria-label="Open Menu" aria-expanded="false" aria-controls="menu-items">\n          <div class="icon-container flex astro-PG5MY4GQ">\n            <div id="first-line" class="astro-PG5MY4GQ"></div>\n            <div id="second-line" class="astro-PG5MY4GQ"></div>\n            <div id="third-line" class="astro-PG5MY4GQ"></div>\n          </div>\n        </button>\n        <ul id="menu-items" class="display-none sm:flex astro-PG5MY4GQ">\n          <li class="astro-PG5MY4GQ">\n            <a href="/covering-letters"', '>\n              Covering Letters\n            </a>\n          </li>\n          <!-- <li>\n            <a href="/tags" class={activeNav === "tags" ? "active" : ""}>\n              Tags\n            </a>\n          </li> -->\n          <li class="astro-PG5MY4GQ">\n            <a href="/about"', '>\n              About\n            </a>\n          </li>\n          <!-- <li>\n            <LinkButton\n              href="/search"\n              className={\\`focus-outline p-3 sm:p-1 \\${\n                activeNav === "search" ? "active" : ""\n              }\\`}\n              ariaLabel="search"\n              title="Search"\n            >\n              <svg\n                xmlns="http://www.w3.org/2000/svg"\n                class="scale-125 sm:scale-100"\n                ><path\n                  d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"\n                ></path>\n              </svg>\n            </LinkButton>\n          </li> -->\n          <li class="astro-PG5MY4GQ">\n            ', "\n          </li>\n        </ul>\n      </nav>\n    </div>\n  </div>\n  ", '\n</header>\n\n\n\n<script type="module">\n  // Toggle menu\n  const menuBtn = document.querySelector(".hamburger-menu");\n  const menuItems = document.querySelector("#menu-items")?.classList;\n  const iconContainer = document.querySelector(".icon-container")?.classList;\n  const firstLine = document.querySelector("#first-line")?.classList;\n  const secondLine = document.querySelector("#second-line ")?.classList;\n  const thirdLine = document.querySelector("#third-line")?.classList;\n  menuBtn.addEventListener("click", function (event) {\n    const menuExpanded = menuBtn.getAttribute("aria-expanded");\n    if (menuExpanded === "false") {\n      menuBtn.setAttribute("aria-expanded", "true");\n      menuBtn.setAttribute("aria-label", "Close Menu");\n      menuItems.remove("display-none");\n      // icon animation\n      iconContainer.remove("flex");\n      iconContainer.add("relative");\n      firstLine.add("rotate-45", "absolute", "bottom-1/2");\n      thirdLine.add("display-none");\n      secondLine.add("!w-full", "-rotate-45", "absolute", "bottom-1/2");\n    } else {\n      menuBtn.setAttribute("aria-expanded", "false");\n      menuBtn.setAttribute("aria-label", "Open Menu");\n      menuItems.add("display-none");\n      // icon animation\n      iconContainer.add("flex");\n      iconContainer.remove("relative");\n      firstLine.remove("rotate-45", "absolute", "bottom-1/2");\n      thirdLine.remove("display-none");\n      secondLine.remove("!w-full", "-rotate-45", "absolute", "bottom-1/2");\n    }\n  });\n<\/script>'])), maybeRenderHead($$result), SITE.title, addAttribute((activeNav === "covering-letters" ? "active" : "") + " astro-PG5MY4GQ", "class"), addAttribute((activeNav === "about" ? "active" : "") + " astro-PG5MY4GQ", "class"), renderTemplate`<button id="theme-btn" class="focus-outline astro-PG5MY4GQ" title="Toggles light & dark" aria-label="auto" aria-live="polite">
                  <svg xmlns="http://www.w3.org/2000/svg" id="moon-svg" class="astro-PG5MY4GQ">
                    <path d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93 9.93 9.93 0 0 0 7.07-2.929 10.007 10.007 0 0 0 2.583-4.491 1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343 7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483 10.027 10.027 0 0 0 2.89 7.848 9.972 9.972 0 0 0 7.848 2.891 8.036 8.036 0 0 1-1.484 2.059z" class="astro-PG5MY4GQ"></path>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" id="sun-svg" class="astro-PG5MY4GQ">
                    <path d="M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z" class="astro-PG5MY4GQ"></path>
                  </svg>
                </button>`, renderComponent($$result, "Hr", $$Hr, { "class": "astro-PG5MY4GQ" }));
}, "S:/Programowanie/Covering letter page/src/components/Header.astro");

const $$Astro$f = createAstro("S:/Programowanie/Covering letter page/src/components/LinkButton.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$LinkButton = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$LinkButton;
  const { href, className, ariaLabel, title, disabled = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<a type="button"${addAttribute(disabled ? "#" : href, "href")}${addAttribute(disabled ? "-1" : "0", "tabindex")}${addAttribute(`group ${className} astro-46WLOZ2Y`, "class")}${addAttribute(ariaLabel, "aria-label")}${addAttribute(title, "title")}${addAttribute(disabled, "aria-disabled")}>
  ${renderSlot($$result, $$slots["default"])}
</a>

`;
}, "S:/Programowanie/Covering letter page/src/components/LinkButton.astro");

const socialIcons = {
  Github: `<svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon-tabler"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path
      d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"
    ></path>
  </svg>`,
  Facebook: `<svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon-tabler"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path
      d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"
    ></path>
  </svg>`,
  Instagram: `<svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon-tabler"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <rect x="4" y="4" width="16" height="16" rx="4"></rect>
    <circle cx="12" cy="12" r="3"></circle>
    <line x1="16.5" y1="7.5" x2="16.5" y2="7.501"></line>
  </svg>`,
  LinkedIn: `<svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon-tabler"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <rect x="4" y="4" width="16" height="16" rx="2"></rect>
    <line x1="8" y1="11" x2="8" y2="16"></line>
    <line x1="8" y1="8" x2="8" y2="8.01"></line>
    <line x1="12" y1="16" x2="12" y2="11"></line>
    <path d="M16 16v-3a2 2 0 0 0 -4 0"></path>
  </svg>`,
  Mail: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
      <polyline points="3 7 12 13 21 7"></polyline>
    </svg>`,
  Twitter: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z"></path>
    </svg>`,
  Twitch: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path>
    </svg>`,
  YouTube: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>`,
  WhatsApp: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"></path>
      <path d="M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 0 1"></path>
    </svg>`,
  Snapchat: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M16.882 7.842a4.882 4.882 0 0 0 -9.764 0c0 4.273 -.213 6.409 -4.118 8.118c2 .882 2 .882 3 3c3 0 4 2 6 2s3 -2 6 -2c1 -2.118 1 -2.118 3 -3c-3.906 -1.709 -4.118 -3.845 -4.118 -8.118zm-13.882 8.119c4 -2.118 4 -4.118 1 -7.118m17 7.118c-4 -2.118 -4 -4.118 -1 -7.118"></path>
    </svg>`,
  Pinterest: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <line x1="8" y1="20" x2="12" y2="11"></line>
      <path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7"></path>
      <circle cx="12" cy="12" r="9"></circle>
    </svg>`,
  TikTok: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5"></path>
    </svg>`,
  CodePen: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M3 15l9 6l9 -6l-9 -6l-9 6"></path>
      <path d="M3 9l9 6l9 -6l-9 -6l-9 6"></path>
      <line x1="3" y1="9" x2="3" y2="15"></line>
      <line x1="21" y1="9" x2="21" y2="15"></line>
      <line x1="12" y1="3" x2="12" y2="9"></line>
      <line x1="12" y1="15" x2="12" y2="21"></line>
    </svg>`,
  Discord: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <circle cx="9" cy="12" r="1"></circle>
      <circle cx="15" cy="12" r="1"></circle>
      <path d="M7.5 7.5c3.5 -1 5.5 -1 9 0"></path>
      <path d="M7 16.5c3.5 1 6.5 1 10 0"></path>
      <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-1 2.5"></path>
      <path d="M8.5 17c0 1 -1.356 3 -1.832 3c-1.429 0 -2.698 -1.667 -3.333 -3c-.635 -1.667 -.476 -5.833 1.428 -11.5c1.388 -1.015 2.782 -1.34 4.237 -1.5l1 2.5"></path>
    </svg>`,
  GitLab: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M21 14l-9 7l-9 -7l3 -11l3 7h6l3 -7z"></path>
    </svg>`,
  Reddit: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 8c2.648 0 5.028 .826 6.675 2.14a2.5 2.5 0 0 1 2.326 4.36c0 3.59 -4.03 6.5 -9 6.5c-4.875 0 -8.845 -2.8 -9 -6.294l-1 -.206a2.5 2.5 0 0 1 2.326 -4.36c1.646 -1.313 4.026 -2.14 6.674 -2.14z"></path>
      <path d="M12 8l1 -5l6 1"></path>
      <circle cx="19" cy="4" r="1"></circle>
      <circle cx="9" cy="13" r=".5" fill="currentColor"></circle>
      <circle cx="15" cy="13" r=".5" fill="currentColor"></circle>
      <path d="M10 17c.667 .333 1.333 .5 2 .5s1.333 -.167 2 -.5"></path>
    </svg>`,
  Skype: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 3a9 9 0 0 1 8.603 11.65a4.5 4.5 0 0 1 -5.953 5.953a9 9 0 0 1 -11.253 -11.253a4.5 4.5 0 0 1 5.953 -5.954a8.987 8.987 0 0 1 2.65 -.396z"></path>
      <path d="M8 14.5c.5 2 2.358 2.5 4 2.5c2.905 0 4 -1.187 4 -2.5c0 -1.503 -1.927 -2.5 -4 -2.5s-4 -.997 -4 -2.5c0 -1.313 1.095 -2.5 4 -2.5c1.642 0 3.5 .5 4 2.5"></path>
    </svg>`,
  Steam: `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon-tabler"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M16.5 5a4.5 4.5 0 1 1 -.653 8.953l-4.347 3.009l0 .038a3 3 0 0 1 -2.824 2.995l-.176 .005a3 3 0 0 1 -2.94 -2.402l-2.56 -1.098v-3.5l3.51 1.755a2.989 2.989 0 0 1 2.834 -.635l2.727 -3.818a4.5 4.5 0 0 1 4.429 -5.302z"></path>
      <circle fill="currentColor" cx="16.5" cy="9.5" r="1"></circle>
    </svg>`,
  Telegram: `<svg
        xmlns="http://www.w3.org/2000/svg"
        class="icon-tabler"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4"></path>
      </svg>`,
  Mastodon: `<svg class="icon-tabler" viewBox="-10 -5 1034 1034" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
    <path fill="currentColor"
  d="M499 112q-93 1 -166 11q-81 11 -128 33l-14 8q-16 10 -32 25q-22 21 -38 47q-21 33 -32 73q-14 47 -14 103v37q0 77 1 119q3 113 18 188q19 95 62 154q50 67 134 89q109 29 210 24q46 -3 88 -12q30 -7 55 -17l19 -8l-4 -75l-22 6q-28 6 -57 10q-41 6 -78 4q-53 -1 -80 -7
  q-43 -8 -67 -30q-29 -25 -35 -72q-2 -14 -2 -29l25 6q31 6 65 10q48 7 93 9q42 2 92 -2q32 -2 88 -9t107 -30q49 -23 81.5 -54.5t38.5 -63.5q9 -45 13 -109q4 -46 5 -97v-41q0 -56 -14 -103q-11 -40 -32 -73q-16 -26 -38 -47q-15 -15 -32 -25q-12 -8 -14 -8
  q-46 -22 -127 -33q-74 -10 -166 -11h-3zM367 267q73 0 109 56l24 39l24 -39q36 -56 109 -56q63 0 101 43t38 117v239h-95v-232q0 -74 -61 -74q-69 0 -69 88v127h-94v-127q0 -88 -69 -88q-61 0 -61 74v232h-95v-239q0 -74 38 -117t101 -43z" />
  </svg>`
};

const $$Astro$e = createAstro("S:/Programowanie/Covering letter page/src/components/Socials.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Socials = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$Socials;
  const { centered = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div${addAttribute(`social-icons ${centered ? "flex" : ""} astro-F2IDPSL2`, "class")}>
  ${SOCIALS.filter((social) => social.active).map((social) => renderTemplate`${renderComponent($$result, "LinkButton", $$LinkButton, { "href": social.href, "className": "link-button astro-F2IDPSL2", "title": social.linkTitle }, { "default": () => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": () => renderTemplate`${unescapeHTML(socialIcons[social.name])}` })}` })}`)}
</div>

`;
}, "S:/Programowanie/Covering letter page/src/components/Socials.astro");

const $$Astro$d = createAstro("S:/Programowanie/Covering letter page/src/components/Footer.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Footer;
  const currentYear = new Date().getFullYear();
  const { noMarginTop = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<footer${addAttribute(`${noMarginTop ? "" : "mt-auto"} astro-M3DB3KXG`, "class")}>
  ${renderComponent($$result, "Hr", $$Hr, { "noPadding": true, "class": "astro-M3DB3KXG" })}
  <div class="footer-wrapper astro-M3DB3KXG">
    ${renderComponent($$result, "Socials", $$Socials, { "centered": true, "class": "astro-M3DB3KXG" })}
    <div class="copyright-wrapper astro-M3DB3KXG">
      <span class="astro-M3DB3KXG">Copyright &#169; ${currentYear}</span>
      <span class="separator astro-M3DB3KXG">&nbsp;|&nbsp;</span>
      <span class="astro-M3DB3KXG">All rights reserved.</span>
    </div>
  </div>
</footer>

`;
}, "S:/Programowanie/Covering letter page/src/components/Footer.astro");

const getSortedPosts = (posts) => posts.filter(({ frontmatter }) => !frontmatter.draft).sort(
  (a, b) => Math.floor(new Date(b.frontmatter.datetime).getTime() / 1e3) - Math.floor(new Date(a.frontmatter.datetime).getTime() / 1e3)
);

const $$Astro$c = createAstro("S:/Programowanie/Covering letter page/src/pages/index.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Index$2 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Index$2;
  const posts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../contents/adding-new-post.md": () => Promise.resolve().then(() => __vite_glob_0_0),"../contents/dynatrace.md": () => Promise.resolve().then(() => __vite_glob_0_1),"../contents/lab-control.md": () => Promise.resolve().then(() => __vite_glob_0_2),"../contents/master-born-junior-react.md": () => Promise.resolve().then(() => __vite_glob_0_3),"../contents/voice-lab.md": () => Promise.resolve().then(() => __vite_glob_0_4)}), () => "../contents/**/*.md");
  const sortedPosts = getSortedPosts(posts);
  sortedPosts.filter(
    ({ frontmatter }) => frontmatter.featured
  );
  const socialCount = SOCIALS.filter((social) => social.active).length;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "class": "astro-NRUBHJBN" }, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "class": "astro-NRUBHJBN" })}${maybeRenderHead($$result)}<main id="main-content" class="astro-NRUBHJBN">
    <section id="hero" class="astro-NRUBHJBN">
      <h1 class="astro-NRUBHJBN">Hire me!</h1>

      <p class="astro-NRUBHJBN">
        Welcome to my website! Here you will find a selection of my covering
        letters for the position of junior frontend developer at various
        companies. These letters demonstrate my passion for web development and
        my commitment to creating intuitive and visually appealing user
        experiences. I have a strong foundation in HTML, CSS, JavaScript, and
        React, and I am eager to continue learning and growing as a developer.
        Thank you for considering my applications.
      </p>
      <p class="astro-NRUBHJBN">
        Read the letters, check socials or visit
        ${renderComponent($$result, "LinkButton", $$LinkButton, { "className": "hover:text-skin-accent underline underline-offset-4 decoration-dashed astro-NRUBHJBN", "href": "https://jhajduk.netlify.app" }, { "default": () => renderTemplate`
          my website
        ` })} for more info.
      </p>
      ${socialCount > 0 && renderTemplate`<div class="social-wrapper astro-NRUBHJBN">
            <div class="social-links astro-NRUBHJBN">Social Links:</div>
            ${renderComponent($$result, "Socials", $$Socials, { "class": "astro-NRUBHJBN" })}
          </div>`}
    </section>

    ${renderComponent($$result, "Hr", $$Hr, { "class": "astro-NRUBHJBN" })}

    <!-- {
      featuredPosts.length > 0 && (
        <>
          <section id="featured">
            <h2>Featured</h2>
            <ul>
              {featuredPosts.map(({ frontmatter }) => (
                <Card
                  href={\`/posts/\${slugify(frontmatter)}\`}
                  post={frontmatter}
                  secHeading={false}
                />
              ))}
            </ul>
          </section>
          <Hr />
        </>
      )
    }

    <section id="recent-posts">
      <h2>Recent Posts</h2>
      <ul>
        {
          sortedPosts.map(
            ({ frontmatter }, index) =>
              index < 4 && (
                <Card
                  href={\`/posts/\${slugify(frontmatter)}\`}
                  post={frontmatter}
                  secHeading={false}
                />
              )
          )
        }
      </ul>
      <div class="all-posts-btn-wrapper">
        <LinkButton href="/posts">
          All Posts
          <svg xmlns="http://www.w3.org/2000/svg"
            ><path
              d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"
            ></path>
          </svg>
        </LinkButton>
      </div>
    </section> -->
  </main>${renderComponent($$result, "Footer", $$Footer, { "class": "astro-NRUBHJBN" })}` })}

`;
}, "S:/Programowanie/Covering letter page/src/pages/index.astro");

const $$file$6 = "S:/Programowanie/Covering letter page/src/pages/index.astro";
const $$url$6 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$2,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$b = createAstro("S:/Programowanie/Covering letter page/src/components/Breadcrumbs.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Breadcrumbs = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Breadcrumbs;
  const currentUrlPath = Astro2.url.pathname.replace(/\/+$/, "");
  const breadcrumbList = currentUrlPath.split("/").slice(1);
  breadcrumbList[0] === "posts" && breadcrumbList.splice(0, 2, `Posts (page ${breadcrumbList[1] || 1})`);
  return renderTemplate`${maybeRenderHead($$result)}<nav class="breadcrumb astro-EFQC7EYG" aria-label="breadcrumb">
  <ul class="astro-EFQC7EYG">
    <li class="astro-EFQC7EYG">
      <a href="/" class="astro-EFQC7EYG">Home</a>
      <span aria-hidden="true" class="astro-EFQC7EYG">&#62;</span>
    </li>
    ${breadcrumbList.map(
    (breadcrumb, index) => index + 1 === breadcrumbList.length ? renderTemplate`<li class="astro-EFQC7EYG">
            <span${addAttribute(`${index > 0 ? "lowercase" : ""} astro-EFQC7EYG`, "class")} aria-current="page">
              ${breadcrumb}
            </span>
          </li>` : renderTemplate`<li class="astro-EFQC7EYG">
            <a${addAttribute(`/${breadcrumb}`, "href")} class="astro-EFQC7EYG">${breadcrumb}</a>
            <span aria-hidden="true" class="astro-EFQC7EYG">&#62;</span>
          </li>`
  )}
  </ul>
</nav>

`;
}, "S:/Programowanie/Covering letter page/src/components/Breadcrumbs.astro");

const $$Astro$a = createAstro("S:/Programowanie/Covering letter page/src/layouts/Main.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Main = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Main;
  const { pageTitle, pageDesc } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Breadcrumbs", $$Breadcrumbs, { "class": "astro-HRF6PMSF" })}
${maybeRenderHead($$result)}<main id="main-content" class="astro-HRF6PMSF">
  <h1 class="astro-HRF6PMSF">${pageTitle}</h1>
  <p class="astro-HRF6PMSF">${pageDesc}</p>
  ${renderSlot($$result, $$slots["default"])}
</main>

`;
}, "S:/Programowanie/Covering letter page/src/layouts/Main.astro");

function Datetime({
  datetime,
  size = "sm",
  className
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: `opacity-80 flex items-center space-x-2 ${className}`,
    children: [/* @__PURE__ */ jsxs("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      className: `${size === "sm" ? "scale-90" : "scale-100"} w-6 h-6 inline-block fill-skin-base`,
      "aria-hidden": "true",
      children: [/* @__PURE__ */ jsx("path", {
        d: "M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"
      }), /* @__PURE__ */ jsx("path", {
        d: "M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"
      })]
    }), /* @__PURE__ */ jsx("span", {
      className: "sr-only",
      children: "Posted on:"
    }), /* @__PURE__ */ jsx("span", {
      className: `italic ${size === "sm" ? "text-sm" : "text-base"}`,
      children: /* @__PURE__ */ jsx(FormattedDatetime, {
        datetime
      })
    })]
  });
}
const FormattedDatetime = ({
  datetime
}) => {
  const myDatetime = new Date(datetime);
  const date = myDatetime.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const time = myDatetime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  return /* @__PURE__ */ jsxs(Fragment$1, {
    children: [date, /* @__PURE__ */ jsx("span", {
      "aria-hidden": "true",
      children: " | "
    }), /* @__PURE__ */ jsx("span", {
      className: "sr-only",
      children: "\xA0at\xA0"
    }), time]
  });
};
__astro_tag_component__(Datetime, "@astrojs/react");

const styles = {
  cardContainer: "my-6",
  titleLink: "text-skin-accent font-medium text-lg underline-offset-4 decoration-dashed focus-visible:no-underline focus-visible:underline-offset-0 inline-block",
  titleHeading: "font-medium text-lg decoration-dashed hover:underline"
};
function Card({
  href,
  post,
  secHeading = true
}) {
  return /* @__PURE__ */ jsxs("li", {
    className: styles.cardContainer,
    children: [/* @__PURE__ */ jsx("a", {
      href,
      className: styles.titleLink,
      children: secHeading ? /* @__PURE__ */ jsx("h2", {
        className: styles.titleHeading,
        children: post.title
      }) : /* @__PURE__ */ jsx("h3", {
        className: styles.titleHeading,
        children: post.title
      })
    }), /* @__PURE__ */ jsx("p", {
      children: post.description
    })]
  });
}
__astro_tag_component__(Card, "@astrojs/react");

const slugifyStr = (str) => slug(str);
const slugify = (frontmatter) => frontmatter.slug ? slug(frontmatter.slug) : slug(frontmatter.title);
const slufigyAll = (arr) => arr.map((str) => slugifyStr(str));

const $$Astro$9 = createAstro("S:/Programowanie/Covering letter page/src/layouts/Posts.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Posts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$Posts;
  const { pageNum, totalPages, posts } = Astro2.props;
  const prev = pageNum > 1 ? "" : "disabled";
  const next = pageNum < totalPages ? "" : "disabled";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Covering letters | ${SITE.title}`, "class": "astro-GCMJR756" }, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "activeNav": "covering-letters", "class": "astro-GCMJR756" })}${renderComponent($$result, "Main", $$Main, { "pageTitle": "Covering letters", "pageDesc": "All the covering letters I've writen.", "class": "astro-GCMJR756" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<ul class="astro-GCMJR756">
      ${posts.map(({ frontmatter }) => {
    return renderTemplate`${renderComponent($$result, "Card", Card, { "href": `/covering-letters/${slugify(frontmatter)}`, "post": frontmatter, "class": "astro-GCMJR756" })}`;
  })}
    </ul>` })}${totalPages > 1 && renderTemplate`<nav class="pagination-wrapper astro-GCMJR756" aria-label="Pagination">
        ${renderComponent($$result, "LinkButton", $$LinkButton, { "disabled": prev === "disabled", "href": `/covering-letters${pageNum - 1 !== 1 ? "/" + (pageNum - 1) : ""}`, "className": `mr-4 select-none ${prev} astro-GCMJR756`, "ariaLabel": "Previous" }, { "default": () => renderTemplate`<svg xmlns="http://www.w3.org/2000/svg"${addAttribute(`${prev}-svg astro-GCMJR756`, "class")}>
            <path d="M12.707 17.293 8.414 13H18v-2H8.414l4.293-4.293-1.414-1.414L4.586 12l6.707 6.707z" class="astro-GCMJR756"></path>
          </svg>
          Prev
        ` })}
        ${renderComponent($$result, "LinkButton", $$LinkButton, { "disabled": next === "disabled", "href": `/covering-letters/${pageNum + 1}`, "className": `ml-4 select-none ${next} astro-GCMJR756`, "ariaLabel": "Next" }, { "default": () => renderTemplate`
          Next
          <svg xmlns="http://www.w3.org/2000/svg"${addAttribute(`${next}-svg astro-GCMJR756`, "class")}>
            <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z" class="astro-GCMJR756"></path>
          </svg>` })}
      </nav>`}${renderComponent($$result, "Footer", $$Footer, { "noMarginTop": totalPages > 1, "class": "astro-GCMJR756" })}` })}

`;
}, "S:/Programowanie/Covering letter page/src/layouts/Posts.astro");

const getPageNumbers = (numberOfPosts) => {
  const numberOfPages = numberOfPosts / Number(SITE.postPerPage);
  let pageNumbers = [];
  for (let i = 1; i <= Math.ceil(numberOfPages); i++) {
    pageNumbers = [...pageNumbers, i];
  }
  return pageNumbers;
};

const $$Astro$8 = createAstro("S:/Programowanie/Covering letter page/src/pages/covering-letters/index.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Index$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Index$1;
  const posts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../../contents/adding-new-post.md": () => Promise.resolve().then(() => __vite_glob_0_0),"../../contents/dynatrace.md": () => Promise.resolve().then(() => __vite_glob_0_1),"../../contents/lab-control.md": () => Promise.resolve().then(() => __vite_glob_0_2),"../../contents/master-born-junior-react.md": () => Promise.resolve().then(() => __vite_glob_0_3),"../../contents/voice-lab.md": () => Promise.resolve().then(() => __vite_glob_0_4)}), () => "../../contents/**/*.md");
  const sortedPosts = getSortedPosts(posts);
  const totalPages = getPageNumbers(sortedPosts.length);
  const paginatedPosts = sortedPosts.slice(0, SITE.postPerPage);
  return renderTemplate`${renderComponent($$result, "Posts", $$Posts, { "posts": paginatedPosts, "pageNum": 1, "totalPages": totalPages.length })}`;
}, "S:/Programowanie/Covering letter page/src/pages/covering-letters/index.astro");

const $$file$5 = "S:/Programowanie/Covering letter page/src/pages/covering-letters/index.astro";
const $$url$5 = "/covering-letters";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$1,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$7 = createAstro("S:/Programowanie/Covering letter page/src/layouts/PostDetails.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$PostDetails = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$PostDetails;
  const { frontmatter, Content } = Astro2.props.post;
  const { title, author, description, ogImage, datetime, tags } = frontmatter;
  const ogUrl = new URL(ogImage ? ogImage : `${title}.svg`, Astro2.url.origin).href;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "author": author, "description": description, "ogImage": ogUrl, "class": "astro-3UMD7BBM" }, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "class": "astro-3UMD7BBM" })}${maybeRenderHead($$result)}<div class="max-w-3xl mx-auto w-full px-2 flex justify-start astro-3UMD7BBM">
    <button class="mt-8 mb-2 hover:opacity-75 flex focus-outline astro-3UMD7BBM" onclick="history.back()">
      <svg xmlns="http://www.w3.org/2000/svg" class="astro-3UMD7BBM"><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" class="astro-3UMD7BBM"></path>
      </svg><span class="astro-3UMD7BBM">Go back</span>
    </button>
  </div><main id="main-content" class="astro-3UMD7BBM">
    <h1 class="post-title astro-3UMD7BBM">${title}</h1>
    <!-- <Datetime datetime={datetime} size="lg" className="my-2" /> -->
    <article id="article" role="article" class="mx-auto max-w-3xl mt-8 prose astro-3UMD7BBM">
      ${renderComponent($$result, "Content", Content, { "class": "astro-3UMD7BBM" })}
    </article>

    <!-- <ul class="tags-container">
      {tags.map(tag => <Tag name={tag} />)}
    </ul> -->
  </main>${renderComponent($$result, "Footer", $$Footer, { "class": "astro-3UMD7BBM" })}` })}

`;
}, "S:/Programowanie/Covering letter page/src/layouts/PostDetails.astro");

const $$Astro$6 = createAstro("S:/Programowanie/Covering letter page/src/pages/covering-letters/[slug].astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const Astro$1 = $$Astro$6;
async function getStaticPaths$2() {
  const posts = await Astro$1.glob(/* #__PURE__ */ Object.assign({"../../contents/adding-new-post.md": () => Promise.resolve().then(() => __vite_glob_0_0),"../../contents/dynatrace.md": () => Promise.resolve().then(() => __vite_glob_0_1),"../../contents/lab-control.md": () => Promise.resolve().then(() => __vite_glob_0_2),"../../contents/master-born-junior-react.md": () => Promise.resolve().then(() => __vite_glob_0_3),"../../contents/voice-lab.md": () => Promise.resolve().then(() => __vite_glob_0_4)}), () => "../../contents/**/*.md");
  const filteredPosts = posts.filter(({ frontmatter }) => !frontmatter.draft);
  let postResult = filteredPosts.map((post) => {
    return {
      params: {
        slug: slugify(post.frontmatter)
      },
      props: {
        post
      }
    };
  });
  const pagePaths = getPageNumbers(filteredPosts.length).map(
    (pageNum) => ({
      params: { slug: String(pageNum) }
    })
  );
  return [...postResult, ...pagePaths];
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const { post } = Astro2.props;
  const posts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../../contents/adding-new-post.md": () => Promise.resolve().then(() => __vite_glob_0_0),"../../contents/dynatrace.md": () => Promise.resolve().then(() => __vite_glob_0_1),"../../contents/lab-control.md": () => Promise.resolve().then(() => __vite_glob_0_2),"../../contents/master-born-junior-react.md": () => Promise.resolve().then(() => __vite_glob_0_3),"../../contents/voice-lab.md": () => Promise.resolve().then(() => __vite_glob_0_4)}), () => "../../contents/**/*.md");
  const sortedPosts = getSortedPosts(posts);
  const totalPages = getPageNumbers(sortedPosts.length);
  const currentPage = slug && !isNaN(Number(slug)) && totalPages.includes(Number(slug)) ? Number(slug) : 0;
  const lastPost = currentPage * SITE.postPerPage;
  const startPost = lastPost - SITE.postPerPage;
  const paginatedPosts = sortedPosts.slice(startPost, lastPost);
  return renderTemplate`${post ? renderTemplate`${renderComponent($$result, "PostDetails", $$PostDetails, { "post": post })}` : renderTemplate`${renderComponent($$result, "Posts", $$Posts, { "posts": paginatedPosts, "pageNum": currentPage, "totalPages": totalPages.length })}`}
`;
}, "S:/Programowanie/Covering letter page/src/pages/covering-letters/[slug].astro");

const $$file$4 = "S:/Programowanie/Covering letter page/src/pages/covering-letters/[slug].astro";
const $$url$4 = "/covering-letters/[slug]";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getStaticPaths: getStaticPaths$2,
	default: $$slug,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const html$5 = "<p>Here are some rules/recommendations, tips &#x26; ticks for creating new posts in AstroPaper blog theme.</p>\n<h2 id=\"table-of-contents\">Table of contents</h2>\n<p></p><details><summary>Open Table of contents</summary><p></p>\n<ul>\n<li>\n<p><a href=\"#frontmatter\">Frontmatter</a></p>\n</li>\n<li>\n<p><a href=\"#adding-table-of-contents\">Adding table of contents</a></p>\n</li>\n<li>\n<p><a href=\"#headings\">Headings</a></p>\n</li>\n<li>\n<p><a href=\"#bonus\">Bonus</a></p>\n<ul>\n<li><a href=\"#image-compression\">Image compression</a></li>\n<li><a href=\"#og-image\">OG Image</a></li>\n</ul>\n</li>\n</ul>\n<p></p></details><p></p>\n<h2 id=\"frontmatter\">Frontmatter</h2>\n<p>Frontmatter is the main place to store some important information about the post (article). Frontmatter lies at the top of the article and is written in YAML format. Read more about frontmatter and its usage in <a href=\"https://docs.astro.build/en/guides/markdown-content/\">astro documentation</a>.</p>\n<p>Here is the list of frontmatter property for each post.</p>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<table><thead><tr><th>Property</th><th>Description</th><th>Remark</th></tr></thead><tbody><tr><td><strong><em>title</em></strong></td><td>Title of the post. (h1)</td><td>required<sup>*</sup></td></tr><tr><td><strong><em>description</em></strong></td><td>Description of the post. Used in post excerpt and site description of the post.</td><td>default = SITE.desc</td></tr><tr><td><strong><em>author</em></strong></td><td>Author of the post.</td><td>default = SITE.author</td></tr><tr><td><strong><em>datetime</em></strong></td><td>Published datetime in ISO 8601 format.</td><td></td></tr><tr><td><strong><em>slug</em></strong></td><td>Slug for the post. Usually the all lowercase title seperated in <code>-</code> instead of whtiespace</td><td>default = slugified title</td></tr><tr><td><strong><em>featured</em></strong></td><td>Whether or not display this post in featured section of home page</td><td>default = false</td></tr><tr><td><strong><em>draft</em></strong></td><td>Mark this post ‘unpublished’.</td><td>default = false</td></tr><tr><td><strong><em>tags</em></strong></td><td>Related keywords for this post. Written in array yaml format.</td><td></td></tr><tr><td><strong><em>ogImage</em></strong></td><td>OG image of the post. Useful for social media sharing and SEO.</td><td>default = SITE.ogImage</td></tr></tbody></table>\n<p><code>title</code> and <code>slug</code> fields in frontmatter must be specified.</p>\n<p>Title is the title of the post and it is very important for search engine optimization (SEO).</p>\n<p><code>slug</code> is the unique identifier of the url. Thus, <code>slug</code> must be unique and different from other posts. The whitespace of <code>slug</code> needs to be separated with <code>-</code> or <code>_</code> but <code>-</code> is recommended. If slug is not specified, the slugified title of the post will be used as slug.</p>\n<p>Here is the sample frontmatter for the post.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #282c34; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;\"><code><span class=\"line\"><span style=\"color: #7F848E\"># src/contents/sample-post.md</span></span>\n<span class=\"line\"><span style=\"color: #ABB2BF\">---</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">title</span><span style=\"color: #ABB2BF\">: </span><span style=\"color: #98C379\">The title of the post</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">author</span><span style=\"color: #ABB2BF\">: </span><span style=\"color: #98C379\">your name</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">datetime</span><span style=\"color: #ABB2BF\">: </span><span style=\"color: #D19A66\">2022-09-21T05:17:19Z</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">slug</span><span style=\"color: #ABB2BF\">: </span><span style=\"color: #98C379\">the-title-of-the-post</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">featured</span><span style=\"color: #ABB2BF\">: </span><span style=\"color: #D19A66\">true</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">draft</span><span style=\"color: #ABB2BF\">: </span><span style=\"color: #D19A66\">false</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">tags</span><span style=\"color: #ABB2BF\">:</span></span>\n<span class=\"line\"><span style=\"color: #ABB2BF\">  - </span><span style=\"color: #98C379\">some</span></span>\n<span class=\"line\"><span style=\"color: #ABB2BF\">  - </span><span style=\"color: #98C379\">example</span></span>\n<span class=\"line\"><span style=\"color: #ABB2BF\">  - </span><span style=\"color: #98C379\">tags</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">ogImage</span><span style=\"color: #ABB2BF\">: </span><span style=\"color: #98C379\">\"\"</span></span>\n<span class=\"line\"><span style=\"color: #E06C75\">description</span><span style=\"color: #ABB2BF\">: </span><span style=\"color: #98C379\">This is the example description of the example post.</span></span>\n<span class=\"line\"><span style=\"color: #ABB2BF\">---</span></span></code></pre>\n<h2 id=\"adding-table-of-contents\">Adding table of contents</h2>\n<p>By default, a post (article) does not include any table of contents (toc). To include toc, you have to specify it in a specific way.</p>\n<p>Write <code>Table of contents</code> in h2 format (## in markdown) and place it where you want it to be appeared on the post.</p>\n<p>For instance, if you want to place your table of contents just under the intro paragraph (like I usually do), you can do that in the following way.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #282c34; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;\"><code><span class=\"line\"><span style=\"color: #ABB2BF\">---</span></span>\n<span class=\"line\"><span style=\"color: #7F848E\"># some frontmatter</span></span>\n<span class=\"line\"><span style=\"color: #ABB2BF\">---</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #ABB2BF\">Here are some recommendations, tips &#x26; ticks for creating new posts in AstroPaper blog theme.</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #E06C75\">## Table of contents</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #7F848E\">&#x3C;!-- the rest of the post --></span></span></code></pre>\n<h2 id=\"headings\">Headings</h2>\n<p>There’s one thing to note about headings. The AstroPaper blog posts use title (title in the frontmatter) as the main heading of the post. Therefore, the rest of the heading in the post should be using h2 ~ h6.</p>\n<p>This rule is not mandatory, but highly recommended for visual, accessibility and SEO purposes.</p>\n<h2 id=\"bonus\">Bonus</h2>\n<h3 id=\"image-compression\">Image compression</h3>\n<p>When you put images in the blog post, it is recommended that the image is compressed. This will affect the overall performance of the website.</p>\n<p>My recommendation for image compression sites.</p>\n<ul>\n<li><a href=\"https://tinypng.com/\">TinyPng</a></li>\n<li><a href=\"https://tinyjpg.com/\">TinyJPG</a></li>\n</ul>\n<h3 id=\"og-image\">OG Image</h3>\n<p>The default OG image will be placed if a post does not specify the OG image. Though not required, OG image related to the post should be specify in the frontmatter. The recommended size for OG image is <strong><em>1200 X 640</em></strong> px.</p>";

				const _internal$5 = {
					injectedFrontmatter: {},
				};
				const frontmatter$5 = {"author":"Sat Naing","datetime":"2022-09-23T15:22:00.000Z","title":"Adding new posts in AstroPaper theme","slug":"adding-new-posts-in-astropaper-theme","featured":true,"draft":true,"tags":["docs"],"ogImage":"","description":"Some rules & recommendations for creating or adding new posts using AstroPaper theme."};
				const file$5 = "S:/Programowanie/Covering letter page/src/contents/adding-new-post.md";
				const url$5 = undefined;
				function rawContent$5() {
					return "\nHere are some rules/recommendations, tips & ticks for creating new posts in AstroPaper blog theme.\n\n## Table of contents\n\n## Frontmatter\n\nFrontmatter is the main place to store some important information about the post (article). Frontmatter lies at the top of the article and is written in YAML format. Read more about frontmatter and its usage in [astro documentation](https://docs.astro.build/en/guides/markdown-content/).\n\nHere is the list of frontmatter property for each post.\n\n| Property          | Description                                                                               | Remark                    |\n| ----------------- | ----------------------------------------------------------------------------------------- | ------------------------- |\n| **_title_**       | Title of the post. (h1)                                                                   | required<sup>\\*</sup>     |\n| **_description_** | Description of the post. Used in post excerpt and site description of the post.           | default = SITE.desc       |\n| **_author_**      | Author of the post.                                                                       | default = SITE.author     |\n| **_datetime_**    | Published datetime in ISO 8601 format.                                                    |                           |\n| **_slug_**        | Slug for the post. Usually the all lowercase title seperated in `-` instead of whtiespace | default = slugified title |\n| **_featured_**    | Whether or not display this post in featured section of home page                         | default = false           |\n| **_draft_**       | Mark this post 'unpublished'.                                                             | default = false           |\n| **_tags_**        | Related keywords for this post. Written in array yaml format.                             |                           |\n| **_ogImage_**     | OG image of the post. Useful for social media sharing and SEO.                            | default = SITE.ogImage    |\n\n`title` and `slug` fields in frontmatter must be specified.\n\nTitle is the title of the post and it is very important for search engine optimization (SEO).\n\n`slug` is the unique identifier of the url. Thus, `slug` must be unique and different from other posts. The whitespace of `slug` needs to be separated with `-` or `_` but `-` is recommended. If slug is not specified, the slugified title of the post will be used as slug.\n\nHere is the sample frontmatter for the post.\n\n```yaml\n# src/contents/sample-post.md\n---\ntitle: The title of the post\nauthor: your name\ndatetime: 2022-09-21T05:17:19Z\nslug: the-title-of-the-post\nfeatured: true\ndraft: false\ntags:\n  - some\n  - example\n  - tags\nogImage: \"\"\ndescription: This is the example description of the example post.\n---\n```\n\n## Adding table of contents\n\nBy default, a post (article) does not include any table of contents (toc). To include toc, you have to specify it in a specific way.\n\nWrite `Table of contents` in h2 format (## in markdown) and place it where you want it to be appeared on the post.\n\nFor instance, if you want to place your table of contents just under the intro paragraph (like I usually do), you can do that in the following way.\n\n```md\n---\n# some frontmatter\n---\n\nHere are some recommendations, tips & ticks for creating new posts in AstroPaper blog theme.\n\n## Table of contents\n\n<!-- the rest of the post -->\n```\n\n## Headings\n\nThere's one thing to note about headings. The AstroPaper blog posts use title (title in the frontmatter) as the main heading of the post. Therefore, the rest of the heading in the post should be using h2 \\~ h6.\n\nThis rule is not mandatory, but highly recommended for visual, accessibility and SEO purposes.\n\n## Bonus\n\n### Image compression\n\nWhen you put images in the blog post, it is recommended that the image is compressed. This will affect the overall performance of the website.\n\nMy recommendation for image compression sites.\n\n- [TinyPng](https://tinypng.com/)\n- [TinyJPG](https://tinyjpg.com/)\n\n### OG Image\n\nThe default OG image will be placed if a post does not specify the OG image. Though not required, OG image related to the post should be specify in the frontmatter. The recommended size for OG image is **_1200 X 640_** px.\n";
				}
				function compiledContent$5() {
					return html$5;
				}
				function getHeadings$5() {
					return [{"depth":2,"slug":"table-of-contents","text":"Table of contents"},{"depth":2,"slug":"frontmatter","text":"Frontmatter"},{"depth":2,"slug":"adding-table-of-contents","text":"Adding table of contents"},{"depth":2,"slug":"headings","text":"Headings"},{"depth":2,"slug":"bonus","text":"Bonus"},{"depth":3,"slug":"image-compression","text":"Image compression"},{"depth":3,"slug":"og-image","text":"OG Image"}];
				}
				function getHeaders$5() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$5();
				}				async function Content$5() {
					const { layout, ...content } = frontmatter$5;
					content.file = file$5;
					content.url = url$5;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$5 });
					return contentFragment;
				}
				Content$5[Symbol.for('astro.needsHeadRendering')] = true;

const __vite_glob_0_0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	_internal: _internal$5,
	frontmatter: frontmatter$5,
	file: file$5,
	url: url$5,
	rawContent: rawContent$5,
	compiledContent: compiledContent$5,
	getHeadings: getHeadings$5,
	getHeaders: getHeaders$5,
	Content: Content$5,
	default: Content$5
}, Symbol.toStringTag, { value: 'Module' }));

const html$4 = "<p>I am writing to express my interest in the junior frontend developer position at Dynatrace. As a passionate and driven web developer with a strong foundation in HTML, CSS, JavaScript, and React, I believe I would be a valuable asset to your team.</p>\n<p>I am currently studying at XYZ Higher Banking School, where I have gained a solid foundation in computer science and web development. In my coursework, I have had the opportunity to work on various projects that have allowed me to hone my skills in these areas. I am excited to continue learning and growing as a developer, and I believe that Dynatrace’s focus on innovation and growth provides the perfect environment for me to do so.</p>\n<p>In addition to my studies, I am currently working full-time at Gr8Soft, where I have had the opportunity to gain practical experience in web development. Over the past year, I have had the opportunity to work on a variety of projects, including the development of customer-facing websites and the implementation of responsive design. These experiences have allowed me to improve my skills and gain a deeper understanding of the web development process, including the use of React to build interactive and efficient user interfaces.</p>\n<p>I am confident that my technical skills and passion for web development make me a strong candidate for this position. I am excited about the opportunity to join Dynatrace and contribute to the development of innovative and engaging web experiences.</p>\n<p>Sincerely, <br>\nJakub Hajduk</p>";

				const _internal$4 = {
					injectedFrontmatter: {},
				};
				const frontmatter$4 = {"author":"Jakub Hajduk","datetime":"2022-09-23T15:22:00.000Z","title":"Dynatrace junior React","slug":"dynatrace-junior-react","featured":true,"draft":false,"tags":null,"ogImage":"","description":"Covering letter for Dynatrace (probably junior frontend dev)"};
				const file$4 = "S:/Programowanie/Covering letter page/src/contents/dynatrace.md";
				const url$4 = undefined;
				function rawContent$4() {
					return "\nI am writing to express my interest in the junior frontend developer position at Dynatrace. As a passionate and driven web developer with a strong foundation in HTML, CSS, JavaScript, and React, I believe I would be a valuable asset to your team.\n\nI am currently studying at XYZ Higher Banking School, where I have gained a solid foundation in computer science and web development. In my coursework, I have had the opportunity to work on various projects that have allowed me to hone my skills in these areas. I am excited to continue learning and growing as a developer, and I believe that Dynatrace's focus on innovation and growth provides the perfect environment for me to do so.\n\nIn addition to my studies, I am currently working full-time at Gr8Soft, where I have had the opportunity to gain practical experience in web development. Over the past year, I have had the opportunity to work on a variety of projects, including the development of customer-facing websites and the implementation of responsive design. These experiences have allowed me to improve my skills and gain a deeper understanding of the web development process, including the use of React to build interactive and efficient user interfaces.\n\nI am confident that my technical skills and passion for web development make me a strong candidate for this position. I am excited about the opportunity to join Dynatrace and contribute to the development of innovative and engaging web experiences.\n\nSincerely, <br>\nJakub Hajduk\n";
				}
				function compiledContent$4() {
					return html$4;
				}
				function getHeadings$4() {
					return [];
				}
				function getHeaders$4() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$4();
				}				async function Content$4() {
					const { layout, ...content } = frontmatter$4;
					content.file = file$4;
					content.url = url$4;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$4 });
					return contentFragment;
				}
				Content$4[Symbol.for('astro.needsHeadRendering')] = true;

const __vite_glob_0_1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	_internal: _internal$4,
	frontmatter: frontmatter$4,
	file: file$4,
	url: url$4,
	rawContent: rawContent$4,
	compiledContent: compiledContent$4,
	getHeadings: getHeadings$4,
	getHeaders: getHeaders$4,
	Content: Content$4,
	default: Content$4
}, Symbol.toStringTag, { value: 'Module' }));

const html$3 = "<p>Dear Hiring Manager,</p>\n<p>As a junior frontend developer with a strong foundation in HTML, CSS, JavaScript, and React, I am excited to apply for the open position at LabControl. I am confident that my technical skills and passion for web development make me a strong fit for your team.</p>\n<p>I am currently studying at Wyższa Szkoła Bankowa in Gdańsk, where I have gained a solid foundation in computer science and web development. In my coursework, I have had the opportunity to work on various projects that have allowed me to hone my skills in these areas. I am eager to continue learning and growing as a developer, and I believe LabControl’s focus on innovation and collaboration provides the perfect environment for me to do so.</p>\n<p>In addition to my studies, I am currently working full-time at Gr8Soft, where I have had the opportunity to gain practical experience in web development. I have worked on a variety of projects, including the development of customer-facing websites and the implementation of responsive design. These experiences have allowed me to improve my skills and gain a deeper understanding of the web development process.</p>\n<p>I am excited about the opportunity to join LabControl and contribute to the development of innovative web experiences. Thank you for considering my application.</p>\n<p>Sincerely, <br>\nJakub Hajduk</p>";

				const _internal$3 = {
					injectedFrontmatter: {},
				};
				const frontmatter$3 = {"author":"Jakub Hajduk","datetime":"2022-09-23T15:22:00.000Z","title":"LabControl junior React","slug":"lab-control-junior-react","featured":true,"draft":false,"tags":null,"ogImage":"","description":"Covering letter for LabControl Junior Frontend Developer position"};
				const file$3 = "S:/Programowanie/Covering letter page/src/contents/lab-control.md";
				const url$3 = undefined;
				function rawContent$3() {
					return "\nDear Hiring Manager,\n\nAs a junior frontend developer with a strong foundation in HTML, CSS, JavaScript, and React, I am excited to apply for the open position at LabControl. I am confident that my technical skills and passion for web development make me a strong fit for your team.\n\nI am currently studying at Wyższa Szkoła Bankowa in Gdańsk, where I have gained a solid foundation in computer science and web development. In my coursework, I have had the opportunity to work on various projects that have allowed me to hone my skills in these areas. I am eager to continue learning and growing as a developer, and I believe LabControl's focus on innovation and collaboration provides the perfect environment for me to do so.\n\nIn addition to my studies, I am currently working full-time at Gr8Soft, where I have had the opportunity to gain practical experience in web development. I have worked on a variety of projects, including the development of customer-facing websites and the implementation of responsive design. These experiences have allowed me to improve my skills and gain a deeper understanding of the web development process.\n\nI am excited about the opportunity to join LabControl and contribute to the development of innovative web experiences. Thank you for considering my application.\n\nSincerely, <br>\nJakub Hajduk\n";
				}
				function compiledContent$3() {
					return html$3;
				}
				function getHeadings$3() {
					return [];
				}
				function getHeaders$3() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$3();
				}				async function Content$3() {
					const { layout, ...content } = frontmatter$3;
					content.file = file$3;
					content.url = url$3;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$3 });
					return contentFragment;
				}
				Content$3[Symbol.for('astro.needsHeadRendering')] = true;

const __vite_glob_0_2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	_internal: _internal$3,
	frontmatter: frontmatter$3,
	file: file$3,
	url: url$3,
	rawContent: rawContent$3,
	compiledContent: compiledContent$3,
	getHeadings: getHeadings$3,
	getHeaders: getHeaders$3,
	Content: Content$3,
	default: Content$3
}, Symbol.toStringTag, { value: 'Module' }));

const html$2 = "<p>Dear Hiring Manager,</p>\n<p>I am writing to express my interest in the junior frontend developer position at Masterborn. With a strong foundation in HTML, CSS, JavaScript, and React, as well as a passion for creating intuitive and visually appealing user experiences, I believe I would be a valuable asset to your team.</p>\n<p>I am currently studying at XYZ Higher Banking School, where I have gained a solid foundation in computer science and web development. In my coursework, I have had the opportunity to work on various projects that have allowed me to hone my skills in these areas. I am excited to continue learning and growing as a developer, and I believe that Masterborn’s focus on innovation and growth provides the perfect environment for me to do so.</p>\n<p>In addition to my studies, I have also gained practical experience in web development through my full-time position at Gr8Soft. Over the past year, I have had the opportunity to work on a variety of projects, including the development of customer-facing websites and the implementation of responsive design. These experiences have allowed me to improve my skills and gain a deeper understanding of the web development process, including the use of React to build interactive and efficient user interfaces.</p>\n<p>I am confident that my technical skills and passion for web development make me a strong candidate for this position. Thank you for considering my application. I look forward to the opportunity to join the Masterborn team and contribute to the development of innovative and engaging web experiences.</p>\n<p>Sincerely, <br>\nJakub Hajduk</p>";

				const _internal$2 = {
					injectedFrontmatter: {},
				};
				const frontmatter$2 = {"author":"Jakub Hajduk","datetime":"2022-09-23T15:22:00.000Z","title":"MasterBorn junior React","slug":"master-born-junior-react","featured":true,"draft":false,"tags":null,"ogImage":"","description":"Covering letter for MasterBorn Junior Frontend Developer (React.js)"};
				const file$2 = "S:/Programowanie/Covering letter page/src/contents/master-born-junior-react.md";
				const url$2 = undefined;
				function rawContent$2() {
					return "\nDear Hiring Manager,\n\nI am writing to express my interest in the junior frontend developer position at Masterborn. With a strong foundation in HTML, CSS, JavaScript, and React, as well as a passion for creating intuitive and visually appealing user experiences, I believe I would be a valuable asset to your team.\n\nI am currently studying at XYZ Higher Banking School, where I have gained a solid foundation in computer science and web development. In my coursework, I have had the opportunity to work on various projects that have allowed me to hone my skills in these areas. I am excited to continue learning and growing as a developer, and I believe that Masterborn's focus on innovation and growth provides the perfect environment for me to do so.\n\nIn addition to my studies, I have also gained practical experience in web development through my full-time position at Gr8Soft. Over the past year, I have had the opportunity to work on a variety of projects, including the development of customer-facing websites and the implementation of responsive design. These experiences have allowed me to improve my skills and gain a deeper understanding of the web development process, including the use of React to build interactive and efficient user interfaces.\n\nI am confident that my technical skills and passion for web development make me a strong candidate for this position. Thank you for considering my application. I look forward to the opportunity to join the Masterborn team and contribute to the development of innovative and engaging web experiences.\n\nSincerely, <br>\nJakub Hajduk\n";
				}
				function compiledContent$2() {
					return html$2;
				}
				function getHeadings$2() {
					return [];
				}
				function getHeaders$2() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$2();
				}				async function Content$2() {
					const { layout, ...content } = frontmatter$2;
					content.file = file$2;
					content.url = url$2;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$2 });
					return contentFragment;
				}
				Content$2[Symbol.for('astro.needsHeadRendering')] = true;

const __vite_glob_0_3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	_internal: _internal$2,
	frontmatter: frontmatter$2,
	file: file$2,
	url: url$2,
	rawContent: rawContent$2,
	compiledContent: compiledContent$2,
	getHeadings: getHeadings$2,
	getHeaders: getHeaders$2,
	Content: Content$2,
	default: Content$2
}, Symbol.toStringTag, { value: 'Module' }));

const html$1 = "<p>Dear Hiring Manager,</p>\n<p>I am writing to express my interest in the junior frontend developer position at VoiceLab. As a current student with a passion for web development, I am excited to bring my skills and enthusiasm to your team.</p>\n<p>Throughout my studies and internships, I have developed a strong foundation in HTML, CSS, JavaScript, and React. I have a keen eye for design and a dedication to creating intuitive user experiences. In my previous internship at ABC Company, I worked on the development of a customer-facing e-commerce website, where I was responsible for implementing responsive design and optimizing the site for all devices. I also worked closely with the design team to implement the visual elements of the site, which allowed me to improve my skills in both design and development.</p>\n<p>In addition to my studies, I am currently working full-time at Gr8Soft, where I have had the opportunity to gain practical experience in web development. I am confident that my technical skills and passion for web development make me a strong candidate for this position. I am excited about the opportunity to join VoiceLab and contribute to the development of innovative and engaging web experiences. Thank you for considering my application.</p>\n<p>Sincerely, <br>\nJakub Hajduk</p>";

				const _internal$1 = {
					injectedFrontmatter: {},
				};
				const frontmatter$1 = {"author":"Jakub Hajduk","datetime":"2022-09-23T15:22:00.000Z","title":"VoiceLab junior React","slug":"voice-lab-junior-react","featured":true,"draft":false,"tags":null,"ogImage":"","description":"Covering letter for VoiceLab Junior Frontend Developer"};
				const file$1 = "S:/Programowanie/Covering letter page/src/contents/voice-lab.md";
				const url$1 = undefined;
				function rawContent$1() {
					return "\nDear Hiring Manager,\n\nI am writing to express my interest in the junior frontend developer position at VoiceLab. As a current student with a passion for web development, I am excited to bring my skills and enthusiasm to your team.\n\nThroughout my studies and internships, I have developed a strong foundation in HTML, CSS, JavaScript, and React. I have a keen eye for design and a dedication to creating intuitive user experiences. In my previous internship at ABC Company, I worked on the development of a customer-facing e-commerce website, where I was responsible for implementing responsive design and optimizing the site for all devices. I also worked closely with the design team to implement the visual elements of the site, which allowed me to improve my skills in both design and development.\n\nIn addition to my studies, I am currently working full-time at Gr8Soft, where I have had the opportunity to gain practical experience in web development. I am confident that my technical skills and passion for web development make me a strong candidate for this position. I am excited about the opportunity to join VoiceLab and contribute to the development of innovative and engaging web experiences. Thank you for considering my application.\n\nSincerely, <br>\nJakub Hajduk\n";
				}
				function compiledContent$1() {
					return html$1;
				}
				function getHeadings$1() {
					return [];
				}
				function getHeaders$1() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$1();
				}				async function Content$1() {
					const { layout, ...content } = frontmatter$1;
					content.file = file$1;
					content.url = url$1;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$1 });
					return contentFragment;
				}
				Content$1[Symbol.for('astro.needsHeadRendering')] = true;

const __vite_glob_0_4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	_internal: _internal$1,
	frontmatter: frontmatter$1,
	file: file$1,
	url: url$1,
	rawContent: rawContent$1,
	compiledContent: compiledContent$1,
	getHeadings: getHeadings$1,
	getHeaders: getHeaders$1,
	Content: Content$1,
	default: Content$1
}, Symbol.toStringTag, { value: 'Module' }));

const postImportResult$1 = /* #__PURE__ */ Object.assign({"../contents/adding-new-post.md": __vite_glob_0_0,"../contents/dynatrace.md": __vite_glob_0_1,"../contents/lab-control.md": __vite_glob_0_2,"../contents/master-born-junior-react.md": __vite_glob_0_3,"../contents/voice-lab.md": __vite_glob_0_4




});
const posts$1 = Object.values(postImportResult$1);
const get$1 = () => rss({
  title: SITE.title,
  description: SITE.desc,
  site: SITE.website,
  items: posts$1.filter(({ frontmatter }) => !frontmatter.draft).map(({ frontmatter }) => ({
    link: `posts/${slugify(frontmatter)}`,
    title: frontmatter.title,
    description: frontmatter.description,
    pubDate: new Date(frontmatter.datetime)
  }))
});

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	get: get$1
}, Symbol.toStringTag, { value: 'Module' }));

function SearchBar({
  searchList
}) {
  const inputRef = useRef(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const handleChange = (e) => {
    setInputVal(e.currentTarget.value);
  };
  const fuse = new Fuse(searchList, {
    keys: ["title", "description", "headings"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.5
  });
  useEffect(() => {
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr)
      setInputVal(searchStr);
    setTimeout(function() {
      inputRef.current.selectionStart = inputRef.current.selectionEnd = searchStr?.length || 0;
    }, 50);
  }, []);
  useEffect(() => {
    let inputResult = inputVal.length > 1 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);
    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery = window.location.pathname + "?" + searchParams.toString();
      history.pushState(null, "", newRelativePathQuery);
    } else {
      history.pushState(null, "", window.location.pathname);
    }
  }, [inputVal]);
  return /* @__PURE__ */ jsxs(Fragment$1, {
    children: [/* @__PURE__ */ jsxs("label", {
      className: "relative block",
      children: [/* @__PURE__ */ jsx("span", {
        className: "absolute inset-y-0 left-0 flex items-center pl-2 opacity-75",
        children: /* @__PURE__ */ jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsx("path", {
            d: "M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"
          })
        })
      }), /* @__PURE__ */ jsx("input", {
        className: "placeholder:italic placeholder:text-opacity-75 py-3 pl-10 pr-3 \r\n        block bg-skin-fill w-full rounded\r\n        border border-skin-fill border-opacity-40 \r\n        focus:outline-none focus:border-skin-accent",
        placeholder: "Search for anything...",
        type: "text",
        name: "search",
        defaultValue: inputVal,
        onChange: handleChange,
        autoComplete: "off",
        autoFocus: true,
        ref: inputRef
      })]
    }), inputVal.length > 1 && /* @__PURE__ */ jsxs("div", {
      className: "mt-8",
      children: ["Found ", searchResults?.length, searchResults?.length && searchResults?.length === 1 ? " result" : " results", " ", "for '", inputVal, "'"]
    }), /* @__PURE__ */ jsx("ul", {
      children: searchResults && searchResults.map(({
        item,
        refIndex
      }) => /* @__PURE__ */ jsx(Card, {
        post: item.frontmatter,
        href: `/posts/${slugify(item.frontmatter)}`
      }, `${refIndex}-${slugify(item.frontmatter)}`))
    })]
  });
}
__astro_tag_component__(SearchBar, "@astrojs/react");

const $$Astro$5 = createAstro("S:/Programowanie/Covering letter page/src/pages/search.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Search = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Search;
  const posts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../contents/adding-new-post.md": () => Promise.resolve().then(() => __vite_glob_0_0),"../contents/dynatrace.md": () => Promise.resolve().then(() => __vite_glob_0_1),"../contents/lab-control.md": () => Promise.resolve().then(() => __vite_glob_0_2),"../contents/master-born-junior-react.md": () => Promise.resolve().then(() => __vite_glob_0_3),"../contents/voice-lab.md": () => Promise.resolve().then(() => __vite_glob_0_4)}), () => "../contents/**/*.md");
  const searchList = posts.filter(({ frontmatter }) => !frontmatter.draft).map((post) => ({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    headings: post.getHeadings().map((h) => h.text),
    frontmatter: post.frontmatter
  }));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Search | ${SITE.title}` }, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "activeNav": "search" })}${renderComponent($$result, "Main", $$Main, { "pageTitle": "Search", "pageDesc": "Search any article ..." }, { "default": () => renderTemplate`${renderComponent($$result, "Search", SearchBar, { "client:load": true, "searchList": searchList, "client:component-hydration": "load", "client:component-path": "@components/Search", "client:component-export": "default" })}` })}${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "S:/Programowanie/Covering letter page/src/pages/search.astro");

const $$file$3 = "S:/Programowanie/Covering letter page/src/pages/search.astro";
const $$url$3 = "/search";

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Search,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$4 = createAstro("S:/Programowanie/Covering letter page/src/layouts/AboutLayout.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$AboutLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$AboutLayout;
  const { frontmatter } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${frontmatter.title} | ${SITE.title}` }, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "activeNav": "about" })}${renderComponent($$result, "Breadcrumbs", $$Breadcrumbs, {})}${maybeRenderHead($$result)}<main id="main-content">
    <section id="about" class="mb-28 prose max-w-3xl prose-img:border-0">
      <h1 class="text-2xl sm:text-3xl tracking-wider">${frontmatter.title}</h1>
      ${renderSlot($$result, $$slots["default"])}
    </section>
  </main>${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "S:/Programowanie/Covering letter page/src/layouts/AboutLayout.astro");

const html = "<p>AstroPaper is a minimal, responsive and SEO-friendly Astro blog theme. I designed and crafted this based on <a href=\"https://satnaing.dev/blog\">my personal blog</a>.</p>\n<p>This theme is aimed to be accessible out of the box. Light and dark mode are supported by\r\ndefault and additional color schemes can also be configured.</p>\n<p>This theme is self-documented _ which means articles/posts in this theme can also be considered as documentations. So, see the documentation for more info.</p>\n<div>\n  <img src=\"/assets/dev.svg\" class=\"sm:w-1/2 mx-auto\" alt=\"coding dev illustration\">\n</div>\n<h2 id=\"tech-stack\">Tech Stack</h2>\n<p>This theme is written in vanilla JavaScript (+ TypeScript for type checking) and a little bit of ReactJS for some interactions. TailwindCSS is used for styling; and Markdown is used for blog contents.</p>\n<h2 id=\"features\">Features</h2>\n<p>Here are certain features of this site.</p>\n<ul>\n<li>fully responsive and accessible</li>\n<li>SEO-friendly</li>\n<li>light &#x26; dark mode</li>\n<li>fuzzy search</li>\n<li>super fast performance</li>\n<li>draft posts</li>\n<li>pagination</li>\n<li>sitemap &#x26; rss feed</li>\n<li>highly customizable</li>\n</ul>\n<p>If you like this theme, you can star/contribute to the <a href=\"https://github.com/satnaing/astro-paper\">repo</a>.<br>\nOr you can even give any feedback via my <a href=\"mailto:contact@satnaing.dev\">email</a>.</p>";

				const _internal = {
					injectedFrontmatter: {},
				};
				const frontmatter = {"layout":"../layouts/AboutLayout.astro","title":"About"};
				const file = "S:/Programowanie/Covering letter page/src/pages/about.md";
				const url = "/about";
				function rawContent() {
					return "\r\nAstroPaper is a minimal, responsive and SEO-friendly Astro blog theme. I designed and crafted this based on [my personal blog](https://satnaing.dev/blog).\r\n\r\nThis theme is aimed to be accessible out of the box. Light and dark mode are supported by\r\ndefault and additional color schemes can also be configured.\r\n\r\nThis theme is self-documented \\_ which means articles/posts in this theme can also be considered as documentations. So, see the documentation for more info.\r\n\r\n<div>\r\n  <img src=\"/assets/dev.svg\" class=\"sm:w-1/2 mx-auto\" alt=\"coding dev illustration\">\r\n</div>\r\n\r\n## Tech Stack\r\n\r\nThis theme is written in vanilla JavaScript (+ TypeScript for type checking) and a little bit of ReactJS for some interactions. TailwindCSS is used for styling; and Markdown is used for blog contents.\r\n\r\n## Features\r\n\r\nHere are certain features of this site.\r\n\r\n- fully responsive and accessible\r\n- SEO-friendly\r\n- light & dark mode\r\n- fuzzy search\r\n- super fast performance\r\n- draft posts\r\n- pagination\r\n- sitemap & rss feed\r\n- highly customizable\r\n\r\nIf you like this theme, you can star/contribute to the [repo](https://github.com/satnaing/astro-paper).  \r\nOr you can even give any feedback via my [email](mailto:contact@satnaing.dev).\r\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":2,"slug":"tech-stack","text":"Tech Stack"},{"depth":2,"slug":"features","text":"Features"}];
				}
				function getHeaders() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings();
				}				async function Content() {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html });
					return createVNode($$AboutLayout, {
									file,
									url,
									content,
									frontmatter: content,
									headings: getHeadings(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}
				Content[Symbol.for('astro.needsHeadRendering')] = false;

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	_internal,
	frontmatter,
	file,
	url,
	rawContent,
	compiledContent,
	getHeadings,
	getHeaders,
	Content,
	default: Content
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$3 = createAstro("S:/Programowanie/Covering letter page/src/components/Tag.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Tag = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Tag;
  const { name, size = "sm" } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<li${addAttribute(`inline-block ${size === "sm" ? "my-1 underline-offset-4" : "my-3 mx-1 underline-offset-8"} astro-HS64KC4U`, "class")}>
  <a${addAttribute(`/tags/${name}`, "href")}${addAttribute(`${size === "sm" ? "pr-1 text-sm" : "pr-2 text-lg"} group astro-HS64KC4U`, "class")}>
    <svg xmlns="http://www.w3.org/2000/svg"${addAttribute(`${size === "sm" ? " scale-75" : "scale-110"} astro-HS64KC4U`, "class")}><path d="M16.018 3.815 15.232 8h-4.966l.716-3.815-1.964-.37L8.232 8H4v2h3.857l-.751 4H3v2h3.731l-.714 3.805 1.965.369L8.766 16h4.966l-.714 3.805 1.965.369.783-4.174H20v-2h-3.859l.751-4H21V8h-3.733l.716-3.815-1.965-.37zM14.106 14H9.141l.751-4h4.966l-.752 4z" class="astro-HS64KC4U"></path>
    </svg>
    &nbsp;<span class="astro-HS64KC4U">${name}</span>
  </a>
</li>

`;
}, "S:/Programowanie/Covering letter page/src/components/Tag.astro");

const getUniqueTags = (posts) => {
  let tags = [];
  const filteredPosts = posts.filter(({ frontmatter }) => !frontmatter.draft);
  filteredPosts.forEach((post) => {
    tags = [...tags, ...post.frontmatter.tags].map((tag) => slugifyStr(tag)).filter(
      (value, index, self) => self.indexOf(value) === index
    );
  });
  return tags;
};

const $$Astro$2 = createAstro("S:/Programowanie/Covering letter page/src/pages/tags/index.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Index;
  const posts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../../contents/adding-new-post.md": () => Promise.resolve().then(() => __vite_glob_0_0),"../../contents/dynatrace.md": () => Promise.resolve().then(() => __vite_glob_0_1),"../../contents/lab-control.md": () => Promise.resolve().then(() => __vite_glob_0_2),"../../contents/master-born-junior-react.md": () => Promise.resolve().then(() => __vite_glob_0_3),"../../contents/voice-lab.md": () => Promise.resolve().then(() => __vite_glob_0_4)}), () => "../../contents/**/*.md");
  let tags = getUniqueTags(posts);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Tags | ${SITE.title}` }, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "activeNav": "tags" })}${renderComponent($$result, "Main", $$Main, { "pageTitle": "Tags", "pageDesc": "All the tags used in posts." }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<ul>
      ${tags.map((tag) => renderTemplate`${renderComponent($$result, "Tag", $$Tag, { "name": tag, "size": "lg" })}`)}
    </ul>` })}${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "S:/Programowanie/Covering letter page/src/pages/tags/index.astro");

const $$file$2 = "S:/Programowanie/Covering letter page/src/pages/tags/index.astro";
const $$url$2 = "/tags";

const _page6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const getPostsByTag = (posts, tag) => posts.filter((post) => slufigyAll(post.frontmatter.tags).includes(tag));

const $$Astro$1 = createAstro("S:/Programowanie/Covering letter page/src/pages/tags/[tag].astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const Astro = $$Astro$1;
async function getStaticPaths$1() {
  const posts = await Astro.glob(
    /* #__PURE__ */ Object.assign({"../../contents/adding-new-post.md": () => Promise.resolve().then(() => __vite_glob_0_0),"../../contents/dynatrace.md": () => Promise.resolve().then(() => __vite_glob_0_1),"../../contents/lab-control.md": () => Promise.resolve().then(() => __vite_glob_0_2),"../../contents/master-born-junior-react.md": () => Promise.resolve().then(() => __vite_glob_0_3),"../../contents/voice-lab.md": () => Promise.resolve().then(() => __vite_glob_0_4)}), () => "../../contents/**/*.md"
  );
  const tags = getUniqueTags(posts);
  return tags.map((tag) => {
    return {
      params: {
        tag
      },
      props: {
        tag
      }
    };
  });
}
const $$tag = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$tag;
  const { tag } = Astro2.props;
  const posts = await Astro2.glob(
    /* #__PURE__ */ Object.assign({"../../contents/adding-new-post.md": () => Promise.resolve().then(() => __vite_glob_0_0),"../../contents/dynatrace.md": () => Promise.resolve().then(() => __vite_glob_0_1),"../../contents/lab-control.md": () => Promise.resolve().then(() => __vite_glob_0_2),"../../contents/master-born-junior-react.md": () => Promise.resolve().then(() => __vite_glob_0_3),"../../contents/voice-lab.md": () => Promise.resolve().then(() => __vite_glob_0_4)}), () => "../../contents/**/*.md"
  );
  const tagPosts = getPostsByTag(posts, tag);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Tag:${tag} | ${SITE.title}` }, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "activeNav": "tags" })}${renderComponent($$result, "Main", $$Main, { "pageTitle": `Tag:${tag}`, "pageDesc": `All the articles with the tag "${tag}".` }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<ul>
      ${tagPosts.map(({ frontmatter }) => renderTemplate`${renderComponent($$result, "Card", Card, { "href": `/covering-letters/${slugify(frontmatter)}`, "post": frontmatter })}`)}
    </ul>` })}${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "S:/Programowanie/Covering letter page/src/pages/tags/[tag].astro");

const $$file$1 = "S:/Programowanie/Covering letter page/src/pages/tags/[tag].astro";
const $$url$1 = "/tags/[tag]";

const _page7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getStaticPaths: getStaticPaths$1,
	default: $$tag,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro = createAstro("S:/Programowanie/Covering letter page/src/pages/404.astro", "https://astro-paper.pages.dev/", "file:///S:/Programowanie/Covering%20letter%20page/");
const $$404 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$404;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `404 Not Found | ${SITE.title}`, "class": "astro-QQMISJOI" }, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "class": "astro-QQMISJOI" })}${maybeRenderHead($$result)}<main id="main-content" class="astro-QQMISJOI">
    <div class="not-found-wrapper astro-QQMISJOI">
      <h1 aria-label="404 Not Found" class="astro-QQMISJOI">404</h1>
      <span aria-hidden="true" class="astro-QQMISJOI">¯\\_(ツ)_/¯</span>
      <p class="astro-QQMISJOI">Page Not Found</p>
      ${renderComponent($$result, "LinkButton", $$LinkButton, { "href": "/", "className": "my-6 underline decoration-dashed underline-offset-8 text-lg astro-QQMISJOI" }, { "default": () => renderTemplate`
        Go back home
      ` })}
    </div>
  </main>${renderComponent($$result, "Footer", $$Footer, { "class": "astro-QQMISJOI" })}` })}

`;
}, "S:/Programowanie/Covering letter page/src/pages/404.astro");

const $$file = "S:/Programowanie/Covering letter page/src/pages/404.astro";
const $$url = "/404";

const _page8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$404,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const fetchFonts = async () => {
  const fontFileRegular = await fetch("https://www.1001fonts.com/download/font/ibm-plex-mono.regular.ttf");
  const fontRegular2 = await fontFileRegular.arrayBuffer();
  const fontFileBold = await fetch("https://www.1001fonts.com/download/font/ibm-plex-mono.bold.ttf");
  const fontBold2 = await fontFileBold.arrayBuffer();
  return {
    fontRegular: fontRegular2,
    fontBold: fontBold2
  };
};
// const {
//   fontRegular,
//   fontBold
// } = await fetchFonts();
const ogImage = (text) => {
  return /* @__PURE__ */ jsxs("div", {
    style: {
      background: "#fefbfb",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    children: [/* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        top: "-1px",
        right: "-1px",
        border: "4px solid #000",
        background: "#ecebeb",
        opacity: "0.9",
        borderRadius: "4px",
        display: "flex",
        justifyContent: "center",
        margin: "2.5rem",
        width: "88%",
        height: "80%"
      }
    }), /* @__PURE__ */ jsx("div", {
      style: {
        border: "4px solid #000",
        background: "#fefbfb",
        borderRadius: "4px",
        display: "flex",
        justifyContent: "center",
        margin: "2rem",
        width: "88%",
        height: "80%"
      },
      children: /* @__PURE__ */ jsxs("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          margin: "20px",
          width: "90%",
          height: "90%"
        },
        children: [/* @__PURE__ */ jsx("p", {
          style: {
            fontSize: 72,
            fontWeight: "bold",
            maxHeight: "84%",
            overflow: "hidden"
          },
          children: text
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "8px",
            fontSize: 28
          },
          children: [/* @__PURE__ */ jsxs("span", {
            children: ["by", " ", /* @__PURE__ */ jsx("span", {
              style: {
                color: "transparent"
              },
              children: '"'
            }), /* @__PURE__ */ jsx("span", {
              style: {
                overflow: "hidden",
                fontWeight: "bold"
              },
              children: SITE.author
            })]
          }), /* @__PURE__ */ jsx("span", {
            style: {
              overflow: "hidden",
              fontWeight: "bold"
            },
            children: SITE.title
          })]
        })]
      })
    })]
  });
};
const options = {
  width: 1200,
  height: 630,
  fonts: [{
    name: "IBM Plex Mono",
    data: fontRegular,
    weight: 400,
    style: "normal"
  }, {
    name: "IBM Plex Mono",
    data: fontBold,
    weight: 600,
    style: "normal"
  }]
};
const generateOgImage = async (mytext = SITE.title) => await satori(ogImage(mytext), options);
__astro_tag_component__(generateOgImage, "@astrojs/react");

const get = async ({ params }) => ({
  body: await generateOgImage(params.ogTitle)
});
const postImportResult = /* #__PURE__ */ Object.assign({"../contents/adding-new-post.md": __vite_glob_0_0,"../contents/dynatrace.md": __vite_glob_0_1,"../contents/lab-control.md": __vite_glob_0_2,"../contents/master-born-junior-react.md": __vite_glob_0_3,"../contents/voice-lab.md": __vite_glob_0_4




});
const posts = Object.values(postImportResult);
function getStaticPaths() {
  return posts.filter(({ frontmatter }) => !frontmatter.draft).filter(({ frontmatter }) => !frontmatter.ogImage).map(({ frontmatter }) => ({
    params: { ogTitle: frontmatter.title }
  }));
}

const _page9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	get,
	getStaticPaths
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([["src/pages/index.astro", _page0],["src/pages/covering-letters/index.astro", _page1],["src/pages/covering-letters/[slug].astro", _page2],["src/pages/rss.xml.ts", _page3],["src/pages/search.astro", _page4],["src/pages/about.md", _page5],["src/pages/tags/index.astro", _page6],["src/pages/tags/[tag].astro", _page7],["src/pages/404.astro", _page8],["src/pages/[ogTitle].svg.ts", _page9],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/react","clientEntrypoint":"@astrojs/react/client.js","serverEntrypoint":"@astrojs/react/server.js","jsxImportSource":"react"}, { ssr: _renderer1 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/netlify/functions","routes":[{"file":"","links":["assets/about.7a1656d3.css","assets/index.7e824969.css"],"scripts":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about.7a1656d3.css","assets/about.d95458a4.css","assets/_slug_.86cd12a9.css","assets/_slug_.002a5d9b.css"],"scripts":[],"routeData":{"route":"/covering-letters","type":"page","pattern":"^\\/covering-letters\\/?$","segments":[[{"content":"covering-letters","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/covering-letters/index.astro","pathname":"/covering-letters","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about.7a1656d3.css","assets/about.d95458a4.css","assets/_slug_.86cd12a9.css","assets/_slug_.0d2edc25.css","assets/_slug_.002a5d9b.css"],"scripts":[],"routeData":{"route":"/covering-letters/[slug]","type":"page","pattern":"^\\/covering-letters\\/([^/]+?)\\/?$","segments":[[{"content":"covering-letters","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/covering-letters/[slug].astro","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"routeData":{"route":"/rss.xml","type":"endpoint","pattern":"^\\/rss\\.xml$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.ts","pathname":"/rss.xml","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about.7a1656d3.css","assets/about.d95458a4.css","assets/_slug_.86cd12a9.css"],"scripts":[],"routeData":{"route":"/search","type":"page","pattern":"^\\/search\\/?$","segments":[[{"content":"search","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/search.astro","pathname":"/search","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about.d95458a4.css","assets/about.7a1656d3.css"],"scripts":[],"routeData":{"route":"/about","type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.md","pathname":"/about","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about.7a1656d3.css","assets/about.d95458a4.css","assets/_slug_.86cd12a9.css","assets/index.37914e3b.css"],"scripts":[],"routeData":{"route":"/tags","type":"page","pattern":"^\\/tags\\/?$","segments":[[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tags/index.astro","pathname":"/tags","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about.7a1656d3.css","assets/about.d95458a4.css","assets/_slug_.86cd12a9.css"],"scripts":[],"routeData":{"route":"/tags/[tag]","type":"page","pattern":"^\\/tags\\/([^/]+?)\\/?$","segments":[[{"content":"tags","dynamic":false,"spread":false}],[{"content":"tag","dynamic":true,"spread":false}]],"params":["tag"],"component":"src/pages/tags/[tag].astro","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about.7a1656d3.css","assets/404.74a65e68.css"],"scripts":[],"routeData":{"route":"/404","type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"routeData":{"route":"/[ogtitle]","type":"endpoint","pattern":"^\\/([^/]+?)\\.svg$","segments":[[{"content":"ogTitle","dynamic":true,"spread":false},{"content":".svg","dynamic":false,"spread":false}]],"params":["ogTitle"],"component":"src/pages/[ogTitle].svg.ts","_meta":{"trailingSlash":"ignore"}}}],"site":"https://astro-paper.pages.dev/","base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"one-dark-pro","wrap":true},"remarkPlugins":[null,[null,{"test":"Table of contents"}]],"rehypePlugins":[],"remarkRehype":{},"extendDefaultPlugins":true,"isAstroFlavoredMd":false,"isExperimentalContentCollections":false,"contentDir":"file:///S:/Programowanie/Covering%20letter%20page/src/content/"},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","@components/Search":"Search.5c7c5d2d.js","@astrojs/react/client.js":"client.cf5c7572.js","astro:scripts/before-hydration.js":""},"assets":["/assets/404.74a65e68.css","/assets/_slug_.0d2edc25.css","/assets/_slug_.002a5d9b.css","/assets/_slug_.86cd12a9.css","/assets/about.7a1656d3.css","/assets/about.d95458a4.css","/assets/index.7e824969.css","/assets/index.37914e3b.css","/astropaper-og.jpg","/client.cf5c7572.js","/favicon.svg","/robots.txt","/Search.5c7c5d2d.js","/toggle-theme.js","/assets/dev.svg","/assets/logo.png","/assets/logo.svg","/chunks/index.afa1ed75.js"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = {};

const _exports = adapter.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { handler, pageMap, renderers };
