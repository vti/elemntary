function translate(messages, locale, messageId) {
  const translated = locate(messages[locale], messageId);

  if (translated) return translated;

  const fallback = locate(messages.en, messageId);

  if (fallback) return fallback;

  return messageId;
}

function locate(root, messageId) {
  let parts = messageId.split(/\./);

  if (parts.length == 1) {
    return root[messageId];
  }

  let firstPart = parts.shift();

  if (root[firstPart]) return locate(root[firstPart], parts.join("."));

  return undefined;
}

module.exports = { translate };
