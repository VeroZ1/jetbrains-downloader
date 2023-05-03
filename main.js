const JetBrainsDownloader = require('./jetbrains-downloader');

const products = ['IIU', 'DG', 'RD', 'PCP', 'GO', 'CL', 'PS'];
for (let product of products) {
    // Usage
    const downloader = new JetBrainsDownloader(product, 'latest');
    downloader.download();
}