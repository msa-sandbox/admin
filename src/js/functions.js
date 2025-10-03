export function getEnv(key, fallback = undefined) {
    // global __ENV__ should be set within vite.config.js
    if (typeof __ENV__ !== 'undefined' && __ENV__[key] !== undefined) {
        return __ENV__[key]
    }

    return fallback
}
