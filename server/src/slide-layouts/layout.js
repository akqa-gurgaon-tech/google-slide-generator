export function buildInsertTextRequests(placeholders, inputs) {
    const requests = [];
    for (const el of placeholders) {
        if (el.shape.placeholder.type === "CENTERED_TITLE" &&
            inputs.CENTERED_TITLE) {
            requests.push({
                insertText: {
                    objectId: el.objectId,
                    text: inputs.CENTERED_TITLE,
                    insertionIndex: 0,
                },
            });
        }
        else if (el.shape.placeholder.type === "SUBTITLE" && inputs.SUBTITLE) {
            requests.push({
                insertText: {
                    objectId: el.objectId,
                    text: inputs.SUBTITLE,
                    insertionIndex: 0,
                },
            });
        }
        else if (el.shape.placeholder.type === "TITLE" && inputs.TITLE) {
            requests.push({
                insertText: {
                    objectId: el.objectId,
                    text: inputs.TITLE,
                    insertionIndex: 0,
                },
            });
        }
        else if (el.shape.placeholder.type === "BODY" && inputs.BODY) {
            requests.push({
                insertText: {
                    objectId: el.objectId,
                    text: inputs.BODY,
                    insertionIndex: 0,
                },
            });
        }
        else if (el.objectId.endsWith("3") &&
            el.shape.placeholder.type === "BODY" &&
            inputs.RIGHT_COLUMN) {
            requests.push({
                insertText: {
                    objectId: el.objectId,
                    text: inputs.RIGHT_COLUMN,
                    insertionIndex: 0,
                },
            });
        }
        else if (el.shape.placeholder.type === "BODY" && inputs.LEFT_COLUMN) {
            requests.push({
                insertText: {
                    objectId: el.objectId,
                    text: inputs.LEFT_COLUMN,
                    insertionIndex: 0,
                },
            });
        }
    }
    return requests;
}
//# sourceMappingURL=layout.js.map