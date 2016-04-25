Handlebars.registerPartial("header", Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<header><div data-action=\"opensidemenu\"></div><div class=\"logo\"></div><div data-action=\"index\"></div></header>";
},"useData":true}));
this["MyApp"] = this["MyApp"] || {};
this["MyApp"]["templates"] = this["MyApp"]["templates"] || {};
this["MyApp"]["templates"]["index"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials.header,depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + ((stack1 = this.invokePartial(partials.search,depth0,{"name":"search","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "<ul class=\"search-results\" id=\"searchResults\"></ul>\n";
},"usePartial":true,"useData":true});
Handlebars.registerPartial("notifiers", Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <div class=\"notifiers\" >\n        <ul>\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.messages : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </ul>\n    </div>\n";
},"2":function(depth0,helpers,partials,data) {
    return "                <li>"
    + this.escapeExpression(this.lambda(depth0, depth0))
    + "</li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.messages : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true}));
this["MyApp"]["templates"]["signUp"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<h1>Welcome to</h1>\n<img src=\"img/logo-light.png\" class=\"logo\"/>\n<form data-action=\"validate\">\n    <label for=\"phonenumber\">\n        <input type=\"text\" name=\"telephone\" id=\"phonenumber\" placeholder=\"Phone number\"/>\n    </label>\n    <p>Enter your phone number to create a secure account.</p>\n    <input type=\"submit\" value=\"Next\" class=\"btn btn-light btn-block\"/>\n</form>\n<p class=\"absolute-bottom\" data-action=\"welcome\">Already have an account?</p>\n<p class=\"skip\" data-action=\"skip\">Skip ></p>";
},"useData":true});
Handlebars.registerPartial("search", Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<section class=\"search\">\n    <p>Where are you going?</p>\n    <div class=\"searchIcon\"></div><input type=\"text\" id=\"searchInput\" placeholder=\"Search by street address\"/><a data-action=\"clearsearchinput\"></a>\n</section>";
},"useData":true}));
this["MyApp"]["templates"]["skip"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<h1>Are you sure?</h1>\n<p>By signing up, you are creating a unique and secure ID. Plus you will gain access to extra unique features and benefits.</p>\n<img class=\"center-icon\" src=\"img/icons/chat-heart.svg\"/>\n<button class=\"btn btn-light btn-block\" data-action=\"signUp\">Back</button>\n<a class=\"skip\" data-action=\"registerguest\">Skip anyway ></a>";
},"useData":true});
this["MyApp"]["templates"]["verify"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<p>A verification code has been sent to you by text message.</p>\n<a data-action=\"resendValidationCode\">Send it again</a>\n<img class=\"center-icon\" src=\"img/icons/envelope-icon.svg\"/>\n<form data-action=\"checkValidation\">\n    <label for=\"verificationCode\">\n        <input type=\"text\" name=\"verificationCode\" id=\"verificationCode\" placeholder=\"Verification Code\"/>\n    </label>\n    <input type=\"submit\" value=\"Next\" class=\"btn btn-light btn-block\"/>\n</form>\n<p class=\"back\" data-action=\"signUp\">< Back</p>";
},"useData":true});