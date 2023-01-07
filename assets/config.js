config = {
    serverDiscoveryUri: 'https://vladimirkhil.com/api/si/servers',
    rootUri: '/',
    ads: '<b>Test ad</b>',
    rewriteUrl: true,
    apiUri: 'https://vladimirkhil.com/api/si',
    forceHttps: false,
    useMessagePackProtocol: false,
    registerServiceWorker: false,
};

firebaseConfig = null;

onLoad = function () {
    console.log('SI Online successfully loaded!');
};
