const separatorPattern = /[\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]+/g;

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(separatorPattern, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

