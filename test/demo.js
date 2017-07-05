/**
 * Created by andy on 2017/6/21.
 */
(function(){
    var Spine;
    if (typeof exports !== "undefined") {
        Spine = exports;
    } else {
        Spine = this.Spine = {};
    }
    var makeArray = Spine.makeArray = function(args){
        return Array.prototype.slice.call(args, 0);
    };

    var isArray = Spine.isArray = function(value){
        return Object.prototype.toString.call(value) === "[object Array]";
    };
    var Log = Spine.Log = {
        trace: true,

        logPrefix: "(App)",

        log: function(){
            if ( !this.trace ) return;
            if (typeof console === "undefined") return;
            var args = makeArray(arguments);
            if (this.logPrefix) args.unshift(this.logPrefix);
            console.log.apply(console, args);
            return this;
        }
    };
})();

