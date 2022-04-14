export const extend = Object.assign;

export const isObject = (val) => val !== null && typeof val === 'object';

export const hasChanged = (oldValue, newValue) => !Object.is(oldValue, newValue);

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const camelize = (str: string) =>
  str.replace(/\-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));

export const toHandleKey = (str: string) => (str ? `on${capitalize(str)}` : 'on');

export const EMPTY_OBJ = {};

export const isArray = (val) => Array.isArray(val);

export const isString = (val) => typeof val === 'string';
