/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const urlLocal = "https://localhost:3000/";
const hostDev = "https://dev-mai-mind-map.azurewebsites.net";
const hostProd = "https://mai-mind-map.azurewebsites.net";
const urlDev = hostDev + "/addin/";
const urlProd = hostProd + "/addin/";

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      taskpane: ["./src/taskpane/taskpane.ts", "./src/taskpane/taskpane.html"],
      commands: "./src/commands/commands.ts",
      landing: "./src/landing-page/landing-page.ts",
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, "../mai-mind-map-se/dist/addin/"),
    },
    resolve: {
      extensions: [".ts", ".html", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [["@babel/preset-env"]],
              },
            },
            {
              loader: "ts-loader",
            },
          ],
        },
        {
          test: /\.m?jsx?$/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [["@babel/preset-env"]],
              },
            },
          ],
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content.toString().replace(new RegExp(urlLocal, "g"), urlProd);
              }
            },
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "-dev" + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content
                  .toString()
                  .replace('DefaultValue="Mind Map"', 'DefaultValue="Mind Map (Dev)"')
                  .replace(new RegExp(hostProd, "g"), hostDev)
                  .replace(new RegExp(urlLocal, "g"), urlDev);
              }
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"],
      }),
      new HtmlWebpackPlugin({
        filename: "landing-page.html",
        template: "./src/landing-page/landing-page.html",
        chunks: ["polyfill", "landing"],
      }),
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
      proxy: [
        {
          context: ["/api", "/auth/signin", "/auth/signout", "/auth/redirect", "/users", "/cookie", "/edit"],
          target: "http://localhost:2999",
          secure: false,
        },
      ],
    },
  };

  return config;
};
