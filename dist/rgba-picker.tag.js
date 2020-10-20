console.log('rgba-picker', import.meta.url);
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
		<div id='color'>
			<div id='hex' on-tap='copy'></div>
			<div id='dec' on-tap='copy'></div>
		</div>
		<input type="range" min="0" max="256" id="r">
		<input type="range" min="0" max="256" id="g">
		<input type="range" min="0" max="256" id="b">
		<input type="range" min="0" max="256" id="a">
	</main>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		/* border: 1px solid red; */
		/* background: #222; */
		font-family: publicSans, quicksand, Arial, Helvetica, sans-serif;
		border: 2px solid silver;
	}
	* {
		box-sizing: border-box;
	}
	input {
		padding: 0;
		margin: 0;
		/* border: 2px solid transparent; */
		/* margin-top: .3rem; */
		-webkit-appearance: none;
		width: 100%;
		height: 50px;
		/* background: #d3d3d3; */
		outline: none;
		/* border-radius: 50px; */
		/* background-image: linear-gradient(to right, hsl(0, 80%, 50%), hsl(20, 80%, 50%), hsl(40, 80%, 50%), hsl(60, 80%, 50%), hsl(80, 80%, 50%), hsl(100, 80%, 50%)); */
	}
	input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: black;
		border: 1px solid white;
		/* background-image: radial-gradient(circle, black, transparent); */
		border-radius: 100px;
		cursor: pointer;
	}
	#r::-webkit-slider-thumb {
		background: red;
	}
	#g::-webkit-slider-thumb {
		background: green;
	}
	#b::-webkit-slider-thumb {
		background: blue;
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
		border: 1px solid white;
		border-radius: 100px;
	}
	#r::-moz-range-thumb {
		background: red;
	}
	#g::-moz-range-thumb {
		background: green;
	}
	#b::-moz-range-thumb {
		background: blue;
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
		/* line-height: 50px; */
		font-size: 30px;
		/* border-radius: 10px; */
		text-align: center;
		cursor: pointer;
	}
	#color>div {
		padding: 30px
	}
	#color>div:hover {
		color: black;
	}
	h1 {
		text-align: center;
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
class rgba_picker extends WebTag {
		r = 50;
		g = 100;
		b = 200;
		a = 250;
		$onReady() {
			this.addListener('r');
			this.addListener('g');
			this.addListener('b');
			this.addListener('a');
			this.updateColor();
		}
		copy(node) {
			import('https://max.pub/lib/data.js').then(x => x.copy(node.innerHTML));
			this.$event('notification', { text: `copied\n${node.innerHTML}\nto clipboard` })
		}
		string(o = this) {
			return '#' + o.r.toString(16) + o.g.toString(16) + o.b.toString(16) + o.a.toString(16);
		}
		string2(o = this) {
			return `rgba(${o.r}, ${o.g}, ${o.b}, ${Math.round(o.a / 256 * 100)}%)`
		}
		updateColor() {
			this.$view.Q('#color', 1).style.background = this.string2();
			this.$view.Q('#color #hex', 1).innerHTML = this.string();
			this.$view.Q('#color #dec', 1).innerHTML = this.string2();
		}
		range(typ) {
			return new Array(9).fill(1).map((x, i) => ({ ...this, ...{ [typ]: i * 32 } }));
		}
		gradient(array) {
			return array.map(x => this.string2(x)).join(',');
		}
		updateGradient(typ) {
			this.$view.Q('#' + typ, 1).style.backgroundImage = `linear-gradient(to right, ${this.gradient(this.range(typ))})`;
		}
		addListener(typ) {
			this.$view.Q('#' + typ, 1).value = this[typ];
			this.updateGradient(typ);
			this.$view.Q('#' + typ, 1).addEventListener('input', event => {
				this[typ] = event.target.value * 1;
				this.updateGradient('r');
				this.updateGradient('g');
				this.updateGradient('b');
				this.updateGradient('a');
				this.updateColor();
			});
		}
	}
window.customElements.define('rgba-picker', rgba_picker)