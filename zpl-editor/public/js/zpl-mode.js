/**
 * CodeMirror mode for ZPL (Zebra Programming Language)
 */
(function(mod) {
    mod(CodeMirror);
})(function(CodeMirror) {

    CodeMirror.defineMode("zpl", function() {
        return {
            startState: function() { return { inComment: false }; },
            token: function(stream, state) {
                // Comments ^FX
                if (stream.match(/\^FX/)) {
                    stream.skipToEnd();
                    return "comment";
                }

                // Start/End format
                if (stream.match(/\^XA|\^XZ/)) return "keyword";

                // Tilde commands
                if (stream.match(/~[A-Z][A-Z0-9]?/)) return "builtin";

                // Barcode commands
                if (stream.match(/\^B[0-9A-Z]/)) return "variable-2";

                // Graphic commands
                if (stream.match(/\^G[A-Z]/)) return "variable-3";

                // Field commands
                if (stream.match(/\^F[A-Z]/)) return "atom";

                // Font/format commands
                if (stream.match(/\^[A-Z][A-Z0-9]?/)) return "def";

                // Numbers
                if (stream.match(/[0-9]+(\.[0-9]+)?/)) return "number";

                // Caret
                if (stream.match(/\^/)) return "operator";

                // Strings after ^FD
                stream.next();
                return null;
            }
        };
    });

    CodeMirror.defineMIME("text/x-zpl", "zpl");
});
