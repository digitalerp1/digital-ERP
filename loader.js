async function loadComponents(componentsMap) {
    const fetchPromises = [];

    for (const [placeholderId, componentPath] of Object.entries(componentsMap)) {
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            const promise = fetch(componentPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ${componentPath}`);
                    }
                    return response.text();
                })
                .then(html => {
                    placeholder.outerHTML = html;
                })
                .catch(error => console.error(error));
            fetchPromises.push(promise);
        }
    }

    await Promise.all(fetchPromises);
    document.dispatchEvent(new Event('componentsLoaded'));
}
