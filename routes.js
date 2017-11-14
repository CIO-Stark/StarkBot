(function () {
    "use strict";

    module.exports = function (app, modules) {
        require("./routes/crawler")(app, modules);
        require("./routes/profile")(app, modules);

        app.get("/", function (req, res) {
            res.send({
            	status: true
            });
        });
    };
}());