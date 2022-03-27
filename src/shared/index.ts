export const extend = Object.assign;
export const isObject = (val) => val !== null && typeof val === 'object';
export const hasChanged = (oldValue, newValue) => !Object.is(oldValue, newValue);
