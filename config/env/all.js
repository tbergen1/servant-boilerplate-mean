module.exports = {
    app: {
        name: "Servant Texter",
        description: '"Text Message Tools For Your Servant"',
        keywords: "servant, content, cloud, cms, data, blog, products, events",
        port: 8080,
        servant_connect_url: "https://www.servant.co/connect/oauth2/authorize?response_type=code&client_id=" + process.env.SERVANT_CLIENT_ID
    }
}