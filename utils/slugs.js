const slugs = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')   // Remove all non-word characters
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/-+/g, '-');           // Replace multiple - with single -
};

module.exports = slugs;
