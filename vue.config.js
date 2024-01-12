module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000', // Die URL deines Backends
                changeOrigin: true
            }
        }
    }
};
