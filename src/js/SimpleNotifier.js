import {Sequence, UID} from '@flexio-oss/js-helpers'
import {HotballoonService} from '@flexio-oss/hotballoon'


export class SimpleNotifierBuilder {
  /**
   *
   * @param {ThemeStyle} value
   */
  styles(value) {
    this.__styles = value
    return this
  }

  /**
   *
   * @param {string} value
   * @return {SimpleNotifierBuilder}
   */
  message(value) {
    this.__message = value
    return this
  }

  constructor() {
    /**
     *
     * @type {?string}
     * @private
     */
    this.__message = null
    /**
     *
     * @type {?ThemeStyle}
     * @private
     */
    this.__styles = null
  }

  /**
   *
   * @return {SimpleNotifierPublic}
   */
  build() {
    return new SimpleNotifierPublic(
      new SimpleNotifier(
        new SimpleNotifierConfig(this.__message, this.__styles)
      )
    )
  }
}


class SimpleNotifierConfig {
  /**
   *
   * @return {ThemeStyle}
   */
  styles() {
    return this.__styles
  }

  /**
   *
   * @return {string}
   */
  message() {
    return this.__message
  }

  /**
   *
   * @param {string} message
   * @param {ThemeStyle} styles
   */
  constructor(message, styles) {
    /**
     *
     * @type {string}
     * @private
     */
    this.__message = message
    /**
     *
     * @type {ThemeStyle}
     * @private
     */
    this.__styles = styles

  }
}


/**
 * @implements {HotballoonService}
 */
class SimpleNotifier {
  /**
   *
   * @param {SimpleNotifierConfig} config
   */
  constructor(config) {
    /**
     *
     * @type {SimpleNotifierConfig}
     * @private
     */
    this.__config = config
    /**
     *
     * @type {string}
     * @private
     */
    this.__id = UID()

    /**
     *
     * @type {Set<string>}
     * @private
     */
    this.__stack = new Set()
    /**
     *
     * @type {Sequence}
     * @private
     */
    this.__sequence = new Sequence(this.__id + '--')

    /**
     *
     * @type {HTMLDivElement}
     * @private
     */
    this.__element = this.__buildView()
    /**
     *
     * @type {boolean}
     * @private
     */
    this.__showed = false
  }

  /**
   *
   * @return {string}
   */
  static name() {
    return 'SIMPLE_NOTIFIER'
  }

  /**
   *
   * @return {string}
   */
  name() {
    return SimpleNotifier.name()
  }

  remove() {
    this.__stack.clear()
    document.body.removeChild(this.__element)
  }

  /**
   *
   * @return {Notifying}
   */
  open() {
    const token = this.__sequence.nextID()
    this.__stack.add(token)
    this.__ensureView()
    return new Notifying(this, token)
  }

  /**
   *
   * @param {string} token
   */
  close(token) {
    this.__stack.delete(token)
    this.__ensureView()
  }

  /**
   *
   * @return {SimpleNotifier}
   */
  clear() {
    this.__stack.clear()
    this.__ensureView()
    return this
  }

  /**
   *
   * @return {HTMLDivElement}
   * @private
   */
  __buildView() {
    const fragment = document.createDocumentFragment()
    const el = document.createElement('div')
    fragment.appendChild(el)
    el.innerText = this.__config.message()
    el.classList.add(
      this.__config.styles().color().primaryBg(),
      this.__config.styles().color().light(),
      this.__config.styles().fontSize().small(),
      this.__config.styles().elements().tag()
    )
    el.id = this.__id
    el.style.position = 'fixed'
    el.style.zIndex = '10000'
    el.style.right = '1rem'
    el.style.top = '1rem'
    el.style.padding = '0.3rem 0.8rem'
    el.style.transform = 'scale(0)'
    el.setAttribute('aria-hidden', 'true')
    document.body.appendChild(fragment)
    return el
  }

  __ensureView() {
    if (this.__showed && this.__stack.size === 0) {
      this.__hide()
      this.__showed = false
    } else if (!this.__showed && this.__stack.size > 0) {
      this.__show()
      this.__showed = true
    }
  }

  /**
   *
   * @return {SimpleNotifier}
   * @private
   */
  __show() {
    this.__element.style.transform = 'scale(1)'
    this.__element.setAttribute('aria-hidden', 'false')
    return this
  }

  /**
   *
   * @return {SimpleNotifier}
   * @private
   */
  __hide() {
    this.__element.style.transform = 'scale(0)'
    this.__element.setAttribute('aria-hidden', 'true')
    return this
  }
}


const __simpleNotifier = Symbol('__simpleNotifier')


/**
 * @implements {HotballoonService}
 */
class SimpleNotifierPublic extends HotballoonService {

  /**
   *
   * @param {SimpleNotifier} loader
   */
  constructor(loader) {
    super()
    /**
     *
     * @type {SimpleNotifier}
     */
    this[__simpleNotifier] = loader
  }

  /**
   *
   * @return {SimpleNotifierPublic}
   */
  clear() {
    this[__simpleNotifier].clear()
    return this
  }

  /**
   *
   * @return {Notifying}
   */
  open() {
    return this[__simpleNotifier].open()
  }

  /**
   *
   * @return {string}
   */
  static name() {
    return SimpleNotifier.name()
  }

  /**
   *
   * @return {string}
   */
  name() {
    return this[__simpleNotifier].name()
  }

  remove() {
    return this[__simpleNotifier].remove()
  }

}


class Notifying {

  /**
   *
   * @param {SimpleNotifier} simpleNotifier
   * @param {string} token
   */
  constructor(simpleNotifier, token) {
    /**
     *
     * @type {string}
     * @private
     */
    this.__token = token
    /**
     *
     * @type {SimpleNotifier}
     */
    this[__simpleNotifier] = simpleNotifier
  }

  close() {
    this[__simpleNotifier].close(this.__token)
  }

  /**
   *
   * @return {string}
   */
  token() {
    return this.__token
  }
}


export const SERVICE_NAME = SimpleNotifier.name()
