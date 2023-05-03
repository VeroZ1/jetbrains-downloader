const https = require('https');
const fs = require('fs');
const download = require('download');
const path = require("path");

class JetBrainsDownloader {
    constructor(productCode, release) {
        this.productCode = productCode;
        this.release = release;
    }

    async download() {
        const downloadPath = './downloads';
        const url = await this.getUrl();
        if (!url) {
            console.error('Failed to get download URL.');
            return;
        }

        const filename = this.getFilename(url);
        if (fs.existsSync(path.join(downloadPath, filename))) {
            console.log('File exists ' + filename);
            return;
        }
        console.log(`Downloading ${filename}...`);
        download(url, downloadPath).then(() => {
            console.log(`Downloaded ${filename}`);
        })
            .catch(reason => {
                console.log(`Download failed: ${filename} ${reason}`);
            });
    }

    async getUrl() {
        const productsUrl = 'https://data.services.jetbrains.com/products?fields=code,name';
        let downloadUrl = '';

        try {
            const response = await this.request(productsUrl);
            const products = JSON.parse(response);
            const product = products.find(p => p.code === this.productCode);
            if (!product) {
                console.error(`Failed to find product for code: ${this.productCode}`);
                return null;
            }

            const releasesUrl = `https://data.services.jetbrains.com/products/releases?code=${product.code}&latest=true&type=release&build=&_=${new Date().getTime()}`;
            console.log(releasesUrl);
            const releasesResponse = await this.request(releasesUrl);
            const versions = JSON.parse(releasesResponse)[product.code];
            // Shit here
            /*if (this.release !== 'latest') {
                const version = versions.find(v => v.version === this.release);

                if (!version) {
                    console.error(`Failed to find release version: ${this.release}`);
                    return null;
                }
            }*/

            downloadUrl = versions[0].downloads['windows'].link;
            console.log(downloadUrl);
        } catch (error) {
            console.error(`Failed to get download URL: ${error}`);
            return null;
        }

        return `${downloadUrl}`;
    }

    request(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let response = '';

                res.on('data', (chunk) => {
                    response += chunk;
                });

                res.on('end', () => {
                    resolve(response);
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    getFilename(url) {
        const parts = url.split('/');
        return parts[parts.length - 1];
    }
}

module.exports = JetBrainsDownloader;