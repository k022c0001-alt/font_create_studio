async function requestJson(url, init = {}) {
    const response = await fetch(url, init);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    if (response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
export function getJson(url) {
    return requestJson(url);
}
export function postJson(url, body) {
    return requestJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}
export function patchJson(url, body) {
    return requestJson(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}
export function deleteJson(url) {
    return requestJson(url, { method: 'DELETE' });
}
