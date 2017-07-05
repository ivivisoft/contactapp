/**
 * Created by andy on 2017/6/20.
 */

describe("Demo", function () {
    beforeEach(function () {

    });
    afterEach(function () {

    });
    it("spine create array and determine someone is array or not", function () {
        var arr = Spine.makeArray(arguments);
        Spine.Log.log(Spine.isArray(arr));
        Spine.Log.logPrefix = "(andy's app):";
        Spine.Log.log("a","b","c");
    });
});
