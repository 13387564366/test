/**
 * Created by tenwa on 16/12/21.
 */

function Mime() {
    // Map of extension -> mime type
    this.types = Object.create(null);

    // Map of mime type -> extension
    this.extensions = Object.create(null);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * @param map (Object) type definitions
 */
Mime.prototype.define = function (map) {
    for (var type in map) {
        var exts = map[type];
        for (var i = 0; i < exts.length; i++) {
            if (process.env.DEBUG_MIME && this.types[exts]) {
                console.warn(this._loading.replace(/.*\//, ''), 'changes "' + exts[i] + '" extension type from ' +
                    this.types[exts] + ' to ' + type);
            }

            this.types[exts[i]] = type;
        }

        // Default extension is the first one we encounter
        if (!this.extensions[type]) {
            this.extensions[type] = exts[0];
        }
    }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.lookup = function(path, fallback) {
    var ext = path.replace(/.*[\.\/\\]/, '').toLowerCase();

    return this.types[ext] || fallback || this.default_type;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.extension = function(mimeType) {
    var type = mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();
    return this.extensions[type];
};

// Default instance
var mime = new Mime();

// Define built-in types
mime.define(require('./types.json'));

// Default type
mime.default_type = mime.lookup('bin');

//
// Additional API specific to the default instance
//

mime.Mime = Mime;

/**
 * Lookup a charset based on mime type.
 */
mime.charsets = {
    lookup: function(mimeType, fallback) {
        // Assume text types are utf8
        return (/^text\//).test(mimeType) ? 'UTF-8' : fallback;
    }
};

module.exports = mime;
