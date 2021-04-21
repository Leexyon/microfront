const fs = require('fs')
const path = require('path')
const express = require('express')
var timeout = require("connect-timeout");
var { createProxyMiddleware }  = require('http-proxy-middleware')

const devServerBaseURL = 'http://192.168.1.2'
const devServerPort = 8098

const app = express();


app.use(timeout("120s"));
app.use('/css',express.static(path.join(__dirname, 'public/css')));

function createRenderer(bundle, options) {
    return createBundleRenderer(bundle, Object.assign(options, {
        runInNewContext: false
    }))
}

const templatePath = path.resolve(__dirname, './index.html')


if (process.env.NODE_ENV !== 'production') {
    app.use('/main*', createProxyMiddleware({
        target: `${devServerBaseURL}:${devServerPort}`,
        changeOrigin: true,
        pathRewrite: function (path) {
            return path.includes('main')
                ? '/main.js'
                : path
        },
        prependPath: false
    }))

    app.use('/*hot-update*', createProxyMiddleware({
        target: `${devServerBaseURL}:${devServerPort}`,
        changeOrigin: true
    }))


    app.use('/research*', createProxyMiddleware({
        target: `${devServerBaseURL}:${devServerPort}`,
        changeOrigin: true,
        timeout: 600000,
        pathRewrite: {
            "^/research": ""
        }
    }))

    app.use('/api*', createProxyMiddleware({
        target: `http://10.100.2.44:33514`,
        changeOrigin: true,
        timeout: 600000,

    }))

    app.use('/websocket', createProxyMiddleware({
        target: `${devServerBaseURL}:8099`,
        ws: true,
        changeOrigin: true,
        timeout: 600000,
        pathRewrite: {
            "^/websocket": ""
        }
    }))

}

app.use('/js', express.static(path.resolve(__dirname, './dist/js')))
app.use('/img', express.static(path.resolve(__dirname, './dist/img')))
app.use('/css', express.static(path.resolve(__dirname, './dist/css')))
app.use('/dist',express.static(path.join(__dirname, './dist')));

app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html')

    fs.readFile(templatePath, 'utf-8', function (err, data) {
            if (err) {
                throw err;
            }
            res.send(data)
        });


})


const port = process.env.PORT || 33500

app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})

