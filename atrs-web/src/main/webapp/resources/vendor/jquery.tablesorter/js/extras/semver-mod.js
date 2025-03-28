/**
 Modified semver.js for node.js by R.Garrison (@Mottie)
 Original by @isaacs: https://github.com/isaacs/node-semver
 ( all modifications have been labeled )
 */
// ***** MODIFIED LINE BELOW *****
(function () {
    // ***** MODIFIED LINE BELOW *****
    var module = { exports: {} };

    // export the class if we are in a Node-like system.
    // ***** MODIFIED LINE BELOW *****
    // if (typeof module === 'object' && module.exports === exports)
    // ***** MODIFIED LINE BELOW *****
    var exports = (module.exports = SemVer);

    // The debug function is excluded entirely from the minified version.
    /* nomin */ var debug;
    /* nomin */ if (typeof process === "object" && /* nomin */ process.env && /* nomin */ process.env.NODE_DEBUG && /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
        /* nomin */ debug = function () {
            /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
            /* nomin */ args.unshift("SEMVER");
            /* nomin */ console.log.apply(console, args);
            /* nomin */
        };
    /* nomin */
    /* nomin */ else debug = function () {};

    // Note: this is the semver.org version of the spec that it implements
    // Not necessarily the package version of this code.
    exports.SEMVER_SPEC_VERSION = "2.0.0";

    // The actual regexps go on exports.re
    var re = (exports.re = []);
    var src = (exports.src = []);
    var R = 0;

    // The following Regular Expressions can be used for tokenizing,
    // validating, and parsing SemVer version strings.

    // ## Numeric Identifier
    // A single `0`, or a non-zero digit followed by zero or more digits.

    var NUMERICIDENTIFIER = R++;
    src[NUMERICIDENTIFIER] = "0|[1-9]\\d*";
    var NUMERICIDENTIFIERLOOSE = R++;
    src[NUMERICIDENTIFIERLOOSE] = "[0-9]+";

    // ## Non-numeric Identifier
    // Zero or more digits, followed by a letter or hyphen, and then zero or
    // more letters, digits, or hyphens.

    var NONNUMERICIDENTIFIER = R++;
    src[NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";

    // ## Main Version
    // Three dot-separated numeric identifiers.

    var MAINVERSION = R++;
    src[MAINVERSION] = "(" + src[NUMERICIDENTIFIER] + ")\\." + "(" + src[NUMERICIDENTIFIER] + ")\\." + "(" + src[NUMERICIDENTIFIER] + ")";

    var MAINVERSIONLOOSE = R++;
    src[MAINVERSIONLOOSE] = "(" + src[NUMERICIDENTIFIERLOOSE] + ")\\." + "(" + src[NUMERICIDENTIFIERLOOSE] + ")\\." + "(" + src[NUMERICIDENTIFIERLOOSE] + ")";

    // ## Pre-release Version Identifier
    // A numeric identifier, or a non-numeric identifier.

    var PRERELEASEIDENTIFIER = R++;
    src[PRERELEASEIDENTIFIER] = "(?:" + src[NUMERICIDENTIFIER] + "|" + src[NONNUMERICIDENTIFIER] + ")";

    var PRERELEASEIDENTIFIERLOOSE = R++;
    src[PRERELEASEIDENTIFIERLOOSE] = "(?:" + src[NUMERICIDENTIFIERLOOSE] + "|" + src[NONNUMERICIDENTIFIER] + ")";

    // ## Pre-release Version
    // Hyphen, followed by one or more dot-separated pre-release version
    // identifiers.

    var PRERELEASE = R++;
    src[PRERELEASE] = "(?:-(" + src[PRERELEASEIDENTIFIER] + "(?:\\." + src[PRERELEASEIDENTIFIER] + ")*))";

    var PRERELEASELOOSE = R++;
    src[PRERELEASELOOSE] = "(?:-?(" + src[PRERELEASEIDENTIFIERLOOSE] + "(?:\\." + src[PRERELEASEIDENTIFIERLOOSE] + ")*))";

    // ## Build Metadata Identifier
    // Any combination of digits, letters, or hyphens.

    var BUILDIDENTIFIER = R++;
    src[BUILDIDENTIFIER] = "[0-9A-Za-z-]+";

    // ## Build Metadata
    // Plus sign, followed by one or more period-separated build metadata
    // identifiers.

    var BUILD = R++;
    src[BUILD] = "(?:\\+(" + src[BUILDIDENTIFIER] + "(?:\\." + src[BUILDIDENTIFIER] + ")*))";

    // ## Full Version String
    // A main version, followed optionally by a pre-release version and
    // build metadata.

    // Note that the only major, minor, patch, and pre-release sections of
    // the version string are capturing groups.  The build metadata is not a
    // capturing group, because it should not ever be used in version
    // comparison.

    var FULL = R++;
    var FULLPLAIN = "v?" + src[MAINVERSION] + src[PRERELEASE] + "?" + src[BUILD] + "?";

    src[FULL] = "^" + FULLPLAIN + "$";

    // like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
    // also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
    // common in the npm registry.
    var LOOSEPLAIN = "[v=\\s]*" + src[MAINVERSIONLOOSE] + src[PRERELEASELOOSE] + "?" + src[BUILD] + "?";

    var LOOSE = R++;
    src[LOOSE] = "^" + LOOSEPLAIN + "$";

    var GTLT = R++;
    src[GTLT] = "((?:<|>)?=?)";

    // Something like "2.*" or "1.2.x".
    // Note that "x.x" is a valid xRange identifer, meaning "any version"
    // Only the first item is strictly required.
    var XRANGEIDENTIFIERLOOSE = R++;
    src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + "|x|X|\\*";
    var XRANGEIDENTIFIER = R++;
    src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + "|x|X|\\*";

    var XRANGEPLAIN = R++;
    src[XRANGEPLAIN] = "[v=\\s]*(" + src[XRANGEIDENTIFIER] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIER] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIER] + ")" + "(?:(" + src[PRERELEASE] + ")" + ")?)?)?";

    var XRANGEPLAINLOOSE = R++;
    src[XRANGEPLAINLOOSE] =
        "[v=\\s]*(" + src[XRANGEIDENTIFIERLOOSE] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")" + "(?:(" + src[PRERELEASELOOSE] + ")" + ")?)?)?";

    // >=2.x, for example, means >=2.0.0-0
    // <1.x would be the same as "<1.0.0-0", though.
    var XRANGE = R++;
    src[XRANGE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAIN] + "$";
    var XRANGELOOSE = R++;
    src[XRANGELOOSE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAINLOOSE] + "$";

    // Tilde ranges.
    // Meaning is "reasonably at or greater than"
    var LONETILDE = R++;
    src[LONETILDE] = "(?:~>?)";

    var TILDETRIM = R++;
    src[TILDETRIM] = "(\\s*)" + src[LONETILDE] + "\\s+";
    re[TILDETRIM] = new RegExp(src[TILDETRIM], "g");
    var tildeTrimReplace = "$1~";

    var TILDE = R++;
    src[TILDE] = "^" + src[LONETILDE] + src[XRANGEPLAIN] + "$";
    var TILDELOOSE = R++;
    src[TILDELOOSE] = "^" + src[LONETILDE] + src[XRANGEPLAINLOOSE] + "$";

    // Caret ranges.
    // Meaning is "at least and backwards compatible with"
    var LONECARET = R++;
    src[LONECARET] = "(?:\\^)";

    var CARETTRIM = R++;
    src[CARETTRIM] = "(\\s*)" + src[LONECARET] + "\\s+";
    re[CARETTRIM] = new RegExp(src[CARETTRIM], "g");
    var caretTrimReplace = "$1^";

    var CARET = R++;
    src[CARET] = "^" + src[LONECARET] + src[XRANGEPLAIN] + "$";
    var CARETLOOSE = R++;
    src[CARETLOOSE] = "^" + src[LONECARET] + src[XRANGEPLAINLOOSE] + "$";

    // A simple gt/lt/eq thing, or just "" to indicate "any version"
    var COMPARATORLOOSE = R++;
    src[COMPARATORLOOSE] = "^" + src[GTLT] + "\\s*(" + LOOSEPLAIN + ")$|^$";
    var COMPARATOR = R++;
    src[COMPARATOR] = "^" + src[GTLT] + "\\s*(" + FULLPLAIN + ")$|^$";

    // An expression to strip any whitespace between the gtlt and the thing
    // it modifies, so that `> 1.2.3` ==> `>1.2.3`
    var COMPARATORTRIM = R++;
    src[COMPARATORTRIM] = "(\\s*)" + src[GTLT] + "\\s*(" + LOOSEPLAIN + "|" + src[XRANGEPLAIN] + ")";

    // this one has to use the /g flag
    re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], "g");
    var comparatorTrimReplace = "$1$2$3";

    // Something like `1.2.3 - 1.2.4`
    // Note that these all use the loose form, because they'll be
    // checked against either the strict or loose comparator form
    // later.
    var HYPHENRANGE = R++;
    src[HYPHENRANGE] = "^\\s*(" + src[XRANGEPLAIN] + ")" + "\\s+-\\s+" + "(" + src[XRANGEPLAIN] + ")" + "\\s*$";

    var HYPHENRANGELOOSE = R++;
    src[HYPHENRANGELOOSE] = "^\\s*(" + src[XRANGEPLAINLOOSE] + ")" + "\\s+-\\s+" + "(" + src[XRANGEPLAINLOOSE] + ")" + "\\s*$";

    // Star ranges basically just allow anything at all.
    var STAR = R++;
    src[STAR] = "(<|>)?=?\\s*\\*";

    // Compile to actual regexp objects.
    // All are flag-free, unless they were created above with a flag.
    for (var i = 0; i < R; i++) {
        debug(i, src[i]);
        if (!re[i]) re[i] = new RegExp(src[i]);
    }

    exports.parse = parse;
    function parse(version, loose) {
        var r = loose ? re[LOOSE] : re[FULL];
        return r.test(version) ? new SemVer(version, loose) : null;
    }

    exports.valid = valid;
    function valid(version, loose) {
        var v = parse(version, loose);
        return v ? v.version : null;
    }

    exports.clean = clean;
    function clean(version, loose) {
        var s = parse(version, loose);
        return s ? s.version : null;
    }

    // ***** MODIFIED LINE BELOW *****
    window.semver = exports.SemVer = SemVer;

    function SemVer(version, loose) {
        if (version instanceof SemVer) {
            if (version.loose === loose) return version;
            else version = version.version;
        }

        if (!(this instanceof SemVer)) return new SemVer(version, loose);

        debug("SemVer", version, loose);
        this.loose = loose;
        var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

        if (!m) throw new TypeError("Invalid Version: " + version);

        this.raw = version;

        // these are actually numbers
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];

        // numberify any prerelease numeric ids
        if (!m[4]) this.prerelease = [];
        else
            this.prerelease = m[4].split(".").map(function (id) {
                return /^[0-9]+$/.test(id) ? +id : id;
            });

        this.build = m[5] ? m[5].split(".") : [];
        this.format();
    }

    SemVer.prototype.format = function () {
        this.version = this.major + "." + this.minor + "." + this.patch;
        if (this.prerelease.length) this.version += "-" + this.prerelease.join(".");
        return this.version;
    };

    SemVer.prototype.inspect = function () {
        return '<SemVer "' + this + '">';
    };

    SemVer.prototype.toString = function () {
        return this.version;
    };

    SemVer.prototype.compare = function (other) {
        debug("SemVer.compare", this.version, this.loose, other);
        if (!(other instanceof SemVer)) other = new SemVer(other, this.loose);

        return this.compareMain(other) || this.comparePre(other);
    };

    SemVer.prototype.compareMain = function (other) {
        if (!(other instanceof SemVer)) other = new SemVer(other, this.loose);

        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    };

    SemVer.prototype.comparePre = function (other) {
        if (!(other instanceof SemVer)) other = new SemVer(other, this.loose);

        // NOT having a prerelease is > having one
        if (this.prerelease.length && !other.prerelease.length) return -1;
        else if (!this.prerelease.length && other.prerelease.length) return 1;
        else if (!this.prerelease.lenth && !other.prerelease.length) return 0;

        var i = 0;
        do {
            var a = this.prerelease[i];
            var b = other.prerelease[i];
            debug("prerelease compare", i, a, b);
            if (a === undefined && b === undefined) return 0;
            else if (b === undefined) return 1;
            else if (a === undefined) return -1;
            else if (a === b) continue;
            else return compareIdentifiers(a, b);
        } while (++i);
    };

    SemVer.prototype.inc = function (release) {
        switch (release) {
            case "major":
                this.major++;
                this.minor = -1;
            case "minor":
                this.minor++;
                this.patch = -1;
            case "patch":
                this.patch++;
                this.prerelease = [];
                break;
            case "prerelease":
                if (this.prerelease.length === 0) this.prerelease = [0];
                else {
                    var i = this.prerelease.length;
                    while (--i >= 0) {
                        if (typeof this.prerelease[i] === "number") {
                            this.prerelease[i]++;
                            i = -2;
                        }
                    }
                    if (i === -1)
                        // didn't increment anything
                        this.prerelease.push(0);
                }
                break;

            default:
                throw new Error("invalid increment argument: " + release);
        }
        this.format();
        return this;
    };

    exports.inc = inc;
    function inc(version, release, loose) {
        try {
            return new SemVer(version, loose).inc(release).version;
        } catch (er) {
            return null;
        }
    }

    exports.compareIdentifiers = compareIdentifiers;

    var numeric = /^[0-9]+$/;
    function compareIdentifiers(a, b) {
        var anum = numeric.test(a);
        var bnum = numeric.test(b);

        if (anum && bnum) {
            a = +a;
            b = +b;
        }

        return anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : a > b ? 1 : 0;
    }

    exports.rcompareIdentifiers = rcompareIdentifiers;
    function rcompareIdentifiers(a, b) {
        return compareIdentifiers(b, a);
    }

    exports.compare = compare;
    function compare(a, b, loose) {
        return new SemVer(a, loose).compare(b);
    }

    exports.compareLoose = compareLoose;
    function compareLoose(a, b) {
        return compare(a, b, true);
    }

    exports.rcompare = rcompare;
    function rcompare(a, b, loose) {
        return compare(b, a, loose);
    }

    exports.sort = sort;
    function sort(list, loose) {
        return list.sort(function (a, b) {
            return exports.compare(a, b, loose);
        });
    }

    exports.rsort = rsort;
    function rsort(list, loose) {
        return list.sort(function (a, b) {
            return exports.rcompare(a, b, loose);
        });
    }

    exports.gt = gt;
    function gt(a, b, loose) {
        return compare(a, b, loose) > 0;
    }

    exports.lt = lt;
    function lt(a, b, loose) {
        return compare(a, b, loose) < 0;
    }

    exports.eq = eq;
    function eq(a, b, loose) {
        return compare(a, b, loose) === 0;
    }

    exports.neq = neq;
    function neq(a, b, loose) {
        return compare(a, b, loose) !== 0;
    }

    exports.gte = gte;
    function gte(a, b, loose) {
        return compare(a, b, loose) >= 0;
    }

    exports.lte = lte;
    function lte(a, b, loose) {
        return compare(a, b, loose) <= 0;
    }

    exports.cmp = cmp;
    function cmp(a, op, b, loose) {
        var ret;
        switch (op) {
            case "===":
                ret = a === b;
                break;
            case "!==":
                ret = a !== b;
                break;
            case "":
            case "=":
            case "==":
                ret = eq(a, b, loose);
                break;
            case "!=":
                ret = neq(a, b, loose);
                break;
            case ">":
                ret = gt(a, b, loose);
                break;
            case ">=":
                ret = gte(a, b, loose);
                break;
            case "<":
                ret = lt(a, b, loose);
                break;
            case "<=":
                ret = lte(a, b, loose);
                break;
            default:
                throw new TypeError("Invalid operator: " + op);
        }
        return ret;
    }

    exports.Comparator = Comparator;
    function Comparator(comp, loose) {
        if (comp instanceof Comparator) {
            if (comp.loose === loose) return comp;
            else comp = comp.value;
        }

        if (!(this instanceof Comparator)) return new Comparator(comp, loose);

        debug("comparator", comp, loose);
        this.loose = loose;
        this.parse(comp);

        if (this.semver === ANY) this.value = "";
        else this.value = this.operator + this.semver.version;
    }

    var ANY = {};
    Comparator.prototype.parse = function (comp) {
        var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
        var m = comp.match(r);

        if (!m) throw new TypeError("Invalid comparator: " + comp);

        this.operator = m[1];
        // if it literally is just '>' or '' then allow anything.
        if (!m[2]) this.semver = ANY;
        else {
            this.semver = new SemVer(m[2], this.loose);

            // <1.2.3-rc DOES allow 1.2.3-beta (has prerelease)
            // >=1.2.3 DOES NOT allow 1.2.3-beta
            // <=1.2.3 DOES allow 1.2.3-beta
            // However, <1.2.3 does NOT allow 1.2.3-beta,
            // even though `1.2.3-beta < 1.2.3`
            // The assumption is that the 1.2.3 version has something you
            // *don't* want, so we push the prerelease down to the minimum.
            if (this.operator === "<" && !this.semver.prerelease.length) {
                this.semver.prerelease = ["0"];
                this.semver.format();
            }
        }
    };

    Comparator.prototype.inspect = function () {
        return '<SemVer Comparator "' + this + '">';
    };

    Comparator.prototype.toString = function () {
        return this.value;
    };

    Comparator.prototype.test = function (version) {
        debug("Comparator.test", version, this.loose);
        return this.semver === ANY ? true : cmp(version, this.operator, this.semver, this.loose);
    };

    exports.Range = Range;
    function Range(range, loose) {
        if (range instanceof Range && range.loose === loose) return range;

        if (!(this instanceof Range)) return new Range(range, loose);

        this.loose = loose;

        // First, split based on boolean or ||
        this.raw = range;
        this.set = range
            .split(/\s*\|\|\s*/)
            .map(function (range) {
                return this.parseRange(range.trim());
            }, this)
            .filter(function (c) {
                // throw out any that are not relevant for whatever reason
                return c.length;
            });

        if (!this.set.length) {
            throw new TypeError("Invalid SemVer Range: " + range);
        }

        this.format();
    }

    Range.prototype.inspect = function () {
        return '<SemVer Range "' + this.range + '">';
    };

    Range.prototype.format = function () {
        this.range = this.set
            .map(function (comps) {
                return comps.join(" ").trim();
            })
            .join("||")
            .trim();
        return this.range;
    };

    Range.prototype.toString = function () {
        return this.range;
    };

    Range.prototype.parseRange = function (range) {
        var loose = this.loose;
        range = range.trim();
        debug("range", range, loose);
        // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
        var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
        range = range.replace(hr, hyphenReplace);
        debug("hyphen replace", range);
        // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
        range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range, re[COMPARATORTRIM]);

        // `~ 1.2.3` => `~1.2.3`
        range = range.replace(re[TILDETRIM], tildeTrimReplace);

        // `^ 1.2.3` => `^1.2.3`
        range = range.replace(re[CARETTRIM], caretTrimReplace);

        // normalize spaces
        range = range.split(/\s+/).join(" ");

        // At this point, the range is completely trimmed and
        // ready to be split into comparators.

        var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
        var set = range
            .split(" ")
            .map(function (comp) {
                return parseComparator(comp, loose);
            })
            .join(" ")
            .split(/\s+/);
        if (this.loose) {
            // in loose mode, throw out any that are not valid comparators
            set = set.filter(function (comp) {
                return !!comp.match(compRe);
            });
        }
        set = set.map(function (comp) {
            return new Comparator(comp, loose);
        });

        return set;
    };

    // Mostly just for testing and legacy API reasons
    exports.toComparators = toComparators;
    function toComparators(range, loose) {
        return new Range(range, loose).set.map(function (comp) {
            return comp
                .map(function (c) {
                    return c.value;
                })
                .join(" ")
                .trim()
                .split(" ");
        });
    }

    // comprised of xranges, tildes, stars, and gtlt's at this point.
    // already replaced the hyphen ranges
    // turn into a set of JUST comparators.
    function parseComparator(comp, loose) {
        debug("comp", comp);
        comp = replaceCarets(comp, loose);
        debug("caret", comp);
        comp = replaceTildes(comp, loose);
        debug("tildes", comp);
        comp = replaceXRanges(comp, loose);
        debug("xrange", comp);
        comp = replaceStars(comp, loose);
        debug("stars", comp);
        return comp;
    }

    function isX(id) {
        return !id || id.toLowerCase() === "x" || id === "*";
    }

    // ~, ~> --> * (any, kinda silly)
    // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
    // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
    // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
    // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
    // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
    function replaceTildes(comp, loose) {
        return comp
            .trim()
            .split(/\s+/)
            .map(function (comp) {
                return replaceTilde(comp, loose);
            })
            .join(" ");
    }

    function replaceTilde(comp, loose) {
        var r = loose ? re[TILDELOOSE] : re[TILDE];
        return comp.replace(r, function (_, M, m, p, pr) {
            debug("tilde", comp, _, M, m, p, pr);
            var ret;

            if (isX(M)) ret = "";
            else if (isX(m)) ret = ">=" + M + ".0.0-0 <" + (+M + 1) + ".0.0-0";
            else if (isX(p))
                // ~1.2 == >=1.2.0- <1.3.0-
                ret = ">=" + M + "." + m + ".0-0 <" + M + "." + (+m + 1) + ".0-0";
            else if (pr) {
                debug("replaceTilde pr", pr);
                if (pr.charAt(0) !== "-") pr = "-" + pr;
                ret = ">=" + M + "." + m + "." + p + pr + " <" + M + "." + (+m + 1) + ".0-0";
            }
            // ~1.2.3 == >=1.2.3-0 <1.3.0-0
            else ret = ">=" + M + "." + m + "." + p + "-0" + " <" + M + "." + (+m + 1) + ".0-0";

            debug("tilde return", ret);
            return ret;
        });
    }

    // ^ --> * (any, kinda silly)
    // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
    // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
    // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
    // ^1.2.3 --> >=1.2.3 <2.0.0
    // ^1.2.0 --> >=1.2.0 <2.0.0
    function replaceCarets(comp, loose) {
        return comp
            .trim()
            .split(/\s+/)
            .map(function (comp) {
                return replaceCaret(comp, loose);
            })
            .join(" ");
    }

    function replaceCaret(comp, loose) {
        var r = loose ? re[CARETLOOSE] : re[CARET];
        return comp.replace(r, function (_, M, m, p, pr) {
            debug("caret", comp, _, M, m, p, pr);
            var ret;

            if (isX(M)) ret = "";
            else if (isX(m)) ret = ">=" + M + ".0.0-0 <" + (+M + 1) + ".0.0-0";
            else if (isX(p)) {
                if (M === "0") ret = ">=" + M + "." + m + ".0-0 <" + M + "." + (+m + 1) + ".0-0";
                else ret = ">=" + M + "." + m + ".0-0 <" + (+M + 1) + ".0.0-0";
            } else if (pr) {
                debug("replaceCaret pr", pr);
                if (pr.charAt(0) !== "-") pr = "-" + pr;
                if (M === "0") {
                    if (m === "0") ret = "=" + M + "." + m + "." + p + pr;
                    else ret = ">=" + M + "." + m + "." + p + pr + " <" + M + "." + (+m + 1) + ".0-0";
                } else ret = ">=" + M + "." + m + "." + p + pr + " <" + (+M + 1) + ".0.0-0";
            } else {
                if (M === "0") {
                    if (m === "0") ret = "=" + M + "." + m + "." + p;
                    else ret = ">=" + M + "." + m + "." + p + "-0" + " <" + M + "." + (+m + 1) + ".0-0";
                } else ret = ">=" + M + "." + m + "." + p + "-0" + " <" + (+M + 1) + ".0.0-0";
            }

            debug("caret return", ret);
            return ret;
        });
    }

    function replaceXRanges(comp, loose) {
        debug("replaceXRanges", comp, loose);
        return comp
            .split(/\s+/)
            .map(function (comp) {
                return replaceXRange(comp, loose);
            })
            .join(" ");
    }

    function replaceXRange(comp, loose) {
        comp = comp.trim();
        var r = loose ? re[XRANGELOOSE] : re[XRANGE];
        return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
            debug("xRange", comp, ret, gtlt, M, m, p, pr);
            var xM = isX(M);
            var xm = xM || isX(m);
            var xp = xm || isX(p);
            var anyX = xp;

            if (gtlt === "=" && anyX) gtlt = "";

            if (gtlt && anyX) {
                // replace X with 0, and then append the -0 min-prerelease
                if (xM) M = 0;
                if (xm) m = 0;
                if (xp) p = 0;

                if (gtlt === ">") {
                    // >1 => >=2.0.0-0
                    // >1.2 => >=1.3.0-0
                    // >1.2.3 => >= 1.2.4-0
                    gtlt = ">=";
                    if (xM) {
                        // no change
                    } else if (xm) {
                        M = +M + 1;
                        m = 0;
                        p = 0;
                    } else if (xp) {
                        m = +m + 1;
                        p = 0;
                    }
                }

                ret = gtlt + M + "." + m + "." + p + "-0";
            } else if (xM) {
                // allow any
                ret = "*";
            } else if (xm) {
                // append '-0' onto the version, otherwise
                // '1.x.x' matches '2.0.0-beta', since the tag
                // *lowers* the version value
                ret = ">=" + M + ".0.0-0 <" + (+M + 1) + ".0.0-0";
            } else if (xp) {
                ret = ">=" + M + "." + m + ".0-0 <" + M + "." + (+m + 1) + ".0-0";
            }

            debug("xRange return", ret);

            return ret;
        });
    }

    // Because * is AND-ed with everything else in the comparator,
    // and '' means "any version", just remove the *s entirely.
    function replaceStars(comp, loose) {
        debug("replaceStars", comp, loose);
        // Looseness is ignored here.  star is always as loose as it gets!
        return comp.trim().replace(re[STAR], "");
    }

    // This function is passed to string.replace(re[HYPHENRANGE])
    // M, m, patch, prerelease, build
    // 1.2 - 3.4.5 => >=1.2.0-0 <=3.4.5
    // 1.2.3 - 3.4 => >=1.2.0-0 <3.5.0-0 Any 3.4.x will do
    // 1.2 - 3.4 => >=1.2.0-0 <3.5.0-0
    function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
        if (isX(fM)) from = "";
        else if (isX(fm)) from = ">=" + fM + ".0.0-0";
        else if (isX(fp)) from = ">=" + fM + "." + fm + ".0-0";
        else from = ">=" + from;

        if (isX(tM)) to = "";
        else if (isX(tm)) to = "<" + (+tM + 1) + ".0.0-0";
        else if (isX(tp)) to = "<" + tM + "." + (+tm + 1) + ".0-0";
        else if (tpr) to = "<=" + tM + "." + tm + "." + tp + "-" + tpr;
        else to = "<=" + to;

        return (from + " " + to).trim();
    }

    // if ANY of the sets match ALL of its comparators, then pass
    Range.prototype.test = function (version) {
        if (!version) return false;
        for (var i = 0; i < this.set.length; i++) {
            if (testSet(this.set[i], version)) return true;
        }
        return false;
    };

    function testSet(set, version) {
        for (var i = 0; i < set.length; i++) {
            if (!set[i].test(version)) return false;
        }
        return true;
    }

    exports.satisfies = satisfies;
    function satisfies(version, range, loose) {
        try {
            range = new Range(range, loose);
        } catch (er) {
            return false;
        }
        return range.test(version);
    }

    exports.maxSatisfying = maxSatisfying;
    function maxSatisfying(versions, range, loose) {
        return (
            versions
                .filter(function (version) {
                    return satisfies(version, range, loose);
                })
                .sort(function (a, b) {
                    return rcompare(a, b, loose);
                })[0] || null
        );
    }

    exports.validRange = validRange;
    function validRange(range, loose) {
        try {
            // Return '*' instead of '' so that truthiness works.
            // This will throw if it's invalid anyway
            return new Range(range, loose).range || "*";
        } catch (er) {
            return null;
        }
    }

    // Determine if version is less than all the versions possible in the range
    exports.ltr = ltr;
    function ltr(version, range, loose) {
        return outside(version, range, "<", loose);
    }

    // Determine if version is greater than all the versions possible in the range.
    exports.gtr = gtr;
    function gtr(version, range, loose) {
        return outside(version, range, ">", loose);
    }

    exports.outside = outside;
    function outside(version, range, hilo, loose) {
        version = new SemVer(version, loose);
        range = new Range(range, loose);

        var gtfn, ltefn, ltfn, comp, ecomp;
        switch (hilo) {
            case ">":
                gtfn = gt;
                ltefn = lte;
                ltfn = lt;
                comp = ">";
                ecomp = ">=";
                break;
            case "<":
                gtfn = lt;
                ltefn = gte;
                ltfn = gt;
                comp = "<";
                ecomp = "<=";
                break;
            default:
                throw new TypeError('Must provide a hilo val of "<" or ">"');
        }

        // If it satisifes the range it is not outside
        if (satisfies(version, range, loose)) {
            return false;
        }

        // From now on, variable terms are as if we're in "gtr" mode.
        // but note that everything is flipped for the "ltr" function.

        for (var i = 0; i < range.set.length; ++i) {
            var comparators = range.set[i];

            var high = null;
            var low = null;

            comparators.forEach(function (comparator) {
                high = high || comparator;
                low = low || comparator;
                if (gtfn(comparator.semver, high.semver, loose)) {
                    high = comparator;
                } else if (ltfn(comparator.semver, low.semver, loose)) {
                    low = comparator;
                }
            });

            // If the edge version comparator has a operator then our version
            // isn't outside it
            if (high.operator === comp || high.operator === ecomp) {
                return false;
            }

            // If the lowest version comparator has an operator and our version
            // is less than it then it isn't higher than the range
            if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
                return false;
            } else if (low.operator === ecomp && ltfn(version, low.semver)) {
                return false;
            }
        }
        return true;
    }

    // Use the define() function if we're in AMD land
    if (typeof define === "function" && define.amd) define(exports);
    // ***** MODIFIED LINE BELOW *****
})();
