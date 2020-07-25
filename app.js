process.chdir(__dirname);
const package_info = require("./package.json");
var software = package_info.name + " (V " + package_info.version + ")";
console.log(software);
console.log("===");
console.log();

const fs = require("fs");
const async = require("async");
const moment = require("moment");

/* Checking Example File for New Data! */
var config = require("dotenv").config({ path: ".env" });
var config_example = "";
if (fs.existsSync(".env")) {
  for (var attributename in config.parsed) {
    config_example += attributename + "=\r\n";
  }
  fs.writeFileSync(".env.example", config_example);
} else {
  console.error("Update .env File first!");
  process.exit(1);
}

var wordpress = require("wordpress");
var client = wordpress.createClient({
  url: process.env.WP_URL,
  username: process.env.WP_User,
  password: process.env.WP_Password,
});

var cron = require("node-cron");
cron.schedule("0 0 16 * * 0", () => {
  new_post_file("Twitter Selfie Collection", "/media/dropbox/IFTTT/Twitter/dailyselfie.txt", "T07:00:00");
  new_post_file("Twitter Favoriten", "/media/dropbox/IFTTT/Twitter/TwitterFav.txt", "T08:00:00");
});

function new_post_file(title, file, daytime) {
  if (!fs.existsSync(file)) {
    console.error(file + " - File not Exists!");
    return;
  }
  var contents = fs.readFileSync(file, "utf8");
  var date_next_post = moment().add(1, "days");
  var element = {
    type: "post",
    status: "future",
    date: date_next_post.format("YYYYMMDD") + daytime,
    title: title + " " + moment(date_next_post).format("DD.MM.YYYY"),
    content: contents,
    commentStatus: "open",
  };
  console.log(element);

  client.newPost(element, function (error, id) {
    if (error) {
      console.error(error);
      return;
    }
    fs.unlinkSync(file);
    console.log(element.title + " successfully created!");
  });
}
