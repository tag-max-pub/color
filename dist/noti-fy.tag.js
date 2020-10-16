console.log('noti-fy', import.meta.url);
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
HTML.innerHTML = ``;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		position: absolute;
		top: var(--top);
		bottom: var(--bottom);
		left: var(--left);
		right: var(--right);
		font-family: Arial, Helvetica, sans-serif;
	}
	div {
		background: var(--back-main,silver);
		/* color: white; */
		padding: .5rem;
		margin: .5rem;
		white-space: pre;
	}`));
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
	get $frame() {  // attributes
		return new Proxy(
			Object.fromEntries(Array.from(this.attributes).map(x => [x.nodeName, x.nodeValue])),
			{
				set: (target, key, value) => {
					this.setAttribute(key, value);
					return Reflect.set(target, key, value);
				}
			}
		)
	}
};
class noti_fy extends WebTag {
		$onReady() {
			window.addEventListener('notification', e => this.show(e.detail))
		}
		show(x) {
			console.log('show notification', x);
			let noti = NODE('div', { part: 'noti' }, x.text);
			this.$view.appendChild(noti);
			setTimeout(e => this.$view.removeChild(noti), this.$frame.timeout ?? 1000)
		}
	}
window.customElements.define('noti-fy', noti_fy)