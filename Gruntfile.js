module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-watch");

  var csv = require("csv");
  var fs = require("fs");

  grunt.initConfig({
    watch: {
      css: {
        files: ["*.less"],
        tasks: ["less", "build"],
        options: {
          spawn: true,

        }
      },
      rest: {
        files: ["*.js", "template.html"],
        tasks: ["build"],
        options: {
          spawn: true
        }
      }
    },
    less: {
      def: {
        src: "style.less",
        dest: "style.css"
      }
    }
  });

  grunt.registerTask("default", ["less", "build", "watch"]);

  grunt.registerTask("build", function() {
    var template = fs.readFileSync("template.html", { encoding: "utf8" });
    var script = fs.readFileSync("script.js", { encoding: "utf8" });
    var style = fs.readFileSync("style.css", { encoding: "utf8" });

    var coCSV = fs.readFileSync("companies.csv", { encoding: "utf8" });
    var parser = csv.parse({
      columns: true,
      auto_parse: true
    });
    var rows = [];
    parser.on("data", function(row) {
      rows.push(row);
    });
    parser.on("finish", function(all) {


    var output = grunt.template.process(template, {
      data: {
        js: script,
        css: style,
        companies: rows,
        content: '{{ content }}'
      }
    });
    fs.writeFileSync("../topcompanies-2014-table/frames/full.html", output);
    });
    parser.write(coCSV);
    parser.end();
  });

}