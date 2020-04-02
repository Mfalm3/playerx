import { extend } from '../utils/object.js';
import { camelCase, kebabCase } from '../utils/string.js';

export function customElement(defaults, element) {
  const { defaultProps, reflect, readonly } = defaults;
  const instance = {};
  const _props = {};
  let changedProps = {};
  let reflectingProps;
  let updatePromise = Promise.resolve();
  let hasRequestedUpdate;
  let ignoreAttributeChange;
  let ignorePropChange;

  function init() {
    Object.keys(defaultProps).forEach(name => {
      Object.defineProperty(instance, name, {
        get: () => {
          const value = element._getProp(name);
          return value == null ? defaultProps[name] : value;
        },
        set: value => {
          if (name in readonly) return;

          const oldValue = _props[name];
          _props[name] = value;
          requestUpdate(name, oldValue);
        },
        configurable: true,
        enumerable: true
      });
    });
  }

  function requestUpdate(name, oldValue) {
    let shouldRequestUpdate = true;
    if (name) {
      if (_props[name] == oldValue) {
        shouldRequestUpdate = false;
      } else {
        changedProps[name] = oldValue;

        if (!ignorePropChange && name in reflect) {
          if (!reflectingProps) reflectingProps = {};
          reflectingProps[name] = defaultProps[name];
        }
      }
    }

    if (!hasRequestedUpdate && shouldRequestUpdate) {
      hasRequestedUpdate = true;
      updatePromise = enqueueUpdate();
    }
  }

  async function enqueueUpdate() {
    await updatePromise;
    performUpdate();
  }

  function performUpdate() {
    update();
    element._update(changedProps);
    markUpdated();
  }

  function update() {
    if (reflectingProps) {
      ignoreAttributeChange = true;

      Object.keys(reflectingProps).forEach(propToAttr);
      reflectingProps = undefined;

      ignoreAttributeChange = false;
    }
  }

  function markUpdated() {
    changedProps = {};
    hasRequestedUpdate = false;
  }

  function propToAttr(propName) {
    let value = _props[propName];
    if (value === undefined || !(propName in reflect)) return;

    if (value == null || value === false) {
      element.removeAttribute(kebabCase(propName));
    } else {
      if (isBooleanProp(propName)) value = '';
      element.setAttribute(kebabCase(propName), '' + value);
    }
  }

  function isBooleanProp(propName) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
    // Boolean attributes are considered to be true if they're present on
    // the element at all, regardless of their actual value; as a rule,
    // you should specify the empty string ("") in value.
    return defaultProps[propName] === false || defaultProps[propName] === true;
  }

  function refresh(name, value) {
    ignoreAttributeChange = true;

    _props[name] = value;
    propToAttr(name);

    ignoreAttributeChange = false;
  }

  function _connected() {
    // body...
  }

  function _disconnected() {
    // body...
  }

  function _attributeChanged(name, oldValue, value) {
    if (ignoreAttributeChange) {
      return;
    }
    if (oldValue !== value) {
      ignorePropChange = true;

      const propName = camelCase(name);
      element[propName] = attrToProp(propName, value);

      ignorePropChange = false;
    }
  }

  function attrToProp(propName, value) {
    const defaultPropValue = defaultProps[propName];
    if (defaultPropValue === false || defaultPropValue === true) {
      return value != null;
    } else if (value != null && typeof defaultPropValue === 'number') {
      return Number(value);
    }
    return value;
  }

  const methods = {
    _connected,
    _disconnected,
    _attributeChanged,
    _props,
    refresh,
  };

  init();

  return extend(instance, methods);
}
