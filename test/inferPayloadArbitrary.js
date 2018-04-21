import * as fc from 'fast-check';

// Create an arbitrary based on an incoming payload
export const inferPayloadArbitrary = (payload, orString, withDeletedKeys) => {
  const wrapArb = orString === true ? arb => fc.oneof(arb, fc.string()) : arb => arb;
  switch (typeof payload) {
    case 'boolean':
      return wrapArb(fc.boolean());
    case 'number':
      return wrapArb(fc.integer());
    case 'undefined':
      return wrapArb(fc.constant(undefined));
    case 'array':
      return wrapArb(k, fc.generic_tuple(...payload[k].map(v => inferPayloadArbitrary(v, orString, withDeletedKeys))));
    case 'string':
      return wrapArb(fc.string());
    case 'object':
      if (payload === null) return fc.constant(null);
      const recordConfiguration = {};
      for (const k of Object.keys(payload)) {
        recordConfiguration[k] = inferPayloadArbitrary(payload[k], orString, withDeletedKeys);
      }
      return fc.record(recordConfiguration, { withDeletedKeys });
  }
  return fc.constant(undefined);
};
