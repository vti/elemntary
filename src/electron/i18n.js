function translate(messages, locale, messageId) {
  if (!messages[locale]) {
    locale = locale.split("-")[0];

    if (!messages[locale]) locale = "en";
  }

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
