import {UID} from '@flexio-oss/js-helpers'
import {FlexEnum} from '@flexio-oss/flex-types'
import {HotballoonService} from '@flexio-oss/hotballoon'


const requestAFrame = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function(cb) {
    return setTimeout(cb, 16)
  }


/**
 * @readonly
 * @enum {NotificationLevel}
 */
class NotificationLevel extends FlexEnum {
  /**
   * @static
   * @property {NotificationLevel} INFO
   */
  /**
   * @static
   * @property {NotificationLevel} SUCCESS
   */
  /**
   * @static
   * @property {NotificationLevel} WARNING
   */
  /**
   * @static
   * @property {NotificationLevel} DANGER
   */

}


NotificationLevel.initEnum(['INFO', 'SUCCESS', 'WARNING', 'DANGER'])


export class NotifierBuilder {
  /**
   *
   * @param {ThemeStyle} value
   * @return {NotifierBuilder}
   */
  styles(value) {
    this.__styles = value
    return this
  }

  /**
   *
   * @param  {number} value
   * @return {NotifierBuilder}
   */
  duration(value) {
    this.__duration = value
    return this
  }

  constructor() {
    /**
     *
     * @type {?number}
     * @private
     */
    this.__duration = null
    /**
     *
     * @type {?ThemeStyle}
     * @private
     */
    this.__styles = null
  }

  /**
   *
   * @return {NotifierService}
   */
  build() {
    return new NotifierService(
      new Notifier(
        new NotifierConfig(
          this.__duration,
          this.__styles
        )
      )
    )
  }
}


class NotifierConfig {
  /**
   *
   * @return {ThemeStyle}
   */
  styles() {
    return this.__styles
  }

  /**
   *
   * @return {number}
   */
  duration() {
    return this.__duration
  }

  /**
   *
   * @param {number} duration
   * @param {ThemeStyle} styles
   */
  constructor(duration, styles) {

    /**
     *
     * @type {number}
     * @private
     */
    this.__duration = duration
    /**
     *
     * @type {ThemeStyle}
     * @private
     */
    this.__styles = styles
  }
}


class Notifier {
  /**
   *
   * @param {NotifierConfig} config
   */
  constructor(config) {
    /**
     *
     * @type {string}
     * @private
     */
    this.__id = UID()
    /**
     *
     * @type {NotifierConfig}
     * @private
     */
    this.__config = config

    /**
     *
     * @type {?Element}
     * @private
     */
    this.__container = null
    this.__buildContainer()
  }

  /**
   *
   * @param {Notification} notification
   */
  open(notification) {
    /**
     * @type {Element}
     */
    const node = this.__buildNode(notification)

    setTimeout(() => {
      this.__remove(node)
    }, this.__config.duration())
  }

  /**
   *
   * @private
   */
  __buildContainer() {
    const fragment = document.createDocumentFragment()
    const el = document.createElement('div')
    fragment.appendChild(el)

    el.classList.add(
      this.__config.styles().color().light(),
      this.__config.styles().fontStyle().semiBold(),
      this.__config.styles().fontSize().h5()
    )
    el.id = this.__id
    el.style.position = 'fixed'
    el.style.display = 'flex'
    el.style.flexDirection = 'column-reverse'
    el.style.zIndex = '10000'
    el.style.right = '1rem'
    el.style.bottom = '1rem'

    requestAFrame(() => {
      document.body.appendChild(fragment)
    })
    this.__container = el
  }

  /**
   *
   * @param {Notification} notification
   * @return {Element}
   * @private
   */
  __buildNode(notification) {
    const fragment = document.createDocumentFragment()
    const el = document.createElement('div')
    fragment.appendChild(el)
    el.innerText = notification.message()
    switch (notification.level()) {
      case NotificationLevel.INFO:
        el.classList.add(
          this.__config.styles().color().infoBg()
        )
        break
      case NotificationLevel.SUCCESS:
        el.classList.add(
          this.__config.styles().color().successBg()
        )
        break
      case NotificationLevel.WARNING:
        el.classList.add(
          this.__config.styles().color().warningBg()
        )
        break
      case NotificationLevel.DANGER:
        el.classList.add(
          this.__config.styles().color().dangerBg()
        )
        break
    }
    el.classList.add(
      this.__config.styles().elements().tag()
    )
    el.id = notification.id()
    el.style.position = 'relative'
    el.style.boxShadow = '0 0 6px rgba(0, 0, 0, 0.58) '
    el.style.width = '30rem'
    el.style.maxWidth = '90vw'
    el.style.margin = '0.5rem'
    el.style.padding = '0.8rem 1.5rem'

    this.__mount(fragment)
    return el
  }

  /**
   *
   * @param {Element} node
   * @return {Notifier}
   * @private
   */
  __remove(node) {
    requestAFrame(() => {
      this.__container.removeChild(node)
    })
    return this
  }

  /**
   *
   * @param {DocumentFragment} node
   * @return {Notifier}
   * @private
   */
  __mount(node) {
    requestAFrame(() => {
      this.__container.appendChild(node)
    })
    return this
  }

  remove() {
    document.body.removeChild(this.__container)
  }
}


const __notifier = Symbol('__notifier')


/**
 * @implements {HotballoonService}
 */
class NotifierService extends HotballoonService {
  /**
   *
   * @param {Notifier} notifier
   */
  constructor(notifier) {
    super()
    /**
     *
     * @type {Notifier}
     */
    this[__notifier] = notifier
  }

  /**
   *
   * @return {NotificationBuilder}
   */
  add() {
    return new NotificationBuilder(this[__notifier])
  }

  /**
   *
   * @return {string}
   */
  static name() {
    return 'NOTIFIER'
  }

  /**
   *
   * @return {string}
   */
  name() {
    return NotifierService.name()
  }

  remove() {
    return this[__notifier].remove()
  }
}
 export const SERVICE_NAME_NOTIFIER = NotifierService.name()

class NotificationBuilder {
  /**
   *
   * @param value
   * @return {NotificationBuilder}
   */
  message(value) {
    this.__message = value
    return this
  }

  /**
   *
   * @return {NotificationBuilder}
   */
  danger() {
    this.__level = NotificationLevel.DANGER
    return this
  }

  /**
   *
   * @return {NotificationBuilder}
   */
  info() {
    this.__level = NotificationLevel.INFO
    return this
  }

  /**
   *
   * @return {NotificationBuilder}
   */
  success() {
    this.__level = NotificationLevel.SUCCESS
    return this
  }

  /**
   *
   * @return {NotificationBuilder}
   */
  warning() {
    this.__level = NotificationLevel.WARNING
    return this
  }

  constructor(notifier) {
    /**
     *
     * @type {Notifier}
     */
    this[__notifier] = notifier
    /**
     *
     * @type {?string}
     * @private
     */
    this.__message = null
    /**
     *
     * @type {?NotificationLevel}
     * @private
     */
    this.__level = null
  }

  /**
   * @return {Notification}
   * @private
   */
  __build() {
    return new Notification(
      UID(),
      this.__level,
      this.__message
    )
  }

  buildAndNotify() {
    this[__notifier].open(this.__build())
  }
}


class Notification {
  /**
   *
   * @return {string}
   */
  id() {
    return this.__id
  }

  /**
   *
   * @return {NotificationLevel}
   */
  level() {
    return this.__level
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
   * @param {string} id
   * @param {NotificationLevel} level
   * @param {string} message
   */
  constructor(id, level, message) {

    /**
     *
     * @type {string}
     * @private
     */
    this.__id = id
    /**
     *
     * @type {NotificationLevel}
     * @private
     */
    this.__level = level
    /**
     *
     * @type {string}
     * @private
     */
    this.__message = message
  }
}

