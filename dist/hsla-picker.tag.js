console.log('hsla-picker', import.meta.url);
function NODE(name, attributes = {}, children = []) {
	let node = document.createElement(name);
	for (let key in attributes)
		node.setAttribute(key, attributes[key]);
	for (let child of children)
		node.appendChild(typeof child == 'string' ? document.createTextNode(child) : child);
	return node;
}
class XML {
	static parse(string, type = 'xml') {
		return new DOMParser().parseFromString(string.replace(/xmlns=".*?"/g, ''), 'text/' + type)
	}
	static stringify(DOM) {
		return new XMLSerializer().serializeToString(DOM).replace(/xmlns=".*?"/g, '')
	}
}
XMLDocument.prototype.stringify = XML.stringify
Element.prototype.stringify = XML.stringify
const HTML = document.createElement('template');
HTML.innerHTML = `<main>
		<!-- <h1>HSLA picker</h1> -->
		<!-- <div id='hsl'></div> -->
		<div id='color' on-tap='copy'></div>
		<input type="range" min="0" max="360" id="h">
		<input type="range" min="0" max="100" id="s">
		<input type="range" min="0" max="100" id="l">
		<input type="range" min="0" max="100" id="a">
	</main>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		/* border: 1px solid red; */
		/* background: #222; */
		font-family: Arial, Helvetica, sans-serif;
	}
	* {
		box-sizing: border-box;
	}
	input {
		padding: 0;
		margin-top: .3rem;
		-webkit-appearance: none;
		width: 100%;
		height: 40px;
		/* background: #d3d3d3; */
		outline: none;
		border-radius: 50px;
		/* background-image: linear-gradient(to right, hsl(0, 80%, 50%), hsl(20, 80%, 50%), hsl(40, 80%, 50%), hsl(60, 80%, 50%), hsl(80, 80%, 50%), hsl(100, 80%, 50%)); */
	}
	input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: black;
		border: 3px solid white;
		/* background-image: radial-gradient(circle, black, transparent); */
		border-radius: 100px;
		cursor: pointer;
	}
	input:hover::-webkit-slider-thumb {
		/* border-color: black; */
		/* background: white; */
	}
	input::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: black;
		cursor: pointer;
		border: 3px solid white;
		border-radius: 100px;
	}
	:focus,
	:active,
	::-moz-focus-inner,
	::-moz-focus-outer,
	:-moz-focusring {
		border: 0 !important;
		outline: none !important;
		/* -moz-outline-style: none !important; */
		color: transparent;
	}
	#color {
		width: 100%;
		height: 200px;
		line-height: 200px;
		font-size: 30px;
		border-radius: 10px;
		text-align: center;
		cursor: pointer;
	}
	#color:hover {
		color: black;
	}`));
function QQ(query, i) {
	let result = Array.from(this.querySelectorAll(query));
	return i ? result?.[i - 1] : result;
}
Element.prototype.Q = QQ
ShadowRoot.prototype.Q = QQ
DocumentFragment.prototype.Q = QQ
class WebTag extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
	}
	async connectedCallback() {
		this.$applyHTML(); //: HTML
		this.$attachMutationObservers();
		this.$attachEventListeners();
		this.$onReady(); //: onReady
	}
	$attachMutationObservers() {
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
			} else {
			}
		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
	}
	$attachEventListeners() {
		let action = (event, key) => {
			try {
				let target = event.composedPath()[0];
				let action = target.closest(`[${key}]`);
				this[action.getAttribute(key)](action, event, target)
			}
			catch { }
		}
		this.addEventListener('click', e => action(e, 'on-tap')); //: onTap
	}
	$applyHTML() {
		this.$view = HTML.content.cloneNode(true)
	}
	$clear(R) {
		while (R.lastChild)
			R.removeChild(R.lastChild);
	}
	get $view() {
		return this.$HTM;
	}
	set $view(HTML) {
		this.$clear(this.$view);
		if (typeof HTML == 'string')
			HTML = new DOMParser().parseFromString(HTML, 'text/html').firstChild
		this.$view.appendChild(HTML);
	}
	$event(name, options) {
		this.dispatchEvent(new CustomEvent(name, {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: options
		}));
	}
};
class hsla_picker extends WebTag {
		h = 180;
		s = 50;
		l = 50;
		a = 90;
		$onReady() {
			this.addListener('h');
			this.addListener('s');
			this.addListener('l');
			this.addListener('a');
			this.updateColor();
		}
		copy(node) {
			import('https://max.pub/lib/data.js').then(x => x.copy(node.innerHTML));
			this.$event('notification', { text: `copied\n${node.innerHTML}\nto clipboard` })
		}
		string(o = this) {
			return `hsla(${o.h}, ${o.s}%, ${o.l}%, ${o.a}%)`
		}
		updateColor() {
			let hsl = this.string();
			this.$view.Q('#color', 1).style.background = hsl;
			this.$view.Q('#color', 1).innerHTML = hsl;
		}
		range(typ) {
			return new Array(typ == 'h' ? 36 : 10).fill(1).map((x, i) => ({ ...this, ...{ [typ]: i * 10 } }));
		}
		gradient(array) {
			return array.map(x => this.string(x)).join(','); //`hsla(${x.h}, ${x.s}%, ${x.l}%, ${x.a}%)`
		}
		updateGradient(typ) {
			this.$view.Q('#' + typ, 1).style.backgroundImage = `linear-gradient(to right, ${this.gradient(this.range(typ))})`;
		}
		addListener(typ) {
			this.$view.Q('#' + typ, 1).value = this[typ];
			this.updateGradient(typ);
			this.$view.Q('#' + typ, 1).addEventListener('input', event => {
				this[typ] = event.target.value;
				this.updateGradient('h');
				this.updateGradient('s');
				this.updateGradient('l');
				this.updateGradient('a');
				this.updateColor();
			});
		}
	}
window.customElements.define('hsla-picker', hsla_picker)